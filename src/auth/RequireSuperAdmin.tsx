// 슈퍼관리자만 통과시키는 가드
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { isSuperAdmin, loading } = useAuth();
  if (loading) return <div className="p-6">불러오는 중…</div>;
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
