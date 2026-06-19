// 사용자 계정 목록 및 생성 탭 (슈퍼관리자 전용)
import { useState } from "react";
import { useAccounts, useCreateAccount } from "../../data/accounts";
import { useToast } from "../../components/Toast";

export default function AccountTab() {
  const { show } = useToast();
  const accounts = useAccounts();
  const create = useCreateAccount();
  const [f, setF] = useState({ email: "", password: "", name: "", role: "user" as "user" | "super_admin" });

  async function submit() {
    if (!f.email || !f.password) {
      show("이메일/비밀번호를 입력하세요.", "error");
      return;
    }
    try {
      await create.mutateAsync(f);
      setF({ email: "", password: "", name: "", role: "user" });
      show("계정 생성됨");
    } catch (e) {
      show("계정 생성 실패: " + (e as Error).message, "error");
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <h3 className="font-semibold">계정 생성</h3>
      <div className="grid gap-2">
        <input className="border rounded-lg px-3 py-2" placeholder="이메일"
          value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="비밀번호" type="text"
          value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="이름"
          value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <select className="border rounded-lg px-3 py-2"
          value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as "user" | "super_admin" })}>
          <option value="user">일반 사용자</option>
          <option value="super_admin">슈퍼 관리자</option>
        </select>
        <button className="bg-slate-900 text-white rounded-lg py-2" onClick={submit} disabled={create.isPending}>
          {create.isPending ? "생성 중…" : "계정 생성"}
        </button>
      </div>
      <h3 className="font-semibold">사용자 목록</h3>
      <ul className="divide-y border rounded-lg">
        {(accounts.data ?? []).map((a) => (
          <li key={a.id} className="flex justify-between px-3 py-2">
            <span>{a.name || "(이름없음)"}</span>
            <span className="text-sm text-slate-500">{a.role === "super_admin" ? "슈퍼관리자" : "일반"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
