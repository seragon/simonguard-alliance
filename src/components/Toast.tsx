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
      <div className="fixed bottom-4 inset-x-0 flex flex-col items-center gap-2 z-50 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-lg text-white shadow-lg text-sm transition-all ${
              t.type === "error" ? "bg-red-600" : "bg-slate-800"
            }`}
          >
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
