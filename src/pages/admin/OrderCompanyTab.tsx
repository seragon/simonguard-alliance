// 발주회사(로고 포함) 관리 탭
import { useState } from "react";
import { useOrderCompanies, useCreate, useUpdate, useDelete } from "../../data/masterData";
import ImageUpload from "../../components/ImageUpload";
import { useToast } from "../../components/Toast";
import type { OrderCompany } from "../../types/db";

const inputCls = "w-full bg-white border border-apple-hairline text-apple-ink placeholder:text-apple-ink-muted-48 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apple-primary/20 focus:border-apple-primary transition-all font-sans";

export default function OrderCompanyTab() {
  const { show } = useToast();
  const list = useOrderCompanies();
  const c = useCreate("order_companies"), u = useUpdate("order_companies"), d = useDelete("order_companies");
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      await c.mutateAsync({ name: name.trim(), image_url: imageUrl });
      setName(""); setImageUrl(null); show("추가됨");
    } catch (e) { show((e as Error).message ?? "오류", "error"); }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-apple-ink-muted-80 uppercase tracking-wider mb-2">발주회사</h3>

      {/* 추가 폼 */}
      <div className="bg-white border border-apple-hairline rounded-apple-lg p-5 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        <div>
          <label className="block text-xs font-semibold text-apple-ink-muted-80 mb-1.5">발주회사 이름</label>
          <input className={inputCls} placeholder="발주회사 이름 입력" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
        <button
          onClick={handleCreate}
          className="w-full bg-apple-primary hover:bg-apple-primary-focus text-white rounded-full py-2.5 text-sm font-medium transition-all active-scale"
        >추가</button>
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
              onSave={(name, img) => u.mutateAsync({ id: it.id, name, image_url: img })}
              onDelete={() => d.mutateAsync(it.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyRow({ item, onSave, onDelete }: {
  item: OrderCompany;
  onSave: (name: string, imageUrl: string | null) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const { show } = useToast();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(item.name);
  const [imageUrl, setImageUrl] = useState<string | null>(item.image_url ?? null);

  if (edit) {
    return (
      <div className="bg-white border border-apple-primary/30 rounded-apple-lg p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
        <div className="flex gap-2">
          <button
            className="flex-1 bg-apple-primary hover:bg-apple-primary-focus text-white rounded-full py-2 text-xs font-medium transition-all active-scale"
            onClick={async () => {
              try { await onSave(name.trim(), imageUrl); setEdit(false); show("수정됨"); }
              catch (e) { show((e as Error).message ?? "오류", "error"); }
            }}>저장</button>
          <button
            className="px-3 border border-apple-hairline hover:border-zinc-300 text-apple-ink-muted-80 hover:text-apple-ink rounded-full text-xs transition-all active-scale"
            onClick={() => { setEdit(false); setName(item.name); setImageUrl(item.image_url ?? null); }}>취소</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group bg-white border border-apple-hairline hover:border-apple-primary/30 rounded-apple-lg p-3.5 flex flex-col items-center gap-2.5 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
      {/* 로고 */}
      {item.image_url ? (
        <div className="w-full max-h-[60px] min-h-[50px] flex items-center justify-center overflow-hidden mb-1.5 bg-white border border-apple-hairline/20 rounded-apple-sm">
          <img src={item.image_url} alt={item.name} className="w-full h-auto object-contain" />
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
      {/* 수정/삭제 버튼 — hover 시 표시 */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1 bg-apple-canvas-parchment hover:bg-apple-primary/10 rounded text-apple-primary transition-colors"
          onClick={() => setEdit(true)}
          title="수정"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </button>
        <button
          className="p-1 bg-apple-canvas-parchment hover:bg-red-50 rounded text-red-600 transition-colors"
          onClick={async () => {
            if (!confirm("삭제할까요?")) return;
            try { await onDelete(); show("삭제됨"); }
            catch (e) { show((e as Error).message ?? "삭제 오류", "error"); }
          }}
          title="삭제"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
