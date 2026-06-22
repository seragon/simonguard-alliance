// 사용자 계정 목록 및 생성 탭 (슈퍼관리자 전용)
import { useState } from "react";
import { useAccounts, useCreateAccount } from "../../data/accounts";
import { useToast } from "../../components/Toast";
import Modal from "../../components/Modal";

const inputCls = "w-full bg-white border border-apple-hairline text-apple-ink placeholder:text-apple-ink-muted-48 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apple-primary/20 focus:border-apple-primary transition-all font-sans";

export default function AccountTab() {
  const { show } = useToast();
  const accounts = useAccounts();
  const create = useCreateAccount();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ username: "", password: "", name: "", role: "user" as "user" | "super_admin" });

  async function submit() {
    if (!f.username || !f.password) { show("아이디/비밀번호를 입력하세요.", "error"); return; }
    try {
      await create.mutateAsync(f);
      setF({ username: "", password: "", name: "", role: "user" });
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
        <p className="text-xs text-apple-ink-muted-80 font-semibold tracking-tight">사용자 목록</p>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-apple-primary hover:bg-apple-primary-focus text-white rounded-full text-xs font-medium transition-all active-scale"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          계정 추가
        </button>
      </div>

      {/* 사용자 목록 */}
      <ul className="divide-y divide-apple-divider-soft border border-apple-hairline rounded-apple-lg overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        {(accounts.data ?? []).map((a) => (
          <li key={a.id} className="flex items-center justify-between px-4 py-3.5 bg-white hover:bg-apple-canvas-parchment transition-colors">
            <div>
              <p className="text-sm font-semibold text-apple-ink tracking-tight">{a.name || "(이름없음)"}</p>
              <p className="text-xs text-apple-ink-muted-48 mt-0.5">{a.username ?? a.id.slice(0, 8)}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
              a.role === "super_admin"
                ? "bg-apple-primary/10 text-apple-primary border-apple-primary/20"
                : "bg-apple-canvas-parchment text-apple-ink-muted-80 border-apple-hairline"
            }`}>
              {a.role === "super_admin" ? "슈퍼관리자" : "일반"}
            </span>
          </li>
        ))}
        {accounts.data?.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-apple-ink-muted-48">사용자가 없습니다.</li>
        )}
      </ul>

      {/* 계정 생성 모달 */}
      {open && (
        <Modal title="새 계정 생성" onClose={() => setOpen(false)}>
          <div>
            <label className="block text-xs font-semibold text-apple-ink-muted-80 mb-1.5">아이디</label>
            <input className={inputCls} type="text" autoComplete="username" placeholder="아이디 입력"
              value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} autoFocus />
          </div>
          <div>
            <label className="block text-xs font-semibold text-apple-ink-muted-80 mb-1.5">비밀번호</label>
            <input className={inputCls} type="text" placeholder="비밀번호 입력"
              value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-apple-ink-muted-80 mb-1.5">이름</label>
            <input className={inputCls} placeholder="홍길동"
              value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-apple-ink-muted-80 mb-1.5">권한</label>
            <select className={inputCls} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as "user" | "super_admin" })}>
              <option value="user">일반 사용자</option>
              <option value="super_admin">슈퍼 관리자</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1.5">
            <button
              className="flex-1 bg-apple-primary hover:bg-apple-primary-focus text-white rounded-full py-2.5 text-sm font-medium transition-all active-scale disabled:opacity-50"
              onClick={submit}
              disabled={create.isPending}
            >
              {create.isPending ? "생성 중…" : "계정 생성"}
            </button>
            <button onClick={() => setOpen(false)} className="px-4 border border-apple-hairline hover:border-zinc-300 text-apple-ink-muted-80 hover:text-apple-ink rounded-full text-sm transition-all active-scale">
              취소
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
