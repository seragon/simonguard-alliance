// 사용자 계정 목록 및 생성 탭 (슈퍼관리자 전용)
import { useState } from "react";
import { useAccounts, useCreateAccount } from "../../data/accounts";
import { useToast } from "../../components/Toast";

export default function AccountTab() {
  const { show } = useToast();
  const accounts = useAccounts();
  const create = useCreateAccount();
  const [f, setF] = useState({ email: "", password: "", name: "", role: "user" as "user" | "super_admin" });

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors";

  async function submit() {
    if (!f.email || !f.password) { show("이메일/비밀번호를 입력하세요.", "error"); return; }
    try {
      await create.mutateAsync(f);
      setF({ email: "", password: "", name: "", role: "user" });
      show("계정 생성됨");
    } catch (e) {
      show("계정 생성 실패: " + (e as Error).message, "error");
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* 계정 생성 폼 */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-100 mb-3">새 계정 생성</h3>
        <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">이메일</label>
            <input className={inputCls} type="email" placeholder="user@example.com"
              value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">비밀번호</label>
            <input className={inputCls} placeholder="비밀번호 입력" type="text"
              value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">이름</label>
            <input className={inputCls} placeholder="홍길동"
              value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">권한</label>
            <select className={inputCls}
              value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as "user" | "super_admin" })}>
              <option value="user">일반 사용자</option>
              <option value="super_admin">슈퍼 관리자</option>
            </select>
          </div>
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            onClick={submit}
            disabled={create.isPending}
          >
            {create.isPending ? "생성 중…" : "계정 생성"}
          </button>
        </div>
      </div>

      {/* 사용자 목록 */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-100 mb-3">사용자 목록</h3>
        <ul className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
          {(accounts.data ?? []).map((a) => (
            <li key={a.id} className="flex items-center justify-between px-4 py-3 bg-zinc-900">
              <div>
                <p className="text-sm text-zinc-200">{a.name || "(이름없음)"}</p>
                <p className="text-xs text-zinc-500">{a.id.slice(0, 8)}…</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                a.role === "super_admin"
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}>
                {a.role === "super_admin" ? "슈퍼관리자" : "일반"}
              </span>
            </li>
          ))}
          {accounts.data?.length === 0 && (
            <li className="px-4 py-5 text-center text-sm text-zinc-600">사용자가 없습니다.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
