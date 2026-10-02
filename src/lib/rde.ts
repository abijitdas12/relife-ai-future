/**
 * ReLife Decision Engine (RDE) & R5 Evaluation Layer
 *
 * This module is isolated from the Vision AI classifier. It implements a transparent,
 * weighted scoring engine with named, documented constants. The weights and thresholds
 * are structured so they can easily be tuned or replaced by a regression/classification
 * model once real-world repair outcome data is collected.
 */

export type R5Category = "Reduce" | "Reuse" | "Retrieve" | "Redesign" | "Recycle";
export type R5Action = "REPAIR" | "REUSE" | "RETRIEVE" | "REDESIGN" | "RECYCLE";
export type GeminiConfidence = "high" | "medium" | "low" | number;

export const EWASTE_CATEGORIES = [
  "smartphone",
  "laptop",
  "tablet",
  "desktop_pc",
  "monitor",
  "television",
  "keyboard",
  "mouse",
  "printer",
  "router",
  "charger_adapter",
  "power_bank",
  "headphones_earbuds",
  "speaker",
  "camera",
  "battery",
  "circuit_board",
  "cables_wires",
  "appliance_small",
  "appliance_large",
  "other_electronic",
  "not_electronic",
] as const;

export type EWasteCategory = (typeof EWASTE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<EWasteCategory, string> = {
  smartphone: "Smartphone / Mobile Phone",
  laptop: "Laptop Computer",
  tablet: "Tablet / iPad",
  desktop_pc: "Desktop PC / Workstation",
  monitor: "Monitor / Computer Display",
  television: "Television / TV Display",
  keyboard: "Keyboard",
  mouse: "Mouse / Input Device",
  printer: "Printer / Scanner",
  router: "Router / Modem / Networking",
  charger_adapter: "Charger / Power Adapter",
  power_bank: "Power Bank / Portable Battery",
  headphones_earbuds: "Headphones / Earbuds",
  speaker: "Speaker / Audio System",
  camera: "Camera / Camcorder",
  battery: "Battery / Battery Pack",
  circuit_board: "Circuit Board / PCB",
  cables_wires: "Cables / Wires / Connectors",
  appliance_small: "Small Home Appliance",
  appliance_large: "Large Home Appliance",
  other_electronic: "Other Electronic Device",
  not_electronic: "Not an Electronic Object",
};

export interface RdeResult {
  score: number;
  action: R5Action;
  headline: string;
  reasoning: string[];
  costRatio: number;
}

// ============================================================================
// NAMED RDE SCORING WEIGHTS (Adjustable for ML Model Tuning)
// ============================================================================
export const RDE_WEIGHTS = {
  /** Weight assigned to Gemini physical repairability estimate (0-100) */
  PHYSICAL_REPAIRABILITY: 0.30,

  /** Weight assigned to cost savings score (1 - repair_cost / replacement_cost) */
  COST_SAVINGS: 0.25,

  /** Weight assigned to component availability score (0-1) */
  COMPONENT_AVAILABILITY: 0.20,

  /** Weight assigned to remaining useful life estimate after repair (years) */
  REMAINING_LIFE: 0.15,

  /** Weight assigned to age decay score (100 - age_years * 8) */
  AGE_DECAY: 0.10,
} as const;

// Validate that weights sum up to 1.00
const WEIGHT_SUM = Object.values(RDE_WEIGHTS).reduce((acc, val) => acc + val, 0);
if (Math.abs(WEIGHT_SUM - 1.0) > 0.001) {
  console.warn(`[RDE Engine Warning]: Weights sum to ${WEIGHT_SUM}, expected 1.00`);
}

// ============================================================================
// NAMED DECISION THRESHOLDS (Documented Evaluator Constants)
// ============================================================================
export const RDE_THRESHOLDS = {
  /** Minimum score required to recommend full "Reduce (Repair)" */
  MIN_SCORE_REPAIR: 68,

  /** Maximum acceptable cost ratio (repairCost / replacementCost) for repair */
  MAX_COST_RATIO_REPAIR: 0.50,

  /** Minimum component availability required for economical repair */
  MIN_COMPONENT_AVAILABILITY_REPAIR: 0.35,

  /** Minimum score required for "Reuse" recommendation */
  MIN_SCORE_REUSE: 52,

  /** Minimum remaining useful life (years) to justify "Reuse" */
  MIN_REMAINING_LIFE_REUSE: 2.0,

  /** Minimum salvage component value ratio (0-1) required for "Retrieve" */
  MIN_SALVAGE_VALUE_RETRIEVE: 0.45,

  /** Minimum salvage value ratio (0-1) required for "Redesign" upcycling */
  MIN_SALVAGE_VALUE_REDESIGN: 0.25,
} as const;

// ============================================================================
// INTERFACES & PIPELINE TYPES
// ============================================================================
export interface GeminiVisionOutput {
  is_electronic_device?: boolean;
  category?: EWasteCategory;
  brand_model?: string;
  visible_damage?: string[];
  likely_fault?: string;
  product_name: string;
  likely_model: string;
  visible_condition: string;
  possible_faults: string[];
  confidence: GeminiConfidence;
  requires_human_inspection: boolean;
}

export interface RdeStructuredInputs {
  estimated_repair_cost: number;
  estimated_replace_cost: number;
  component_condition_ratings: Record<string, number>; // 0-100 per component
  remaining_life_estimate_years: number;
  component_salvage_value_ratio: number; // 0-1
  component_availability_ratio: number; // 0-1
  device_age_years?: number;
}

export interface RdeEvaluationResult {
  repairability_score: number;
  r5_category: R5Category;
  headline: string;
  reasoning: string[];
  requires_human_inspection: boolean;
  cost_ratio: number;
  sub_scores: {
    physical_repairability_score: number;
    cost_savings_score: number;
    component_availability_score: number;
    remaining_life_score: number;
    age_score: number;
  };
}

// Helper utility to constrain values between 0 and 100
const clamp = (val: number, min = 0, max = 100): number =>
  Math.min(max, Math.max(min, Math.round(val)));

/**
 * Execute RDE Scoring & R5 Decision Tree Evaluation
 */
export function evaluateRDE(
  geminiOutput: GeminiVisionOutput,
  inputs: RdeStructuredInputs
): RdeEvaluationResult {
  const reasoning: string[] = [];

  // 1. Calculate Cost Ratio (Repair Cost / Replacement Cost)
  const replaceCost = Math.max(inputs.estimated_replace_cost, 1);
  const costRatio = parseFloat((inputs.estimated_repair_cost / replaceCost).toFixed(2));

  // 2. Compute Individual Weighted Sub-scores (Normalized 0 - 100)
  const costSavingsScore = clamp((1 - Math.min(costRatio, 1)) * 100);
  const componentAvailabilityScore = clamp(inputs.component_availability_ratio * 100);
  const remainingLifeScore = clamp(inputs.remaining_life_estimate_years * 20); // 5+ years = 100
  const ageYears = inputs.device_age_years ?? 3;
  const ageScore = clamp(100 - ageYears * 8);

  // Compute average physical component condition score
  const componentRatings = Object.values(inputs.component_condition_ratings);
  const avgComponentScore =
    componentRatings.length > 0
      ? componentRatings.reduce((a, b) => a + b, 0) / componentRatings.length
      : 60;

  // 3. Compute Composite RDE Repairability Score (0 - 100)
  const compositeScore = Math.round(
    avgComponentScore * RDE_WEIGHTS.PHYSICAL_REPAIRABILITY +
      costSavingsScore * RDE_WEIGHTS.COST_SAVINGS +
      componentAvailabilityScore * RDE_WEIGHTS.COMPONENT_AVAILABILITY +
      remainingLifeScore * RDE_WEIGHTS.REMAINING_LIFE +
      ageScore * RDE_WEIGHTS.AGE_DECAY
  );

  const repairabilityScore = clamp(compositeScore);

  // 4. Determine Human Inspection Flag
  // Conservative logic: default to true if Gemini flagged internal/electrical faults or confidence is low
  let requiresHumanInspection = geminiOutput.requires_human_inspection;
  if (
    geminiOutput.confidence === "low" ||
    geminiOutput.confidence === "medium" ||
    geminiOutput.possible_faults.some((f) =>
      /battery|board|circuit|burned|swollen|power|short/i.test(f)
    )
  ) {
    requiresHumanInspection = true;
  }

  // 5. R5 Decision Tree Logic
  let r5Category: R5Category;
  let headline: string;

  const isCostEconomical = costRatio <= RDE_THRESHOLDS.MAX_COST_RATIO_REPAIR;
  const isPartsAvailable =
    inputs.component_availability_ratio >= RDE_THRESHOLDS.MIN_COMPONENT_AVAILABILITY_REPAIR;

  reasoning.push(
    `Repair cost (₹${inputs.estimated_repair_cost}) is ${Math.round(
      costRatio * 100
    )}% of unit replacement cost (₹${inputs.estimated_replace_cost}) — ${
      isCostEconomical ? "economically viable" : "expensive compared to replacement"
    }.`
  );
  reasoning.push(
    `Spare part availability scored ${Math.round(
      componentAvailabilityScore
    )}/100 across verified supplier channels.`
  );
  reasoning.push(
    `Estimated useful lifespan extension after intervention: ${inputs.remaining_life_estimate_years} years.`
  );

  if (
    repairabilityScore >= RDE_THRESHOLDS.MIN_SCORE_REPAIR &&
    isCostEconomical &&
    isPartsAvailable
  ) {
    r5Category = "Reduce"; // Reduce e-waste via repair
    headline = "Repair (Reduce) is the optimal value-preserving circular decision for this unit.";
    reasoning.push(
      `High repairability score (${repairabilityScore}/100) and low cost ratio (${Math.round(
        costRatio * 100
      )}%) confirm direct component repair.`
    );
  } else if (
    repairabilityScore >= RDE_THRESHOLDS.MIN_SCORE_REUSE &&
    inputs.remaining_life_estimate_years >= RDE_THRESHOLDS.MIN_REMAINING_LIFE_REUSE
  ) {
    r5Category = "Reuse";
    headline = "The device retains sufficient working condition for secondary lifecycle reuse.";
    reasoning.push(
      `Unit has ${inputs.remaining_life_estimate_years} years remaining useful life without major overhaul → REUSE.`
    );
  } else if (inputs.component_salvage_value_ratio >= RDE_THRESHOLDS.MIN_SALVAGE_VALUE_RETRIEVE) {
    r5Category = "Retrieve";
    headline = "Whole-device repair is impractical, but internal components hold high salvage value.";
    reasoning.push(
      `Component salvage value ratio is high (${Math.round(
        inputs.component_salvage_value_ratio * 100
      )}%) → Harvest functional components (RAM, SSD, screen, board) at a Skill Center.`
    );
  } else if (
    inputs.component_salvage_value_ratio >= RDE_THRESHOLDS.MIN_SALVAGE_VALUE_REDESIGN &&
    isPartsAvailable
  ) {
    r5Category = "Redesign";
    headline = "Parts can be upcycled and re-engineered into alternative functional hardware.";
    reasoning.push(
      "Individual components cannot be reused directly, but can be upcycled via modular redesign."
    );
  } else {
    r5Category = "Recycle";
    headline = "Safe e-waste material recovery & recycling is recommended as the final resort.";
    reasoning.push(
      "Repair, reuse, retrieval and redesign are all unviable → Dispatch to certified e-waste recycling channel."
    );
  }

  if (requiresHumanInspection) {
    reasoning.push(
      "⚠️ Note: Potential internal/electrical condition detected. Bench testing at a ReLife Skill Center is required before final servicing."
    );
  }

  return {
    repairability_score: repairabilityScore,
    r5_category: r5Category,
    headline,
    reasoning,
    requires_human_inspection: requiresHumanInspection,
    cost_ratio: costRatio,
    sub_scores: {
      physical_repairability_score: Math.round(avgComponentScore),
      cost_savings_score: Math.round(costSavingsScore),
      component_availability_score: Math.round(componentAvailabilityScore),
      remaining_life_score: Math.round(remainingLifeScore),
      age_score: Math.round(ageScore),
    },
  };
}

export const R5_COLORS: Record<R5Category, string> = {
  Reduce: "text-emerald border-emerald/40 bg-emerald/10",
  Reuse: "text-lime border-lime/40 bg-lime/10",
  Retrieve: "text-purple-400 border-purple-500/40 bg-purple-500/10",
  Redesign: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  Recycle: "text-red-400 border-red-500/40 bg-red-500/10",
};

export interface RdeInput {
  repairCost: number;
  replacementCost: number;
  ageYears: number;
  repairability: number;
  componentAvailability: number;
  remainingLife: number;
  componentValue: number;
}

export function runRde(input: RdeInput): RdeResult {
  const result = evaluateRDE(
    {
      product_name: "Electronic Device",
      likely_model: "Unit",
      visible_condition: "Scanned Condition",
      possible_faults: ["Component Wear"],
      confidence: "high",
      requires_human_inspection: false,
    },
    {
      estimated_repair_cost: input.repairCost,
      estimated_replace_cost: input.replacementCost,
      component_condition_ratings: { Main: input.repairability },
      remaining_life_estimate_years: input.remainingLife,
      component_salvage_value_ratio: input.componentValue,
      component_availability_ratio: input.componentAvailability,
      device_age_years: input.ageYears,
    }
  );

  const actionMap: Record<R5Category, R5Action> = {
    Reduce: "REPAIR",
    Reuse: "REUSE",
    Retrieve: "RETRIEVE",
    Redesign: "REDESIGN",
    Recycle: "RECYCLE",
  };

  return {
    score: result.repairability_score,
    action: actionMap[result.r5_category],
    headline: result.headline,
    reasoning: result.reasoning,
    costRatio: result.cost_ratio,
  };
}
