// 미인증 사용자를 로그인으로 보내는 가드
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="p-6">불러오는 중…</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
