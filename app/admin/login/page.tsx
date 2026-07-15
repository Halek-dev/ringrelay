import type { Metadata } from "next";
import { Logo } from "@/components/site/logo";
import { Panel } from "@/components/admin/ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in · Ops Console",
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const redirectTo = searchParams.redirect ?? "/admin";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      <div className="hazard-stripe relative z-[60] h-1" />
      <div className="blueprint-grid pointer-events-none absolute inset-0" />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-16">
        <Logo href="/" className="mb-8" />
        <Panel className="w-full max-w-[400px] p-8">
          <div className="mb-6">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-acc-dim">
              Ops Console
            </span>
            <h1 className="mt-2 font-display text-[24px] font-extrabold tracking-[-0.02em] text-ink">
              Sign in to your workspace
            </h1>
            <p className="mt-1 text-[14px] text-body">
              Internal tool. Accounts are created by an owner.
            </p>
          </div>
          <LoginForm redirectTo={redirectTo} />
        </Panel>
      </div>
    </div>
  );
}
