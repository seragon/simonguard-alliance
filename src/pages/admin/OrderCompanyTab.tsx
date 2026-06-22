// 발주회사(로고 포함) 관리 탭
import { useOrderCompanies, useCreate, useUpdate, useDelete } from "../../data/masterData";
import type { OrderCompany } from "../../types/db";
import ImageCrudList from "../../components/ImageCrudList";

export default function OrderCompanyTab() {
  const list = useOrderCompanies();
  const c = useCreate("order_companies"), u = useUpdate("order_companies"), d = useDelete("order_companies");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-apple-ink-muted-80 uppercase tracking-wider">발주회사</h3>
        <ImageCrudList
          title="발주회사"
          items={list.data ?? []}
          onCreate={(name, imageUrl) => c.mutateAsync({ name, image_url: imageUrl })}
          onUpdate={(id, name, imageUrl) => u.mutateAsync({ id, name, image_url: imageUrl })}
          onDelete={(id) => d.mutateAsync(id)}
          previewMode="logo"
        />
      </div>

      {/* 목록: 반응형 그리드 밸런스 개선 */}
      {(list.data ?? []).length === 0 ? (
        <p className="text-sm text-apple-ink-muted-48 px-1">발주회사를 추가하세요.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {(list.data ?? []).map((it) => (
            <CompanyRow
              key={it.id}
              item={it}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyRow({ item }: {
  item: OrderCompany;
}) {
  return (
    <div className="relative group bg-white border border-apple-hairline rounded-apple-lg p-3.5 flex flex-col items-center gap-2.5 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
      {/* 로고 */}
      {item.image_url ? (
        <div className="w-full max-h-[60px] min-h-[50px] flex items-center justify-center overflow-hidden mb-1.5 bg-white border border-apple-hairline/20 rounded-apple-sm">
          <img src={item.image_url} alt={item.name} className="w-full h-auto max-h-[60px] min-h-[50px] object-contain" />
        </div>
      ) : (
        <div className="w-full max-h-[60px] min-h-[50px] rounded-apple-sm bg-apple-canvas-parchment border border-apple-hairline flex items-center justify-center mb-1.5">
          <svg className="w-6 h-6 text-apple-ink-muted-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
          </svg>
        </div>
      )}
      {/* 이름 */}
      <p className="text-sm font-semibold text-apple-ink text-center leading-tight tracking-tight">{item.name}</p>
    </div>
  );
}
