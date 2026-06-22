// 첫 진입 로그인 페이지
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function LoginPage() {
  const { signIn, session } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) nav("/", { replace: true });
  }, [session, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await signIn(email, pw);
    setBusy(false);
    if (error) setErr("이메일 또는 비밀번호가 올바르지 않습니다.");
    else nav("/", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-apple-canvas-parchment relative overflow-hidden">
      {/* 장식적 요소를 모두 배제한 clean canvas */}
      <div className="relative w-full max-w-sm">
        {/* 로고 영역: 라이트 모드이므로 본래의 검은색 로고가 깔끔하게 노출되도록 필터 제거 */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img
            src="/logo_simonguard.png"
            alt="사이몬가드얼라이언스"
            className="h-9 w-auto mb-3"
          />
          <p className="text-xs text-apple-ink-muted-48 mt-1 tracking-tight font-medium">소파 발주 관리 시스템</p>
        </div>

        {/* 로그인 카드: rounded-apple-lg(18px) 적용 및 hairline border 형태의 화이트 캔버스 */}
        <form
          onSubmit={submit}
          className="bg-apple-canvas border border-apple-hairline rounded-apple-lg p-8 space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
        >
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-apple-ink-muted-80 mb-1.5 tracking-tight">이메일</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-apple-hairline text-apple-ink placeholder:text-apple-ink-muted-48 rounded-apple-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-apple-primary/20 focus:border-apple-primary transition-all font-sans"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-apple-ink-muted-80 mb-1.5 tracking-tight">비밀번호</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full bg-white border border-apple-hairline text-apple-ink placeholder:text-apple-ink-muted-48 rounded-apple-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-apple-primary/20 focus:border-apple-primary transition-all font-sans"
                placeholder="••••••••"
              />
            </div>
          </div>

          {err && (
            <div className="flex items-center gap-2 bg-red-50/80 border border-red-200/50 rounded-apple-sm px-3.5 py-2.5">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              <p className="text-xs font-medium text-red-600">{err}</p>
            </div>
          )}

          {/* Action Blue pill CTA 버튼 및 active-scale 스케일 모션 */}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-apple-primary hover:bg-apple-primary-focus text-white font-medium rounded-full py-2.5 text-sm transition-all active-scale active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "로그인 중…" : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
