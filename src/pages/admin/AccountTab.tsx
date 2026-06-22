// 사용자 계정 목록 및 생성 탭 (슈퍼관리자 전용)
import { useState } from "react";
import { useAccounts, useCreateAccount } from "../../data/accounts";
import { useToast } from "../../components/Toast";
import Modal from "../../components/Modal";

const inputCls = "w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors";

export default function AccountTab() {
  const { show } = useToast();
  const accounts = useAccounts();
  const create = useCreateAccount();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ email: "", password: "", name: "", role: "user" as "user" | "super_admin" });

  async function submit() {
    if (!f.email || !f.password) { show("이메일/비밀번호를 입력하세요.", "error"); return; }
    try {
      await create.mutateAsync(f);
      setF({ email: "", password: "", name: "", role: "user" });
      setOpen(false);
      show("계정 생성됨");
    } catch (e) {
      show("계정 생성 실패: " + (e as Error).message, "error");
    }
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 font-medium">사용자 목록</p>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          계정 추가
        </button>
      </div>

      {/* 사용자 목록 */}
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

      {/* 계정 생성 모달 */}
      {open && (
        <Modal title="새 계정 생성" onClose={() => setOpen(false)}>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">이메일</label>
            <input className={inputCls} type="email" placeholder="user@example.com"
              value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">비밀번호</label>
            <input className={inputCls} type="text" placeholder="비밀번호 입력"
              value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">이름</label>
            <input className={inputCls} placeholder="홍길동"
              value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">권한</label>
            <select className={inputCls} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as "user" | "super_admin" })}>
              <option value="user">일반 사용자</option>
              <option value="super_admin">슈퍼 관리자</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              onClick={submit}
              disabled={create.isPending}
            >
              {create.isPending ? "생성 중…" : "계정 생성"}
            </button>
            <button onClick={() => setOpen(false)} className="px-4 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-100 rounded-lg text-sm transition-colors">
              취소
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
