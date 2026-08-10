/**
 * Prototype AI quote estimator for pickup repairs.
 * Rule-based stand-in for the ReLife AI vision + RDE cost model.
 */

export type DeviceKey =
  | "laptop"
  | "phone"
  | "fan"
  | "mixer"
  | "washing-machine"
  | "tv"
  | "printer"
  | "other";

export interface DeviceOption {
  key: DeviceKey;
  label: string;
  base: number;
  faults: FaultOption[];
}

export interface FaultOption {
  id: string;
  label: string;
  cost: number;
  /** hours of bench time */
  hours: number;
}

export const DEVICES: DeviceOption[] = [
  {
    key: "laptop",
    label: "Laptop / Computer",
    base: 499,
    faults: [
      { id: "battery", label: "Battery drains fast / not charging", cost: 2600, hours: 1 },
      { id: "screen", label: "Cracked or flickering display", cost: 5400, hours: 2 },
      { id: "keyboard", label: "Keys not working", cost: 1400, hours: 1 },
      { id: "no-boot", label: "Does not power on", cost: 3800, hours: 3 },
      { id: "slow", label: "Very slow / storage issue", cost: 2200, hours: 2 },
      { id: "overheat", label: "Overheating / loud fan", cost: 1200, hours: 1 },
    ],
  },
  {
    key: "phone",
    label: "Smartphone / Tablet",
    base: 299,
    faults: [
      { id: "screen", label: "Broken screen / touch dead", cost: 3600, hours: 1 },
      { id: "battery", label: "Battery swelling or poor backup", cost: 1500, hours: 1 },
      { id: "charging", label: "Charging port faulty", cost: 900, hours: 1 },
      { id: "water", label: "Water damage", cost: 2800, hours: 3 },
      { id: "camera", label: "Camera not working", cost: 1700, hours: 1 },
    ],
  },
  {
    key: "fan",
    label: "Ceiling / Table Fan",
    base: 149,
    faults: [
      { id: "capacitor", label: "Runs slow / capacitor issue", cost: 320, hours: 1 },
      { id: "noise", label: "Noisy bearings", cost: 480, hours: 1 },
      { id: "motor", label: "Motor winding burnt", cost: 950, hours: 2 },
      { id: "regulator", label: "Regulator / switch fault", cost: 260, hours: 1 },
    ],
  },
  {
    key: "mixer",
    label: "Mixer / Kitchen Appliance",
    base: 149,
    faults: [
      { id: "brush", label: "Carbon brushes worn out", cost: 380, hours: 1 },
      { id: "jar", label: "Jar coupler / blade damaged", cost: 290, hours: 1 },
      { id: "motor", label: "Motor not running", cost: 890, hours: 2 },
      { id: "smoke", label: "Burning smell / smoke", cost: 1100, hours: 2 },
    ],
  },
  {
    key: "washing-machine",
    label: "Washing Machine",
    base: 349,
    faults: [
      { id: "drain", label: "Not draining water", cost: 1200, hours: 2 },
      { id: "spin", label: "Drum not spinning", cost: 2400, hours: 3 },
      { id: "leak", label: "Water leaking", cost: 900, hours: 2 },
      { id: "board", label: "Control board / display error", cost: 3100, hours: 3 },
    ],
  },
  {
    key: "tv",
    label: "TV / Monitor",
    base: 299,
    faults: [
      { id: "panel", label: "No picture / panel damaged", cost: 6200, hours: 3 },
      { id: "power", label: "No power / power board", cost: 1900, hours: 2 },
      { id: "lines", label: "Lines or patches on screen", cost: 3400, hours: 2 },
      { id: "sound", label: "No sound", cost: 1100, hours: 1 },
    ],
  },
  {
    key: "printer",
    label: "Printer / Scanner",
    base: 199,
    faults: [
      { id: "head", label: "Print head clogged", cost: 1300, hours: 2 },
      { id: "feed", label: "Paper jam / feed rollers", cost: 700, hours: 1 },
      { id: "power", label: "Not powering on", cost: 1500, hours: 2 },
    ],
  },
  {
    key: "other",
    label: "Something else",
    base: 249,
    faults: [
      { id: "diagnose", label: "Not sure — needs full diagnosis", cost: 900, hours: 2 },
      { id: "power", label: "Not switching on", cost: 1400, hours: 2 },
      { id: "physical", label: "Physical / body damage", cost: 1100, hours: 2 },
    ],
  },
];

export const URGENCY = {
  standard: { label: "Standard (3–5 days)", multiplier: 1, pickup: 0 },
  express: { label: "Express (48 hours)", multiplier: 1.18, pickup: 149 },
  sameday: { label: "Same-day priority", multiplier: 1.35, pickup: 299 },
} as const;

export type UrgencyKey = keyof typeof URGENCY;

export interface QuoteLine {
  label: string;
  amount: number;
}

export interface Quote {
  lines: QuoteLine[];
  parts: number;
  labour: number;
  pickup: number;
  gst: number;
  total: number;
  advance: number;
  hours: number;
  turnaround: string;
  confidence: number;
  newPrice: number;
  savings: number;
}

const LABOUR_RATE = 220;

export function estimateQuote(
  device: DeviceOption,
  faultIds: string[],
  urgency: UrgencyKey,
): Quote {
  const faults = device.faults.filter((f) => faultIds.includes(f.id));
  const u = URGENCY[urgency];

  const parts = Math.round(faults.reduce((s, f) => s + f.cost, 0) * u.multiplier);
  const hours = faults.reduce((s, f) => s + f.hours, 0);
  const labour = Math.round(hours * LABOUR_RATE + device.base);
  const pickup = u.pickup;
  const subtotal = parts + labour + pickup;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const newPrice = Math.round(
    Math.max(total * 3.4, faults.reduce((s, f) => s + f.cost, 0) * 4 + 4000),
  );

  return {
    lines: [
      ...faults.map((f) => ({ label: f.label, amount: Math.round(f.cost * u.multiplier) })),
      { label: `Bench labour (${hours}h)`, amount: labour },
      ...(pickup ? [{ label: `${u.label} pickup surcharge`, amount: pickup }] : []),
      { label: "GST (18%)", amount: gst },
    ],
    parts,
    labour,
    pickup,
    gst,
    total,
    advance: Math.round(total * 0.2),
    hours,
    turnaround: u.label,
    confidence: Math.max(72, 97 - faults.length * 4),
    newPrice,
    savings: Math.max(newPrice - total, 0),
  };
}

export const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
