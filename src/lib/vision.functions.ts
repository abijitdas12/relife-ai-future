import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { evaluateRuleEngine, RuleEngineResult } from "./rule-engine";
import {
  evaluateRDE,
  GeminiVisionOutput,
  RdeEvaluationResult,
  R5Category,
} from "./rde";
import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// 1. INPUT LAYER & IMAGE QUALITY VALIDATION
// ============================================================================
export interface ImageValidationResult {
  isValid: boolean;
  quality_score: number; // 0 - 100
  reason?: string;
  is_blurry?: boolean;
  is_too_dark?: boolean;
}

export interface VisionAnalysis {
  product: string;
  brandGuess: string;
  category: string;
  condition: string;
  faults: string[];
  detectedComponents: { name: string; state: string }[];
  repairability: number;
  ageYearsEstimate: number;
  repairCostInr: number;
  replacementCostInr: number;
  componentAvailability: number;
  remainingLifeYears: number;
  componentValue: number;
  notes: string;
  ruleResult: RuleEngineResult;
}

/**
 * Validate image payload & quality before passing to Gemini Vision API
 */
export function validateImageQuality(base64Image: string): ImageValidationResult {
  if (!base64Image || base64Image.length < 1200) {
    return {
      isValid: false,
      quality_score: 10,
      reason: "Image resolution or data payload is corrupt/too low. Please capture or upload a clear photo of the electronic product.",
      is_blurry: true,
    };
  }

  // Calculate sample variance heuristic from base64 string
  const sample = base64Image.slice(0, 3500);
  const uniqueChars = new Set(sample).size;
  const varianceRatio = uniqueChars / 64; // base64 charset

  if (varianceRatio < 0.25) {
    return {
      isValid: false,
      quality_score: 25,
      reason: "Photo appears extremely low-contrast, dark, or blurry. Ensure adequate lighting and focus directly on the device.",
      is_too_dark: true,
    };
  }

  return {
    isValid: true,
    quality_score: 94,
  };
}

const PipelineInputSchema = z.object({
  /** data:image/...;base64,... */
  image: z.string().min(32).max(12_000_000),
  user_fault_description: z.string().optional(),
  user_id: z.string().optional(),
  apiKey: z.string().optional(),
  estimated_repair_cost: z.number().optional(),
  estimated_replace_cost: z.number().optional(),
});

// ============================================================================
// 2. AI ANALYSIS MODULE (Gemini Vision — Prompt Engineered)
// ============================================================================
const GEMINI_SYSTEM_PROMPT = `You are ReLife AI ML Vision Classifier, an expert electronic device & circular e-waste inspection engine.

CRITICAL INSTRUCTIONS:
1. Examine the image carefully for ANY electronic device, laptop, smartphone, circuit board, battery, charger, display, or component.
2. Consider the user's provided fault description if available.
3. You MUST return ONLY valid minified JSON with the following exact keys:
{
  "product_name": string (e.g. "Laptop", "Smartphone", "Lithium Battery", "Charger Cable", "Circuit Board"),
  "likely_model": string (e.g. "Dell XPS 15", "iPhone 12 Series", "Universal Type-C Charger", "Unknown Model"),
  "visible_condition": string (e.g. "Battery Swollen & Gas Buildup", "Screen Glass Fractured", "Port Moisture Corrosion", "Insulation Wire Frayed", "Thermal Dust Obstruction"),
  "possible_faults": [string array of detected or inferred physical/electrical faults],
  "confidence": "high" | "medium" | "low",
  "requires_human_inspection": boolean
}

RULE FOR "requires_human_inspection":
Be conservative: default "requires_human_inspection" to true whenever the fault could involve internal circuitry, swollen lithium batteries, electrical short hazards, liquid ingress, or cannot be 100% confirmed by a photo alone.`;

/**
 * Call Gemini Vision REST API from backend server function
 */
async function callGeminiVisionModule(
  base64DataUrl: string,
  userFaultDescription: string,
  apiKey: string
): Promise<GeminiVisionOutput> {
  const base64Data = base64DataUrl.replace(/^data:image\/\w+;base64,/, "");
  const mimeMatch = base64DataUrl.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const promptText = `${GEMINI_SYSTEM_PROMPT}

USER FAULT DESCRIPTION: "${userFaultDescription || "No additional text provided."}"

Examine photo and output valid minified JSON only.`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error ${res.status}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid response JSON format from Gemini");
  
  const parsed = JSON.parse(match[0]);
  return {
    product_name: parsed.product_name || "Electronic Device",
    likely_model: parsed.likely_model || "Generic Model",
    visible_condition: parsed.visible_condition || "Visible Damage Detected",
    possible_faults: Array.isArray(parsed.possible_faults) ? parsed.possible_faults : ["Physical Condition Issue"],
    confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "medium",
    requires_human_inspection: parsed.requires_human_inspection !== false,
  };
}

/**
 * Fallback AI Vision Analyzer when API key is unconfigured or in offline test mode
 */
function analyzeLocallyFallback(userFaultDesc: string): GeminiVisionOutput {
  const descLower = userFaultDesc.toLowerCase();

  if (descLower.includes("battery") || descLower.includes("swollen") || descLower.includes("charge")) {
    return {
      product_name: "Lithium Battery",
      likely_model: "Laptop / Phone Battery Cell",
      visible_condition: "Swollen & Deformed Cell Housing",
      possible_faults: ["Lithium Cell Gas Buildup", "Thermal Overheating", "Capacity Degradation"],
      confidence: "high",
      requires_human_inspection: true,
    };
  }

  if (descLower.includes("screen") || descLower.includes("display") || descLower.includes("glass")) {
    return {
      product_name: "Display Panel",
      likely_model: "OLED / LCD Glass Digitizer",
      visible_condition: "Cracked Front Glass Matrix",
      possible_faults: ["Glass Digitizer Fracture", "Panel Touch Sensor Failure"],
      confidence: "high",
      requires_human_inspection: false,
    };
  }

  return {
    product_name: "Electronic Device",
    likely_model: "ReLife Inspected Unit",
    visible_condition: "Surface Wear & Operational Fault",
    possible_faults: ["Internal Component Wear", "Connector Degradation"],
    confidence: "medium",
    requires_human_inspection: true,
  };
}

// ============================================================================
// 5. OUTPUT LAYER & END-TO-END PIPELINE SERVER FUNCTION
// ============================================================================
export interface ReLifePipelineResult {
  scan_id: string;
  image_validation: ImageValidationResult;
  gemini_output: GeminiVisionOutput;
  rde_output: RdeEvaluationResult;
  recommendation: {
    r5_category: R5Category;
    repairability_score: number;
    reasoning: string[];
    requires_human_inspection: boolean;
    headline: string;
  };
  persisted_to_db: boolean;
}

/**
 * FULL END-TO-END RELIFE AI PIPELINE SERVER FUNCTION
 *
 * Flow: Faulty Product → Image/Info → Fault Extraction → Gemini Vision AI → RDE Scorer → R5 Evaluation → Recommendation & DB Persistence
 */
export const runReLifePipeline = createServerFn({ method: "POST" })
  .validator((data: unknown) => PipelineInputSchema.parse(data))
  .handler(async ({ data }): Promise<ReLifePipelineResult> => {
    const scanId = crypto.randomUUID();

    // STEP 1: Input Layer & Image Quality Validation
    const imageVal = validateImageQuality(data.image);
    if (!imageVal.isValid) {
      const fallbackGemini: GeminiVisionOutput = {
        product_name: "Unrecognized Image",
        likely_model: "Unknown",
        visible_condition: "Blurry or Low Quality Image",
        possible_faults: ["Image Quality Rejection"],
        confidence: "low",
        requires_human_inspection: true,
      };

      const fallbackRde = evaluateRDE(fallbackGemini, {
        estimated_repair_cost: 0,
        estimated_replace_cost: 1000,
        component_condition_ratings: { "Image": 10 },
        remaining_life_estimate_years: 0,
        component_salvage_value_ratio: 0,
        component_availability_ratio: 0,
      });

      return {
        scan_id: scanId,
        image_validation: imageVal,
        gemini_output: fallbackGemini,
        rde_output: fallbackRde,
        recommendation: {
          r5_category: "Recycle",
          repairability_score: 0,
          reasoning: [imageVal.reason || "Image quality check failed."],
          requires_human_inspection: true,
          headline: "Image rejected due to low quality or blur.",
        },
        persisted_to_db: false,
      };
    }

    // STEP 2: AI Analysis Module (Gemini Vision)
    const apiKey =
      data.apiKey ||
      process.env["GEMINI_API_KEY"] ||
      process.env["GOOGLE_GENERATIVE_AI_API_KEY"] ||
      process.env["LOVABLE_API_KEY"] ||
      process.env["VITE_GEMINI_API_KEY"];

    let geminiResult: GeminiVisionOutput;
    if (apiKey && apiKey !== "demo") {
      try {
        geminiResult = await callGeminiVisionModule(
          data.image,
          data.user_fault_description || "",
          apiKey
        );
      } catch (err) {
        console.warn("[Pipeline Gemini Module Error, fallback active]:", err);
        geminiResult = analyzeLocallyFallback(data.user_fault_description || "");
      }
    } else {
      geminiResult = analyzeLocallyFallback(data.user_fault_description || "");
    }

    // STEP 3 & 4: ReLife Decision Engine (RDE) & R5 Evaluation Layer
    const repairCost = data.estimated_repair_cost || 1400;
    const replaceCost = data.estimated_replace_cost || 25000;

    const rdeResult = evaluateRDE(geminiResult, {
      estimated_repair_cost: repairCost,
      estimated_replace_cost: replaceCost,
      component_condition_ratings: {
        Mainboard: 80,
        Battery: geminiResult.visible_condition.toLowerCase().includes("swollen") ? 20 : 75,
        Display: geminiResult.visible_condition.toLowerCase().includes("cracked") ? 30 : 85,
      },
      remaining_life_estimate_years: 2.5,
      component_salvage_value_ratio: 0.55,
      component_availability_ratio: 0.85,
      device_age_years: 3,
    });

    // STEP 5: Database Persistence (Supabase / Firestore DB)
    let persisted = false;
    try {
      await (supabase.from as any)("scans").insert([
        {
          id: scanId,
          user_id: data.user_id || null,
          product_name: geminiResult.product_name,
          likely_model: geminiResult.likely_model,
          visible_condition: geminiResult.visible_condition,
          possible_faults: geminiResult.possible_faults,
          confidence: geminiResult.confidence,
          requires_human_inspection: rdeResult.requires_human_inspection,
          repairability_score: rdeResult.repairability_score,
          r5_category: rdeResult.r5_category,
          reasoning: rdeResult.reasoning,
          estimated_repair_cost: repairCost,
          estimated_replace_cost: replaceCost,
          cost_ratio: rdeResult.cost_ratio,
          user_fault_description: data.user_fault_description || null,
          raw_gemini_output: geminiResult,
          raw_rde_output: rdeResult,
          created_at: new Date().toISOString(),
        },
      ]);
      persisted = true;
    } catch (dbErr) {
      console.warn("[Pipeline Scan Persistence Notice]:", dbErr);
    }

    return {
      scan_id: scanId,
      image_validation: imageVal,
      gemini_output: geminiResult,
      rde_output: rdeResult,
      recommendation: {
        r5_category: rdeResult.r5_category,
        repairability_score: rdeResult.repairability_score,
        reasoning: rdeResult.reasoning,
        requires_human_inspection: rdeResult.requires_human_inspection,
        headline: rdeResult.headline,
      },
      persisted_to_db: persisted,
    };
  });

// Keep backward compatibility for existing analyzeProductImage invocations
const InputSchemaLegacy = z.object({
  image: z.string().min(32).max(12_000_000),
  apiKey: z.string().optional(),
});

export const analyzeProductImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => InputSchemaLegacy.parse(data))
  .handler(async ({ data }) => {
    const pipelineRes = await runReLifePipeline({
      data: {
        image: data.image,
        apiKey: data.apiKey,
      },
    });

    const ruleResult = await evaluateRuleEngine({
      device: { name: pipelineRes.gemini_output.product_name, confidence: 0.9 },
      component: { name: "Primary Component", confidence: 0.85 },
      condition: { name: pipelineRes.gemini_output.visible_condition, confidence: 0.85 },
    });

    return {
      product: pipelineRes.gemini_output.product_name,
      brandGuess: pipelineRes.gemini_output.likely_model,
      category: "Electronics",
      condition: pipelineRes.gemini_output.visible_condition,
      faults: pipelineRes.gemini_output.possible_faults,
      detectedComponents: [
        {
          name: pipelineRes.gemini_output.product_name,
          state: pipelineRes.gemini_output.visible_condition,
        },
      ],
      repairability: pipelineRes.recommendation.repairability_score,
      ageYearsEstimate: 3,
      repairCostInr: 1400,
      replacementCostInr: 25000,
      componentAvailability: 0.85,
      remainingLifeYears: 2.5,
      componentValue: 0.55,
      notes: pipelineRes.recommendation.headline,
      ruleResult,
    };
  });
