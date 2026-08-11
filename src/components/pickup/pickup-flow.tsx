import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  Bike,
  CheckCircle2,
  Cpu,
  MapPin,
  PackageCheck,
  Receipt,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eyebrow, Section } from "@/components/sections/primitives";
import {
  DEVICES,
  URGENCY,
  estimateQuote,
  inr,
  type UrgencyKey,
} from "@/lib/quote";
import { cn } from "@/lib/utils";

const STEPS = ["Pickup address", "Device & problem", "AI price estimate", "Payment", "Confirmed"];

const PAYMENT_METHODS = [
  { id: "card", emoji: "💳", label: "Credit / Debit Card", note: "Visa, Mastercard, RuPay, Amex" },
  { id: "upi", emoji: "📱", label: "UPI", note: "GPay, PhonePe, Paytm, BHIM" },
  { id: "netbanking", emoji: "🏦", label: "Net Banking", note: "All major Indian banks" },
  { id: "wallet", emoji: "🪙", label: "Digital Wallets", note: "Paytm, Amazon Pay, Mobikwik" },
  { id: "cod", emoji: "💵", label: "Cash on Delivery / Cash", note: "Pay the technician on return" },
  { id: "qr", emoji: "📲", label: "UPI QR Code", note: "Scan a dynamic QR at pickup" },
  { id: "link", emoji: "🔗", label: "Payment Link", note: "Sent over SMS / WhatsApp / email" },
  { id: "invoice", emoji: "🧾", label: "Invoice + Online Payment", note: "GST invoice, pay in 7 days" },
] as const;

type PaymentId = (typeof PAYMENT_METHODS)[number]["id"];
type PayMode = "full" | "advance";

export function PickupFlow() {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    line1: "",
    landmark: "",
    city: "",
    pincode: "",
    slot: "Today, 4–7 PM",
    notes: "",
  });
  const [deviceKey, setDeviceKey] = useState(DEVICES[0]!.key);
  const [faults, setFaults] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<UrgencyKey>("standard");
  const [method, setMethod] = useState<PaymentId>("upi");
  const [payMode, setPayMode] = useState<PayMode>("advance");
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState("");


  const device = DEVICES.find((d) => d.key === deviceKey)!;
  const quote = useMemo(
    () => (faults.length ? estimateQuote(device, faults, urgency) : null),
    [device, faults, urgency],
  );

  const addressValid =
    address.name.trim().length > 1 &&
    /^[6-9]\d{9}$/.test(address.phone.trim()) &&
    address.line1.trim().length > 4 &&
    address.city.trim().length > 1 &&
    /^\d{6}$/.test(address.pincode.trim());

  const next = async () => {
    if (step === 0 && !addressValid) {
      toast.error("Please complete name, 10-digit phone, address, city and 6-digit PIN.");
      return;
    }
    if (step === 1 && faults.length === 0) {
      toast.error("Select at least one problem so the AI can price the job.");
      return;
    }
    if (step === 2) toast.success("Estimate approved — choose how you'd like to pay.");
    if (step === 3) {
      if (!quote) return;
      const m = PAYMENT_METHODS.find((p) => p.id === method)!;
      const ref = `RL-${Math.floor(100000 + Math.random() * 899999)}`;
      setSaving(true);
      const { error } = await supabase.from("pickup_requests").insert({
        reference: ref,
        customer_name: address.name.trim(),
        phone: address.phone.trim(),
        address_line: address.line1.trim(),
        landmark: address.landmark.trim() || null,
        city: address.city.trim(),
        pincode: address.pincode.trim(),
        slot: address.slot,
        notes: address.notes.trim() || null,
        device: device.label,
        faults,
        urgency,
        estimated_total: Math.round(quote.total),
        amount_paid_now: Math.round(payMode === "advance" ? quote.advance : quote.total),
        payment_method: m.label,
        payment_mode: payMode,
      });
      setSaving(false);
      if (error) {
        toast.error("Could not save your booking. Please try again.");
        return;
      }
      setReference(ref);
      toast.success(`${m.label} selected. Pickup booked — reference ${ref}.`);
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const payable = quote ? (payMode === "advance" ? quote.advance : quote.total) : 0;


  return (
    <Section className="pt-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Eyebrow>Doorstep pickup × AI pricing × Skill Center</Eyebrow>
        <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl">
          Book a <span className="text-gradient">Doorstep Pickup</span>
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Share your address, tell us what's wrong, and our collection partner picks the device up
          and delivers it to the nearest ReLife Skill Center. AI quotes the price before any work
          starts — you approve, then you pay.
        </p>
      </div>

      {/* Stepper */}
      <ol className="mt-12 grid gap-3 sm:grid-cols-5">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={cn(
              "flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs transition-all",
              i === step && "border-emerald/50 glow-ring text-foreground",
              i < step ? "text-foreground" : i > step ? "text-muted-foreground" : "",
            )}
          >
            {i < step ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald" />
            ) : (
              <span className="font-mono text-[0.65rem] text-muted-foreground">0{i + 1}</span>
            )}
            <span className="truncate">{s}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="card-surface p-6 md:p-8">
          {step === 0 && (
            <div className="grid gap-5">
              <Header icon={<MapPin className="h-4 w-4 text-emerald" />} title="Where should we collect the device?" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <Input
                    value={address.name}
                    maxLength={80}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    placeholder="Aarav Sharma"
                  />
                </Field>
                <Field label="Mobile number">
                  <Input
                    value={address.phone}
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="98765 43210"
                  />
                </Field>
              </div>
              <Field label="House / flat, street, area">
                <Input
                  value={address.line1}
                  maxLength={160}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  placeholder="B-402, Sunrise Residency, Baner Road"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Landmark (optional)">
                  <Input
                    value={address.landmark}
                    maxLength={80}
                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                    placeholder="Near Metro Pillar 42"
                  />
                </Field>
                <Field label="City">
                  <Input
                    value={address.city}
                    maxLength={60}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="Pune"
                  />
                </Field>
                <Field label="PIN code">
                  <Input
                    value={address.pincode}
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(e) =>
                      setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="411045"
                  />
                </Field>
              </div>
              <Field label="Preferred pickup slot">
                <div className="flex flex-wrap gap-2">
                  {["Today, 4–7 PM", "Tomorrow, 10 AM–1 PM", "Tomorrow, 4–7 PM", "Weekend"].map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setAddress({ ...address, slot: s })}
                        className={cn(
                          "rounded-full border border-border px-4 py-2 text-sm transition-colors",
                          address.slot === s
                            ? "border-emerald/60 bg-muted text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {s}
                      </button>
                    ),
                  )}
                </div>
              </Field>
              <Field label="Notes for the collection partner (optional)">
                <Textarea
                  value={address.notes}
                  maxLength={400}
                  rows={3}
                  onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                  placeholder="Gate code, packaging help needed, call before arriving…"
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-5">
              <Header
                icon={<PackageCheck className="h-4 w-4 text-electric" />}
                title="What are we picking up, and what's wrong with it?"
              />
              <Field label="Device type">
                <div className="flex flex-wrap gap-2">
                  {DEVICES.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => {
                        setDeviceKey(d.key);
                        setFaults([]);
                      }}
                      className={cn(
                        "rounded-full border border-border px-4 py-2 text-sm transition-colors",
                        d.key === deviceKey
                          ? "border-emerald/60 bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Reported problems (select all that apply)">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {device.faults.map((f) => {
                    const on = faults.includes(f.id);
                    return (
                      <li key={f.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setFaults((prev) =>
                              on ? prev.filter((x) => x !== f.id) : [...prev, f.id],
                            )
                          }
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-left text-sm transition-all",
                            on && "border-emerald/60 glow-ring",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border",
                              on && "border-emerald bg-gradient-brand",
                            )}
                          />
                          {f.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Field>

              <Field label="How fast do you need it back?">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(URGENCY) as UrgencyKey[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setUrgency(k)}
                      className={cn(
                        "rounded-full border border-border px-4 py-2 text-sm transition-colors",
                        urgency === k
                          ? "border-emerald/60 bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {URGENCY[k].label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 2 && quote && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-5"
            >
              <Header
                icon={<Cpu className="h-4 w-4 text-electric" />}
                title="ReLife AI estimate for your reported problems"
              />
              <p className="text-sm text-muted-foreground">
                Based on {faults.length} reported {faults.length === 1 ? "fault" : "faults"} on your{" "}
                {device.label.toLowerCase()}, our model prices the job at{" "}
                <span className="font-semibold text-foreground">{inr(quote.total)}</span> with{" "}
                {quote.confidence}% confidence. Final price is re-confirmed after bench diagnosis at
                the Skill Center — you approve any change before work continues.
              </p>

              <div className="rounded-2xl border border-border">
                <ul className="divide-y divide-border">
                  {quote.lines.map((l) => (
                    <li key={l.label} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="text-muted-foreground">{l.label}</span>
                      <span className="font-medium">{inr(l.amount)}</span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between px-4 py-4">
                    <span className="font-display text-base font-semibold">Estimated total</span>
                    <span className="font-display text-xl font-semibold text-gradient">
                      {inr(quote.total)}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <MiniStat label="Buying new" value={inr(quote.newPrice)} />
                <MiniStat label="You save" value={inr(quote.savings)} />
                <MiniStat label="Turnaround" value={quote.turnaround} />
              </div>

              <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                  <Sparkles className="h-3.5 w-3.5 text-lime" /> What happens if you approve
                </p>
                <p className="mt-3">
                  A collection partner arrives in your slot ({address.slot.toLowerCase()}), seals and
                  tags the device, and delivers it to the nearest Skill Center. Repair starts only
                  after your approved amount is locked in.
                </p>
              </div>
            </motion.div>
          )}

          {step === 3 && quote && (
            <div className="grid gap-5">
              <Header
                icon={<BadgeIndianRupee className="h-4 w-4 text-emerald" />}
                title="Choose a payment method"
              />
              <Field label="Payment plan">
                <div className="grid gap-3 sm:grid-cols-2">
                  <PlanCard
                    active={payMode === "advance"}
                    onClick={() => setPayMode("advance")}
                    title="💰 Partial / advance payment"
                    body={`Pay ${inr(quote.advance)} now (20%), the rest on delivery.`}
                  />
                  <PlanCard
                    active={payMode === "full"}
                    onClick={() => setPayMode("full")}
                    title="Pay in full"
                    body={`Settle ${inr(quote.total)} now and skip payment on return.`}
                  />
                </div>
              </Field>

              <Field label="Method">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {PAYMENT_METHODS.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setMethod(p.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border border-border px-4 py-3 text-left transition-all",
                          method === p.id && "border-emerald/60 glow-ring",
                        )}
                      >
                        <span className="text-lg leading-none">{p.emoji}</span>
                        <span>
                          <span className="block text-sm font-medium">{p.label}</span>
                          <span className="block text-xs text-muted-foreground">{p.note}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Field>

              <div className="rounded-2xl border border-border p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald" /> 🔄 Refunds & protection
                </p>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <li>Advance is fully refundable if the device is declared unrepairable.</li>
                  <li>Refunds return to the original method within 5–7 working days.</li>
                  <li>🧾 GST invoice is issued for every job, payable online within 7 days.</li>
                  <li>90-day warranty on replaced parts and workmanship.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-emerald/40 px-4 py-4">
                <span className="text-sm text-muted-foreground">Payable now</span>
                <span className="font-display text-2xl font-semibold text-gradient">
                  {inr(payable)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your booking is saved to ReLife. No card details are collected — payment is settled
                at pickup or via the link we send you.

              </p>
            </div>
          )}

          {step === 4 && quote && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid gap-5 text-center"
            >
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald/40">
                <span className="absolute-none" />
                <Truck className="h-6 w-6 text-emerald" />
              </span>
              <h2 className="font-display text-2xl font-semibold">Pickup confirmed</h2>
              <p className="mx-auto max-w-lg text-sm text-muted-foreground">
                Request <span className="font-mono text-foreground">{reference}</span>{" "}
                is scheduled for {address.slot.toLowerCase()} at {address.city} {address.pincode}. A
                collection partner will call {address.phone} before arriving.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniStat label="Approved estimate" value={inr(quote.total)} />
                <MiniStat label="Paid now" value={inr(payable)} />
                <MiniStat
                  label="Method"
                  value={PAYMENT_METHODS.find((p) => p.id === method)!.label}
                />
              </div>
              <Button variant="hero" size="lg" className="mx-auto" onClick={() => setStep(0)}>
                Book another pickup <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step < 4 && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {step > 0 && (
                <Button variant="ghost" size="lg" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
              <Button variant="hero" size="lg" onClick={next} disabled={saving}>
                {saving
                  ? "Booking…"
                  : step === 2
                    ? "Approve estimate"
                    : step === 3
                      ? `Pay ${inr(payable)}`
                      : "Continue"}{" "}

                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Summary rail */}
        <aside className="grid gap-4 self-start">
          <div className="card-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Your request
            </p>
            <ul className="mt-4 grid gap-3 text-sm">
              <Row icon={<MapPin className="h-4 w-4 text-emerald" />} label="Pickup">
                {addressValid
                  ? `${address.city} · ${address.pincode} · ${address.slot}`
                  : "Address pending"}
              </Row>
              <Row icon={<PackageCheck className="h-4 w-4 text-electric" />} label="Device">
                {device.label}
                {faults.length ? ` · ${faults.length} fault${faults.length > 1 ? "s" : ""}` : ""}
              </Row>
              <Row icon={<Receipt className="h-4 w-4 text-lime" />} label="AI estimate">
                {quote ? inr(quote.total) : "Select problems"}
              </Row>
              <Row icon={<Bike className="h-4 w-4 text-emerald" />} label="Logistics">
                {URGENCY[urgency].label}
              </Row>
            </ul>
          </div>

          <div className="card-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              How doorstep ReLife works
            </p>
            <ol className="mt-4 grid gap-3 text-sm text-muted-foreground">
              {[
                "You book a slot and describe the problem",
                "Collection partner picks up and seals the device",
                "Device reaches the nearest ReLife Skill Center",
                "AI + technician confirm the R5 decision and price",
                "Repaired device is delivered back to your door",
              ].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </Section>
  );
}

function Header({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="font-display text-lg font-semibold">{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-sm font-semibold">{value}</p>
    </div>
  );
}

function PlanCard({
  active,
  onClick,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border p-4 text-left transition-all",
        active && "border-emerald/60 glow-ring",
      )}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </button>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5">{icon}</span>
      <span>
        <span className="block text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span className="block">{children}</span>
      </span>
    </li>
  );
}
