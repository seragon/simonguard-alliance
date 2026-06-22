// 어드민 페이지: 탭으로 마스터데이터/계정 관리
import { useState } from "react";
import BrandModuleTab from "./admin/BrandModuleTab";
import FabricTab from "./admin/FabricTab";
import OrderCompanyTab from "./admin/OrderCompanyTab";

const TABS = [
  {
    key: "brand",
    label: "브랜드/모델/모듈",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z" />
      </svg>
    ),
    el: <BrandModuleTab />,
  },
  {
    key: "fabric",
    label: "원단",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    el: <FabricTab />,
  },
  {
    key: "company",
    label: "발주회사",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    el: <OrderCompanyTab />,
  },
];

export default function AdminPage() {
  const [tab, setTab] = useState("brand");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-apple-ink tracking-tight">어드민</h2>
        <p className="text-sm text-apple-ink-muted-48 mt-0.5">마스터 데이터를 관리합니다.</p>
      </div>

      {/* 탭: 모바일 화면에서 가로 스크롤 없이 자연스럽게 줄바꿈되도록 flex-wrap 적용 */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-normal tracking-tight transition-all active-scale whitespace-nowrap border ${
              tab === t.key
                ? "bg-apple-primary border-apple-primary text-white"
                : "bg-white border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink hover:bg-apple-canvas-parchment"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white border border-apple-hairline rounded-apple-lg p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        {TABS.find((t) => t.key === tab)?.el}
      </div>
    </div>
  );
}
