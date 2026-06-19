// 발주 목록 + 상태/브랜드/발주회사/기간 필터
import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../data/orders";
import { useBrands, useOrderCompanies } from "../data/masterData";
import { ALL_STATUSES, statusLabel, statusColor } from "../domain/status";
import type { OrderStatus } from "../types/db";

export default function OrderList() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [brandId, setBrandId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const brands = useBrands();
  const companies = useOrderCompanies();
  const orders = useOrders({
    status: status || undefined,
    brand_id: brandId || undefined,
    order_company_id: companyId || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const sel = "border rounded-lg px-2 py-2 text-sm";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">발주 리스트</h2>
        <Link to="/orders/new" className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm">
          발주 등록
        </Link>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2">
        <select className={sel} value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "")}>
          <option value="">상태 전체</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <select className={sel} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
          <option value="">브랜드 전체</option>
          {(brands.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className={sel} value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          <option value="">발주회사 전체</option>
          {(companies.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" className={sel} value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className={sel} value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {/* 리스트 */}
      <ul className="divide-y border rounded-lg">
        {(orders.data ?? []).map((o) => (
          <li key={o.id}>
            <Link to={`/orders/${o.id}`} className="flex items-center gap-3 px-3 py-3">
              <span className={`w-2.5 h-2.5 rounded-full ${statusColor(o.status)}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{o.brand_name} {o.model_name}</p>
                <p className="text-xs text-slate-500 truncate">{o.order_company_name} · 납기 {o.due_date}</p>
              </div>
              <span className="text-xs">{statusLabel(o.status)}</span>
            </Link>
          </li>
        ))}
        {orders.data?.length === 0 && (
          <li className="px-3 py-6 text-center text-slate-500 text-sm">발주가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
