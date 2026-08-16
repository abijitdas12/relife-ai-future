import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  /** data:image/...;base64,... */
  image: z.string().min(32).max(12_000_000),
});

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
}

const SYSTEM = `You are ReLife AI Vision, an expert in consumer electronics and appliance triage.
Identify the product in the photo and assess visible faults for a circular-economy repair decision.
Respond with ONLY minified JSON, no markdown, matching exactly:
{"product":string,"brandGuess":string,"category":string,"condition":string,"faults":string[],
"detectedComponents":[{"name":string,"state":string}],"repairability":number,
"ageYearsEstimate":number,"repairCostInr":number,"replacementCostInr":number,
"componentAvailability":number,"remainingLifeYears":number,"componentValue":number,"notes":string}
repairability 0-100. componentAvailability and componentValue are 0-1. Costs in Indian Rupees for the Indian market.
If the image is not a product, set product to "Unrecognised" and faults to [].`;

export const analyzeProductImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<VisionAnalysis> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify this product and analyse its visible faults. JSON only.",
              },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("AI gateway error", res.status, body);
      if (res.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
      throw new Error("AI vision request failed.");
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI returned an unreadable response.");

    const parsed = JSON.parse(match[0]) as Partial<VisionAnalysis>;
    const num = (v: unknown, fallback: number) =>
      typeof v === "number" && Number.isFinite(v) ? v : fallback;

    return {
      product: parsed.product || "Unrecognised",
      brandGuess: parsed.brandGuess || "Unknown",
      category: parsed.category || "Electronics",
      condition: parsed.condition || "Unclear from photo",
      faults: Array.isArray(parsed.faults) ? parsed.faults.slice(0, 6).map(String) : [],
      detectedComponents: Array.isArray(parsed.detectedComponents)
        ? parsed.detectedComponents
            .slice(0, 8)
            .map((c) => ({ name: String(c?.name ?? "Component"), state: String(c?.state ?? "—") }))
        : [],
      repairability: Math.round(Math.min(100, Math.max(0, num(parsed.repairability, 60)))),
      ageYearsEstimate: num(parsed.ageYearsEstimate, 3),
      repairCostInr: Math.round(num(parsed.repairCostInr, 2500)),
      replacementCostInr: Math.round(num(parsed.replacementCostInr, 25000)),
      componentAvailability: Math.min(1, Math.max(0, num(parsed.componentAvailability, 0.6))),
      remainingLifeYears: num(parsed.remainingLifeYears, 2),
      componentValue: Math.min(1, Math.max(0, num(parsed.componentValue, 0.5))),
      notes: parsed.notes || "",
    };
  });
