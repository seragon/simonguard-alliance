import { useState } from "react";
import { useBrands, useSofaModels, useModules, useCreate, useUpdate, useDelete } from "../../data/masterData";
import CrudList from "../../components/CrudList";
import ModuleCardGrid from "../../components/ModuleCardGrid";
import ImageUpload from "../../components/ImageUpload";
import { useToast } from "../../components/Toast";
import type { Brand } from "../../types/db";

const inputCls = "w-full bg-white border border-apple-hairline text-apple-ink placeholder:text-apple-ink-muted-48 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apple-primary/20 focus:border-apple-primary transition-all font-sans";

function BrandCard({ brand, selected, onSelect, onSave, onDelete }: {
  brand: Brand;
  selected: boolean;
  onSelect: () => void;
  onSave: (name: string, imageUrl: string | null) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const { show } = useToast();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(brand.name);
  const [imageUrl, setImageUrl] = useState<string | null>(brand.image_url ?? null);

  if (edit) {
    return (
      <div className="bg-white border border-apple-primary/30 rounded-apple-lg p-3 space-y-2 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
        <div className="flex gap-2">
          <button
            className="flex-1 bg-apple-primary hover:bg-apple-primary-focus text-white rounded-full py-1.5 text-xs font-medium transition-all active-scale"
            onClick={async () => {
              try { await onSave(name.trim(), imageUrl); setEdit(false); show("수정됨"); }
              catch (e) { show((e as Error).message ?? "오류", "error"); }
            }}>저장</button>
          <button
            className="px-3 border border-apple-hairline text-apple-ink-muted-80 rounded-full text-xs transition-all active-scale"
            onClick={() => { setEdit(false); setName(brand.name); setImageUrl(brand.image_url ?? null); }}>취소</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={onSelect}
        className={`w-full flex flex-col items-center p-3 rounded-apple-lg text-xs font-semibold tracking-tight transition-all active-scale border text-center ${
          selected
            ? "bg-apple-primary/5 border-apple-primary text-apple-primary"
            : "bg-white border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink hover:bg-apple-canvas-parchment"
        }`}
      >
        {brand.image_url ? (
          <div className="w-full max-h-[60px] min-h-[50px] flex items-center justify-center overflow-hidden mb-1.5 bg-white border border-apple-hairline/20 rounded-apple-sm">
            <img src={brand.image_url} alt={brand.name} className="w-full h-auto object-contain mix-blend-multiply" />
          </div>
        ) : (
          <div className="w-full max-h-[60px] min-h-[50px] rounded-apple-sm bg-apple-canvas-parchment border border-apple-hairline flex items-center justify-center mb-1.5">
            <svg className="w-5 h-5 text-apple-ink-muted-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
            </svg>
          </div>
        )}
        {brand.name}
      </button>
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1 bg-white/90 hover:bg-apple-primary/10 rounded text-apple-primary transition-colors"
          onClick={(e) => { e.stopPropagation(); setEdit(true); }}
          title="수정"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </button>
        <button
          className="p-1 bg-white/90 hover:bg-red-50 rounded text-red-500 transition-colors"
          onClick={async (e) => {
            e.stopPropagation();
            if (!confirm("삭제할까요?")) return;
            try { await onDelete(); show("삭제됨"); }
            catch (err) { show((err as Error).message ?? "삭제 오류", "error"); }
          }}
          title="삭제"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function BrandModuleTab() {
  const { show } = useToast();
  const [brandId, setBrandId] = useState<string>();
  const [modelId, setModelId] = useState<string>();
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandImage, setNewBrandImage] = useState<string | null>(null);
  const brands = useBrands();
  const models = useSofaModels(brandId);
  const modules = useModules(modelId);

  const cB = useCreate("brands"), uB = useUpdate("brands"), dB = useDelete("brands");
  const cM = useCreate("sofa_models"), uM = useUpdate("sofa_models"), dM = useDelete("sofa_models");
  const cMo = useCreate("modules"), uMo = useUpdate("modules"), dMo = useDelete("modules");

  async function handleCreateBrand() {
    if (!newBrandName.trim()) return;
    try {
      await cB.mutateAsync({ name: newBrandName.trim(), image_url: newBrandImage });
      setNewBrandName(""); setNewBrandImage(null); show("추가됨");
    } catch (e) { show((e as Error).message ?? "오류", "error"); }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 브랜드 */}
      <div className="space-y-2">
        <p className="text-xs text-apple-ink-muted-80 font-semibold tracking-tight">브랜드</p>

        {/* 추가 폼 */}
        <div className="bg-white border border-apple-hairline rounded-apple-lg p-4 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
          <input className={inputCls} placeholder="브랜드 이름 입력" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} />
          <ImageUpload value={newBrandImage} onChange={setNewBrandImage} />
          <button onClick={handleCreateBrand} className="w-full bg-apple-primary hover:bg-apple-primary-focus text-white rounded-full py-2.5 text-sm font-medium transition-all active-scale">추가</button>
        </div>

        {(brands.data ?? []).length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {(brands.data ?? []).map((b) => (
              <BrandCard
                key={b.id}
                brand={b}
                selected={brandId === b.id}
                onSelect={() => { setBrandId(b.id); setModelId(undefined); }}
                onSave={(name, img) => uB.mutateAsync({ id: b.id, name, image_url: img })}
                onDelete={() => dB.mutateAsync(b.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-apple-ink-muted-48 px-1">브랜드를 추가하세요.</p>
        )}
      </div>

      {/* 소파 모델 */}
      <div className="space-y-2">
        {brandId ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-apple-ink-muted-80 font-semibold tracking-tight">소파 모델</p>
              <CrudList
                title="소파모델"
                items={models.data ?? []}
                onCreate={(name) => cM.mutateAsync({ name, brand_id: brandId })}
                onUpdate={(id, name) => uM.mutateAsync({ id, name })}
                onDelete={(id) => dM.mutateAsync(id)}
              />
            </div>
            {(models.data ?? []).length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {(models.data ?? []).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-apple-lg text-xs font-semibold tracking-tight transition-all active-scale border text-center ${
                      modelId === m.id
                        ? "bg-apple-primary/5 border-apple-primary text-apple-primary"
                        : "bg-white border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink hover:bg-apple-canvas-parchment"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-apple-ink-muted-48 px-1">소파 모델을 추가하세요.</p>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-16 border border-dashed border-apple-hairline rounded-apple-lg bg-white">
            <p className="text-xs text-apple-ink-muted-48">위에서 브랜드를 선택하세요.</p>
          </div>
        )}
      </div>

      {/* 모듈 */}
      <div className="space-y-2">
        {modelId ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-apple-ink-muted-80 font-semibold tracking-tight">모듈</p>
              {/* ModuleCardGrid 내부 관리 버튼 사용 */}
            </div>
            <ModuleCardGrid
              items={modules.data ?? []}
              onCreate={(name, imageUrl) => cMo.mutateAsync({ name, model_id: modelId, image_url: imageUrl })}
              onUpdate={(id, name, imageUrl) => uMo.mutateAsync({ id, name, image_url: imageUrl })}
              onDelete={(id) => dMo.mutateAsync(id)}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-16 border border-dashed border-apple-hairline rounded-apple-lg bg-white">
            <p className="text-xs text-apple-ink-muted-48">위에서 소파 모델을 선택하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
