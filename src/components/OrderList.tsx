// 발주 목록 + 상태/브랜드/발주회사/기간 필터
import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../data/orders";
import { useBrands, useOrderCompanies } from "../data/masterData";
import { ALL_STATUSES, statusLabel, statusBadge } from "../domain/status";
import type { OrderStatus } from "../types/db";

export default function OrderList() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [brandId, setBrandId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false); // 필터 영역 접힘/열림 상태 관리
  
  const brands = useBrands();
  const companies = useOrderCompanies();
  const orders = useOrders({
    status: status || undefined,
    brand_id: brandId || undefined,
    order_company_id: companyId || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  // 필터가 하나라도 적용되어 있는지 여부 계산
  const hasActiveFilters = !!(status || brandId || companyId || from || to);

  // Apple 캡슐형 입력 폼 스타일
  const sel = "bg-white border border-apple-hairline text-apple-ink rounded-full px-3.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20 focus:border-apple-primary transition-all font-sans";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-apple-ink tracking-tight">발주 리스트</h2>
          {/* 필터 토글 버튼: Apple capsule button 형상 적용 */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-normal transition-all border active-scale ${
              isFilterOpen || hasActiveFilters
                ? "bg-apple-primary/10 border-apple-primary/30 text-apple-primary"
                : "bg-white border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink hover:border-zinc-300"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            필터 검색
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-apple-primary animate-pulse" />
            )}
          </button>
        </div>
        {/* 발주 등록: Action Blue pill CTA 버튼 */}
        <Link
          to="/orders/new"
          className="inline-flex items-center gap-1.5 bg-apple-primary hover:bg-apple-primary-focus text-white rounded-full px-4 py-2 text-xs font-medium transition-all active-scale"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          발주 등록
        </Link>
      </div>

      {/* 필터 영역: 검색 토글 상태에 따라 슬라이드 다운 애니메이션 제공 */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isFilterOpen ? "max-h-60 opacity-100 mb-2" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-wrap gap-2 pb-2">
          <select className={sel} value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "")}>
            <option value="">상태 전체</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          <select className={sel} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            <option value="">브랜드 전체</option>
            {(brands.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className={sel} value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            <option value="">발주처 전체</option>
            {(companies.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" className={sel} value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className={sel} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {/* 리스트: Apple Store Utility Card 감성의 2열 그리드 구조 */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {(orders.data ?? []).map((o) => (
          <li key={o.id} className="bg-apple-canvas border border-apple-hairline rounded-apple-lg transition-all duration-200 hover:border-apple-primary/30 active-scale shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
            <Link
              to={`/orders/${o.id}`}
              className="flex flex-col justify-between p-4 h-full min-h-[100px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[15px] text-apple-ink tracking-tight truncate">{o.brand_name} {o.model_name}</p>
                  <p className="text-xs text-apple-ink-muted-80 font-normal mt-1 truncate">{o.order_company_name}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-tight flex-shrink-0 ${statusBadge(o.status)}`}>
                  {statusLabel(o.status)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-apple-divider-soft mt-3.5 pt-2.5 text-[11px] text-apple-ink-muted-48">
                <span>납기 {o.due_date}</span>
                <span className="text-apple-primary font-medium inline-flex items-center gap-0.5">
                  상세보기
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </span>
              </div>
            </Link>
          </li>
        ))}
        {orders.data?.length === 0 && (
          <li className="col-span-full bg-apple-canvas border border-apple-hairline rounded-apple-lg py-12 text-center">
            <p className="text-apple-ink-muted-48 text-sm">등록된 발주가 없습니다.</p>
          </li>
        )}
      </ul>
    </div>
  );
}
