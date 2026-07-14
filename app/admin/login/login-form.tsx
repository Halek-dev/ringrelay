"use client";

import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-acc px-6 py-3 text-[15.5px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-acc-b disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Signing in…" : "Sign in"}
      {!pending && <ArrowRight size={16} strokeWidth={2.6} />}
    </button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useFormState<LoginState, FormData>(loginAction, {
    error: null,
  });

  const inputCls =
    "rounded-[10px] border-[1.5px] border-line2 bg-card2 px-[15px] py-[13px] text-[15px] text-ink placeholder:text-mute";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <label className="flex flex-col gap-[7px]">
        <span className="text-[13px] font-bold text-ink">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@ringrelay.com"
          className={inputCls}
        />
      </label>
      <label className="flex flex-col gap-[7px]">
        <span className="text-[13px] font-bold text-ink">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputCls}
        />
      </label>

      {state.error && (
        <p className="rounded-[10px] border border-acc/40 bg-acc/10 px-4 py-2 text-[13.5px] font-semibold text-acc-dim">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
