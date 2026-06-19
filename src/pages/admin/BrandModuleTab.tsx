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
      <div className="space-y-3">
        <CrudList
          title="브랜드"
          items={brands.data ?? []}
          onCreate={(name) => cB.mutateAsync({ name })}
          onUpdate={(id, name) => uB.mutateAsync({ id, name })}
          onDelete={(id) => dB.mutateAsync(id)}
        />
        {(brands.data ?? []).length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 font-medium px-1">브랜드 선택 → 모델 관리</p>
            <div className="flex flex-wrap gap-2">
              {(brands.data ?? []).map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setBrandId(b.id); setModelId(undefined); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    brandId === b.id
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                      : "text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 소파 모델 */}
      <div className="space-y-3">
        {brandId ? (
          <>
            <CrudList
              title="소파 모델"
              items={models.data ?? []}
              onCreate={(name) => cM.mutateAsync({ name, brand_id: brandId })}
              onUpdate={(id, name) => uM.mutateAsync({ id, name })}
              onDelete={(id) => dM.mutateAsync(id)}
            />
            {(models.data ?? []).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 font-medium px-1">모델 선택 → 모듈 관리</p>
                <div className="flex flex-wrap gap-2">
                  {(models.data ?? []).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModelId(m.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        modelId === m.id
                          ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                          : "text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-24 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-600">← 브랜드를 선택하세요.</p>
          </div>
        )}
      </div>

      {/* 모듈 */}
      <div>
        {modelId ? (
          <ModuleCardGrid
            items={modules.data ?? []}
            onCreate={(name, imageUrl) => cMo.mutateAsync({ name, model_id: modelId, image_url: imageUrl })}
            onUpdate={(id, name, imageUrl) => uMo.mutateAsync({ id, name, image_url: imageUrl })}
            onDelete={(id) => dMo.mutateAsync(id)}
          />
        ) : (
          <div className="flex items-center justify-center h-24 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-600">← 모델을 선택하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
