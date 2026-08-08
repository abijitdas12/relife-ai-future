/**
 * RDE — ReLife Decision Engine (prototype logic).
 * Transparent, rule-based scoring. Swap in real AI Vision output later.
 */

export type R5Action = "REPAIR" | "REUSE" | "RETRIEVE" | "REDESIGN" | "RECYCLE";

export interface RdeInput {
  repairCost: number;
  replacementCost: number;
  ageYears: number;
  /** 0-100 physical repairability of the unit */
  repairability: number;
  /** spare parts availability 0-1 */
  componentAvailability: number;
  /** estimated remaining useful life in years after intervention */
  remainingLife: number;
  /** residual value of recoverable components 0-1 */
  componentValue: number;
}

export interface RdeResult {
  score: number;
  action: R5Action;
  headline: string;
  reasoning: string[];
  costRatio: number;
}

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

export function runRde(input: RdeInput): RdeResult {
  const costRatio = input.repairCost / Math.max(input.replacementCost, 1);
  const reasoning: string[] = [];

  const costScore = clamp((1 - Math.min(costRatio, 1)) * 100);
  const ageScore = clamp(100 - input.ageYears * 9);
  const lifeScore = clamp(input.remainingLife * 18);
  const partsScore = clamp(input.componentAvailability * 100);

  const score = Math.round(
    input.repairability * 0.3 + costScore * 0.28 + lifeScore * 0.18 + partsScore * 0.14 + ageScore * 0.1,
  );

  reasoning.push(
    `Repair cost is ${Math.round(costRatio * 100)}% of replacement cost (${costRatio < 0.4 ? "economical" : "high"}).`,
  );
  reasoning.push(`Spare component availability scored ${Math.round(partsScore)}/100.`);
  reasoning.push(`Estimated remaining useful life after intervention: ${input.remainingLife} years.`);

  let action: R5Action;
  let headline: string;

  if (score >= 70 && costRatio < 0.45 && input.componentAvailability > 0.4) {
    action = "REPAIR";
    headline = "Repair is the highest value-preserving outcome for this unit.";
    reasoning.push("Repairability is high and repair is far cheaper than replacement → REPAIR.");
  } else if (score >= 55 && input.remainingLife >= 2) {
    action = "REUSE";
    headline = "The unit still works well enough to keep serving a second life.";
    reasoning.push("Functional life remains without major intervention → REUSE.");
  } else if (input.componentValue >= 0.5) {
    action = "RETRIEVE";
    headline = "The unit is uneconomical to repair, but its components are valuable.";
    reasoning.push("Whole-unit repair is not economical while component value stays high → RETRIEVE.");
  } else if (input.componentValue >= 0.28 && input.componentAvailability > 0.2) {
    action = "REDESIGN";
    headline = "Recovered parts can be rebuilt into a different useful product.";
    reasoning.push("Parts have no direct market but can be re-engineered → REDESIGN.");
  } else {
    action = "RECYCLE";
    headline = "Material recovery is the last resort for this unit.";
    reasoning.push("Repair, reuse, retrieval and redesign are all impractical → RECYCLE.");
  }

  return { score: clamp(score), action, headline, reasoning, costRatio };
}

export const actionTone: Record<R5Action, string> = {
  REPAIR: "text-emerald",
  REUSE: "text-lime",
  RETRIEVE: "text-electric",
  REDESIGN: "text-electric",
  RECYCLE: "text-muted-foreground",
};
