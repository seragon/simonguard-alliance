// 반응형 앱 셸: 상단 헤더 + 모바일 하단 탭/데스크톱 상단 메뉴
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function AppLayout() {
  const { isSuperAdmin, signOut } = useAuth();
  const nav = useNavigate();

  async function handleLogout() {
    await signOut();
    nav("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-apple-canvas-parchment">
      {/* 상단 헤더: Apple Global Nav 규격 (높이 44px, true black 배경, 얇은 경계선) */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-11 bg-apple-surface-black border-b border-zinc-900">
        <Link to="/" className="flex items-center gap-2 rounded-lg hover:opacity-80 transition-opacity" aria-label="홈으로">
          {/* 하얀색으로 렌더링되도록 brightness(0) invert(1) 필터 적용 */}
          <img
            src="/logo_simonguard.png"
            alt="사이몬가드얼라이언스"
            className="h-4 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <span className="text-[10px] text-zinc-500 font-medium border-l border-zinc-900 pl-2 ml-0.5 tracking-tight">
            발주관리 시스템
          </span>
        </Link>

        {/* 데스크톱 내비: Apple 타이포그래피 (12px, negative tracking, pure black과 대비되는 zinc-400 톤) */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1 rounded-full text-xs font-normal tracking-tight transition-colors active-scale ${
                isActive ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-100"
              }`
            }
          >
            발주
          </NavLink>
          {isSuperAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full text-xs font-normal tracking-tight transition-colors active-scale ${
                  isActive ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-100"
                }`
              }
            >
              어드민
            </NavLink>
          )}
          <button
            onClick={handleLogout}
            className="ml-1 px-3 py-1 rounded-full text-xs font-normal tracking-tight text-zinc-400 hover:text-zinc-100 transition-colors active-scale"
          >
            로그아웃
          </button>
        </nav>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 pb-24 sm:pb-6 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>

      {/* 모바일 하단 탭: Apple sub-nav Frosted Glass 스타일 (높이 52px, Parchment 80% 투명도, Action Blue 하이라이트) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-apple-canvas-parchment/80 backdrop-blur-md border-t border-apple-hairline flex justify-around items-center h-[52px] z-40">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-lg text-[10px] tracking-tight transition-colors active-scale ${
              isActive ? "text-apple-primary font-medium" : "text-apple-ink-muted-80 font-normal"
            }`
          }
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
          발주
        </NavLink>
        {isSuperAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-lg text-[10px] tracking-tight transition-colors active-scale ${
                isActive ? "text-apple-primary font-medium" : "text-apple-ink-muted-80 font-normal"
              }`
            }
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            어드민
          </NavLink>
        )}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-lg text-[10px] tracking-tight text-apple-ink-muted-80 font-normal transition-colors active-scale"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          로그아웃
        </button>
      </nav>
    </div>
  );
}
