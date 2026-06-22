// 브랜드→모델→모듈 계층 관리 탭
import { useState } from "react";
import { useBrands, useSofaModels, useModules, useCreate, useUpdate, useDelete } from "../../data/masterData";
import CrudList from "../../components/CrudList";
import ModuleCardGrid from "../../components/ModuleCardGrid";

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
          <CrudList
            title="브랜드"
            items={brands.data ?? []}
            onCreate={(name) => cB.mutateAsync({ name })}
            onUpdate={(id, name) => uB.mutateAsync({ id, name })}
            onDelete={(id) => dB.mutateAsync(id)}
          />
        </div>
        {(brands.data ?? []).length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {(brands.data ?? []).map((b) => (
              <button
                key={b.id}
                onClick={() => { setBrandId(b.id); setModelId(undefined); }}
                className={`flex flex-col items-center justify-center p-3 rounded-apple-lg text-xs font-semibold tracking-tight transition-all active-scale border text-center ${
                  brandId === b.id
                    ? "bg-apple-primary/5 border-apple-primary text-apple-primary"
                    : "bg-white border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink hover:bg-apple-canvas-parchment"
                }`}
              >
                {b.name}
              </button>
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
