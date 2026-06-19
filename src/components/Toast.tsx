// 간단한 전역 토스트 (성공/오류 피드백)
import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

type Toast = { id: number; msg: string; type: "info" | "error" };

const Ctx = createContext<{ show: (msg: string, type?: "info" | "error") => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const show = useCallback((msg: string, type: "info" | "error" = "info") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, msg, type }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-20 sm:bottom-4 inset-x-0 flex flex-col items-center gap-2 z-50 px-4 pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "error"
                ? "bg-red-500/90 text-white border border-red-400/30"
                : "bg-zinc-800 text-zinc-100 border border-zinc-700"
            }`}
          >
            {t.type === "error" ? (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast must be used within ToastProvider");
  return c;
}
