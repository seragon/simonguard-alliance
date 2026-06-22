// 사용자 계정 관리 + 로그아웃
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import AccountTab from "./admin/AccountTab";

export default function AccountPage() {
  const { profile, isSuperAdmin, signOut } = useAuth();
  const nav = useNavigate();

  async function handleLogout() {
    await signOut();
    nav("/login");
  }

  return (
    <div className="space-y-4 w-full">
      <div>
        <h2 className="text-xl font-bold text-apple-ink tracking-tight">계정</h2>
        <p className="text-sm text-apple-ink-muted-48 mt-0.5">
          {profile?.name || "(이름없음)"}{profile?.username ? ` · ${profile.username}` : ""}
        </p>
      </div>

      {/* 슈퍼관리자만 사용자 목록/생성 표시 */}
      {isSuperAdmin && (
        <div className="bg-white border border-apple-hairline rounded-apple-lg p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
          <AccountTab />
        </div>
      )}

      {/* 로그아웃 */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 border border-red-200 hover:border-red-300 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 rounded-apple-lg py-3 text-sm font-medium transition-all active-scale"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
        로그아웃
      </button>
    </div>
  );
}
