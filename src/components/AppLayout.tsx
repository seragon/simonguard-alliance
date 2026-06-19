// 반응형 앱 셸: 상단 헤더 + 모바일 하단 탭/데스크톱 상단 메뉴
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function AppLayout() {
  const { isSuperAdmin, signOut } = useAuth();
  const nav = useNavigate();

  const link = "px-3 py-2 rounded-lg text-sm";
  const active = ({ isActive }: { isActive: boolean }) =>
    `${link} ${isActive ? "bg-slate-900 text-white" : "text-slate-700"}`;

  async function handleLogout() {
    await signOut();
    nav("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-4 h-14 border-b bg-white sticky top-0 z-40">
        <span className="font-bold">사이몬가드얼라이언스</span>
        {/* 데스크톱 내비 */}
        <nav className="hidden sm:flex gap-1 items-center">
          <NavLink to="/" className={active} end>발주</NavLink>
          {isSuperAdmin && <NavLink to="/admin" className={active}>어드민</NavLink>}
          <button onClick={handleLogout} className={link}>로그아웃</button>
        </nav>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 pb-20 sm:pb-4 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>

      {/* 모바일 하단 탭 */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 h-16 border-t bg-white flex justify-around items-center z-40">
        <NavLink to="/" className={active} end>발주</NavLink>
        {isSuperAdmin && <NavLink to="/admin" className={active}>어드민</NavLink>}
        <button onClick={handleLogout} className={link}>로그아웃</button>
      </nav>
    </div>
  );
}
