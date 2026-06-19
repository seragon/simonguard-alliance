// 어드민 페이지: 탭으로 마스터데이터/계정 관리
import { useState } from "react";
import BrandModuleTab from "./admin/BrandModuleTab";
import FabricTab from "./admin/FabricTab";
import OrderCompanyTab from "./admin/OrderCompanyTab";
import AccountTab from "./admin/AccountTab";

const TABS = [
  { key: "brand", label: "브랜드/모델/모듈", el: <BrandModuleTab /> },
  { key: "fabric", label: "원단", el: <FabricTab /> },
  { key: "company", label: "발주회사", el: <OrderCompanyTab /> },
  { key: "account", label: "사용자 계정", el: <AccountTab /> },
];

export default function AdminPage() {
  const [tab, setTab] = useState("brand");
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">어드민</h2>
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
              tab === t.key ? "bg-slate-900 text-white" : "bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>{TABS.find((t) => t.key === tab)?.el}</div>
    </div>
  );
}
