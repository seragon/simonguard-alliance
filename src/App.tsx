// 라우트 정의 (레이아웃 중첩)
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/AppLayout";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireSuperAdmin } from "./auth/RequireSuperAdmin";
import HomePage from "./pages/HomePage";
import OrderFormPage from "./pages/OrderFormPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/orders/new" element={<OrderFormPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/orders/:id/edit" element={<OrderFormPage />} />
        <Route path="/admin" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
      </Route>
    </Routes>
  );
}
