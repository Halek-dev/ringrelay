"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "success" | "info";
type Toast = { id: number; title: string; description?: string; variant: Variant };

type ToastCtx = {
  toast: (t: { title: string; description?: string; variant?: Variant }) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback(
    (id: number) => setToasts((t) => t.filter((x) => x.id !== id)),
    [],
  );

  const toast = useCallback<ToastCtx["toast"]>(
    ({ title, description, variant = "success" }) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, title, description, variant }]);
      setTimeout(() => remove(id), 3200);
    },
    [remove],
  );

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-[360px] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-[14px] border border-line2 bg-card p-4 shadow-card"
            style={{ animation: "fadeUp 0.25s ease both" }}
          >
            <span
              className={cn(
                "mt-[1px] shrink-0",
                t.variant === "success" ? "text-ok" : "text-acc",
              )}
            >
              {t.variant === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <Info size={18} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-ink">{t.title}</div>
              {t.description && (
                <div className="mt-[2px] text-[13px] text-body">
                  {t.description}
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => remove(t.id)}
              className="shrink-0 text-mute hover:text-ink"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
