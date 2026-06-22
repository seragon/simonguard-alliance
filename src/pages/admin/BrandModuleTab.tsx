import { useState } from "react";
import { useBrands, useSofaModels, useModules, useCreate, useUpdate, useDelete } from "../../data/masterData";
import CrudList from "../../components/CrudList";
import ModuleCardGrid from "../../components/ModuleCardGrid";
import type { Brand } from "../../types/db";
import ImageCrudList from "../../components/ImageCrudList";

function BrandCard({ brand, selected, onSelect }: {
  brand: Brand;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
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
          <img src={brand.image_url} alt={brand.name} className="w-full h-auto max-h-[60px] min-h-[50px] object-contain mix-blend-multiply" />
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
  );
}

export default function BrandModuleTab() {
  const [brandId, setBrandId] = useState<string>();
  const [modelId, setModelId] = useState<string>();
  const brands = useBrands();
  const models = useSofaModels(brandId);
  const modules = useModules(modelId);

  const cB = useCreate("brands"), uB = useUpdate("brands"), dB = useDelete("brands");
  const cM = useCreate("sofa_models"), uM = useUpdate("sofa_models"), dM = useDelete("sofa_models");
  const cMo = useCreate("modules"), uMo = useUpdate("modules"), dMo = useDelete("modules");


  return (
    <div className="flex flex-col gap-6">
      {/* 브랜드 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-apple-ink-muted-80 font-semibold tracking-tight">브랜드</p>
          <ImageCrudList
            title="브랜드"
            items={brands.data ?? []}
            onCreate={(name, imageUrl) => cB.mutateAsync({ name, image_url: imageUrl })}
            onUpdate={(id, name, imageUrl) => uB.mutateAsync({ id, name, image_url: imageUrl })}
            onDelete={(id) => dB.mutateAsync(id)}
            previewMode="logo"
          />
        </div>

        {(brands.data ?? []).length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {(brands.data ?? []).map((b) => (
              <BrandCard
                key={b.id}
                brand={b}
                selected={brandId === b.id}
                onSelect={() => { setBrandId(b.id); setModelId(undefined); }}
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
