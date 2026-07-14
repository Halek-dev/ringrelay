"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check } from "lucide-react";
import { INDUSTRY_OPTIONS } from "@/lib/mock-data";
import { submitContact } from "@/app/(marketing)/contact/actions";
import { cn, formatUsPhone } from "@/lib/utils";

type Fields = {
  name: string;
  business: string;
  phone: string;
  email: string;
  industry: string;
  problem: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DemoForm() {
  const [fields, setFields] = useState<Fields>({
    name: "",
    business: "",
    phone: "",
    email: "",
    industry: INDUSTRY_OPTIONS[0],
    problem: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!fields.name.trim()) e.name = "Tell us who you are.";
    if (!fields.business.trim()) e.business = "Your business name, please.";
    if (fields.phone.replace(/\D/g, "").length < 10)
      e.phone = "Enter a valid phone number.";
    if (!EMAIL_RE.test(fields.email)) e.email = "Enter a valid email.";
    if (!fields.problem.trim())
      e.problem = "A sentence on your call problem helps us prep.";
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    startTransition(async () => {
      const result = await submitContact({
        name: fields.name,
        business: fields.business,
        phone: fields.phone,
        email: fields.email,
        industry: fields.industry,
        message: fields.problem,
      });
      if (result.ok) {
        setSubmitted(true);
      } else {
        setFormError(result.error);
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-[22px] border border-line2 bg-card px-[44px] py-14 text-center shadow-card">
        <div className="mx-auto mb-[22px] grid h-[60px] w-[60px] place-items-center rounded-full border-[1.5px] border-ok/35 bg-ok/10">
          <Check size={26} strokeWidth={2.6} className="text-ok" />
        </div>
        <h2 className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-ink">
          Got it. We&apos;ll call you.
        </h2>
        <p className="mt-[10px] text-[16px] leading-[1.6] text-body">
          Expect a text confirming your demo time within the hour, same business
          day.
        </p>
      </div>
    );
  }

  const inputBase =
    "rounded-[10px] border-[1.5px] bg-card2 px-[15px] py-[13px] text-[15px] text-ink transition-all duration-150 placeholder:text-mute";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative rounded-[22px] border border-line2 bg-card p-9 shadow-card"
    >
      <div className="card-tag absolute left-7 top-[-13px]">15-MIN DEMO</div>

      <div className="grid grid-cols-1 gap-[18px] pt-[6px] sm:grid-cols-2">
        <Field label="Your name" error={errors.name}>
          <input
            type="text"
            placeholder="Dave Kowalski"
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            className={cn(inputBase, errors.name ? "border-acc" : "border-line2")}
          />
        </Field>
        <Field label="Business name" error={errors.business}>
          <input
            type="text"
            placeholder="Kowalski Heating & Air"
            value={fields.business}
            onChange={(e) => update("business", e.target.value)}
            className={cn(
              inputBase,
              errors.business ? "border-acc" : "border-line2",
            )}
          />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input
            type="tel"
            inputMode="tel"
            placeholder="(555) 000-0000"
            value={fields.phone}
            onChange={(e) => update("phone", formatUsPhone(e.target.value))}
            className={cn(
              inputBase,
              errors.phone ? "border-acc" : "border-line2",
            )}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            placeholder="dave@kowalskihvac.com"
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            className={cn(
              inputBase,
              errors.email ? "border-acc" : "border-line2",
            )}
          />
        </Field>
        <Field label="Industry" className="sm:col-span-2">
          <select
            value={fields.industry}
            onChange={(e) => update("industry", e.target.value)}
            className={cn(inputBase, "appearance-none border-line2")}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238791A5' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 15px center",
            }}
          >
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </Field>
        <Field
          label="What's your biggest call problem?"
          error={errors.problem}
          className="sm:col-span-2"
        >
          <textarea
            rows={4}
            placeholder="We miss maybe 10 calls a week when the crew is out. After-hours goes to voicemail and nobody leaves one."
            value={fields.problem}
            onChange={(e) => update("problem", e.target.value)}
            className={cn(
              inputBase,
              "resize-y leading-[1.55]",
              errors.problem ? "border-acc" : "border-line2",
            )}
          />
        </Field>
      </div>

      {formError && (
        <p className="mt-4 rounded-[10px] border border-acc/40 bg-acc/10 px-4 py-2 text-center text-[13.5px] font-semibold text-acc-dim">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-acc px-6 py-4 text-[16.5px] font-bold text-white shadow-[0_12px_32px_rgba(234,88,12,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-acc-b hover:shadow-[0_18px_44px_rgba(234,88,12,0.42)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Sending…" : "Book My Demo"}
        {!pending && <ArrowRight size={16} strokeWidth={2.6} />}
      </button>
      <p className="mt-[14px] text-center text-[12.5px] text-mute">
        No spam, no pressure. One call, then you decide.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-[7px]", className)}>
      <label className="text-[13px] font-bold tracking-[0.02em] text-ink">
        {label}
      </label>
      {children}
      {error && <span className="text-[12.5px] font-semibold text-acc">{error}</span>}
    </div>
  );
}
