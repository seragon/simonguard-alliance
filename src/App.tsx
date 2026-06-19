// 라우트 정의
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { RequireAuth } from "./auth/RequireAuth";
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><div className="p-6">메인 (Task 8에서 구현)</div></RequireAuth>} />
    </Routes>
  );
}
