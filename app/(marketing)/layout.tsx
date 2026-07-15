import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg">
      {/* Signature hazard stripe */}
      <div className="hazard-stripe relative z-[60] h-1" />
      {/* Blueprint grid, faded via CSS mask */}
      <div className="blueprint-grid pointer-events-none absolute inset-0" />

      <SiteHeader />
      <main id="main" className="relative">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
