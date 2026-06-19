// 첫 진입 로그인 페이지
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
export default function LoginPage() {
  const { signIn, session } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (session) nav("/", { replace: true });
  }, [session, nav]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const { error } = await signIn(email, pw); setBusy(false);
    if (error) setErr("로그인 실패. 이메일/비밀번호를 확인하세요."); else nav("/", { replace: true });
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-center">사이몬가드얼라이언스</h1>
        <input className="w-full border rounded-lg px-3 py-3" type="email" placeholder="이메일"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border rounded-lg px-3 py-3" type="password" placeholder="비밀번호"
          value={pw} onChange={(e) => setPw(e.target.value)} required />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={busy} className="w-full bg-slate-900 text-white rounded-lg py-3 disabled:opacity-50">
          {busy ? "로그인 중…" : "로그인"}
        </button>
      </form>
    </div>
  );
}
