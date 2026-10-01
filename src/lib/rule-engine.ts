import { supabase } from "@/integrations/supabase/client";

export type FiveRAction = "Reduce" | "Reuse" | "Retrieve" | "Redesign" | "Recycle";
export type SeverityLevel = "High" | "Medium" | "Low";

export interface MLPrediction {
  device: { name: string; confidence: number };
  component: { name: string; confidence: number };
  condition: { name: string; confidence: number };
}

export interface RuleEngineResult {
  lowConfidence: boolean;
  confidenceMessage?: string;
  prediction: MLPrediction;
  fault: string;
  severity: SeverityLevel;
  five_r: FiveRAction;
  recommendation: string;
  safety_warning: string;
  disclaimer: string;
}

// Built-in Knowledge Base Rules (Fallback & Fast Local Lookup)
const KNOWLEDGE_BASE_RULES: Array<{
  device: string;
  component: string;
  condition: string;
  fault: string;
  severity: SeverityLevel;
  five_r: FiveRAction;
  recommendation: string;
  safety_warning: string;
}> = [
  {
    device: "Laptop",
    component: "Battery",
    condition: "Swollen",
    fault: "Lithium Battery Swelling & Gas Buildup",
    severity: "High",
    five_r: "Recycle",
    recommendation: "Stop using the damaged battery immediately. Replace the battery and recycle the old cell through a certified e-waste recycler.",
    safety_warning: "⚠️ Do not puncture, crush, open, or attempt to recharge a swollen battery.",
  },
  {
    device: "Laptop",
    component: "Screen",
    condition: "Cracked",
    fault: "Display Glass & LCD Panel Fracture",
    severity: "Medium",
    five_r: "Reuse",
    recommendation: "Replace the laptop screen assembly at a ReLife Skill Center to restore the laptop to full working condition.",
    safety_warning: "Be careful of sharp glass fragments on the cracked panel.",
  },
  {
    device: "Laptop",
    component: "Fan",
    condition: "Dusty",
    fault: "Thermal Dust Blockage",
    severity: "Low",
    five_r: "Reduce",
    recommendation: "Clean the fan assembly with compressed air and re-apply thermal paste to prevent CPU thermal throttling.",
    safety_warning: "Disconnect power before servicing the internal fan.",
  },
  {
    device: "Laptop",
    component: "Hinge",
    condition: "Broken",
    fault: "Chassis Mechanical Hinge Failure",
    severity: "Medium",
    five_r: "Retrieve",
    recommendation: "Harvest functional components (RAM, SSD, screen) or replace the top assembly chassis.",
    safety_warning: "Do not force open the screen to prevent tearing video ribbon cables.",
  },
  {
    device: "Smartphone",
    component: "Battery",
    condition: "Swollen",
    fault: "Battery Degradation & Deformity",
    severity: "High",
    five_r: "Recycle",
    recommendation: "Safely remove the battery and handle it through an appropriate e-waste battery recycling channel.",
    safety_warning: "⚠️ Fire hazard: Do not press, heat, or puncture the battery.",
  },
  {
    device: "Smartphone",
    component: "Screen",
    condition: "Cracked",
    fault: "Front Glass / Digitizer Damage",
    severity: "Medium",
    five_r: "Reuse",
    recommendation: "Replace the screen digitizer at a Skill Center to maintain device circular life.",
    safety_warning: "Cover cracked glass with clear tape to prevent minor cuts.",
  },
  {
    device: "Smartphone",
    component: "Charging Port",
    condition: "Corroded",
    fault: "Moisture Oxidation in Charging Port",
    severity: "Low",
    five_r: "Retrieve",
    recommendation: "Clean port contacts using isopropyl alcohol or replace the daughterboard flex module.",
    safety_warning: "Ensure the port is completely dry before plugging in a charger.",
  },
  {
    device: "Charger",
    component: "Cable",
    condition: "Frayed",
    fault: "Insulation Damage & Wire Exposure",
    severity: "High",
    five_r: "Recycle",
    recommendation: "Discontinue cable use. Frayed high-voltage cables pose electrical short circuit risks.",
    safety_warning: "⚠️ Electric Shock Risk: Do not touch exposed metal wires while plugged in.",
  },
  {
    device: "Charger",
    component: "Plug",
    condition: "Bent",
    fault: "Plug Pin Deformity",
    severity: "Medium",
    five_r: "Redesign",
    recommendation: "Replace wall plug attachment or exchange for a modular adapter.",
    safety_warning: "Do not force bent pins into electrical wall outlets.",
  },
  {
    device: "Charger",
    component: "Body",
    condition: "Burned",
    fault: "Internal Transformer Arcing / Overheating",
    severity: "High",
    five_r: "Recycle",
    recommendation: "Recycle charger at an e-waste drop point. Do not attempt internal repair.",
    safety_warning: "⚠️ Severe Fire Risk: Disconnect from wall socket immediately.",
  },
];

const DEFAULT_DISCLAIMER =
  "⚠️ Photo analysis detects visible physical conditions. It cannot confirm hidden internal electrical faults or exact battery health. For safety-critical cases, seek professional Skill Center bench testing.";

/**
 * Match ML predictions with Database Rule Engine
 */
export async function evaluateRuleEngine(
  prediction: MLPrediction,
  confidenceThreshold: number = 0.5,
): Promise<RuleEngineResult> {
  const { device, component, condition } = prediction;

  const isNonDevice =
    device.name.toLowerCase().includes("non-electronic") ||
    device.name.toLowerCase().includes("human") ||
    component.name.toLowerCase().includes("none") ||
    condition.name.toLowerCase().includes("unrecognized");

  // 1. Confidence & Object Validation Check
  if (
    isNonDevice ||
    device.confidence < confidenceThreshold ||
    component.confidence < confidenceThreshold ||
    condition.confidence < confidenceThreshold
  ) {
    return {
      lowConfidence: true,
      confidenceMessage:
        "⚠️ No electronic device or component was recognized in this photo. Please upload or capture a clear photo of an electronic device or component (e.g. laptop, smartphone, battery, charger cable, circuit board).",
      prediction,
      fault: "No Electronic Device Detected",
      severity: "Low",
      five_r: "Reduce",
      recommendation: "Please upload a clearer photo focusing directly on the electronic device or component.",
      safety_warning: "Ensure the camera is focused on the device.",
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }

  // 2. Query Supabase Database Rules first
  try {
    const { data, error } = await (supabase.from as any)("fault_rules")
      .select("*")
      .ilike("device", `%${device.name}%`)
      .ilike("component", `%${component.name}%`)
      .ilike("condition", `%${condition.name}%`)
      .maybeSingle();

    if (data && !error) {
      return {
        lowConfidence: false,
        prediction,
        fault: (data as any).fault,
        severity: (data as any).severity as SeverityLevel,
        five_r: (data as any).five_r as FiveRAction,
        recommendation: (data as any).recommendation,
        safety_warning: (data as any).safety_warning,
        disclaimer: DEFAULT_DISCLAIMER,
      };
    }
  } catch (err) {
    console.warn("[Rule Engine] Supabase rule lookup fallback to local dictionary", err);
  }

  // 3. Fallback to Local Knowledge Base Engine
  const matchedRule = KNOWLEDGE_BASE_RULES.find(
    (r) =>
      r.device.toLowerCase().includes(device.name.toLowerCase()) ||
      r.component.toLowerCase().includes(component.name.toLowerCase()) ||
      r.condition.toLowerCase().includes(condition.name.toLowerCase()),
  );

  if (matchedRule) {
    return {
      lowConfidence: false,
      prediction,
      fault: matchedRule.fault,
      severity: matchedRule.severity,
      five_r: matchedRule.five_r,
      recommendation: matchedRule.recommendation,
      safety_warning: matchedRule.safety_warning,
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }

  // 4. Default Heuristic Dynamic Rule Generation
  let fiveR: FiveRAction = "Reuse";
  let severity: SeverityLevel = "Medium";
  const condLower = condition.name.toLowerCase();

  if (condLower.includes("swollen") || condLower.includes("burned") || condLower.includes("frayed")) {
    fiveR = "Recycle";
    severity = "High";
  } else if (condLower.includes("cracked") || condLower.includes("broken")) {
    fiveR = "Reuse";
    severity = "Medium";
  } else if (condLower.includes("corroded") || condLower.includes("bent") || condLower.includes("dusty")) {
    fiveR = "Retrieve";
    severity = "Low";
  }

  return {
    lowConfidence: false,
    prediction,
    fault: `${condition.name} ${component.name} (${device.name})`,
    severity,
    five_r: fiveR,
    recommendation: `Inspect ${component.name} for ${condition.name.toLowerCase()} physical condition. Consider ${fiveR.toLowerCase()} action under 5R principles.`,
    safety_warning: severity === "High" ? "⚠️ Exercise caution: High severity physical defect." : "Handle with normal safety precautions.",
    disclaimer: DEFAULT_DISCLAIMER,
  };
}
