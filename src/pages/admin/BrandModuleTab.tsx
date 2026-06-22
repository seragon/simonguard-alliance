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
          <p className="text-xs text-zinc-500 font-medium">브랜드</p>
          <CrudList
            title="브랜드"
            items={brands.data ?? []}
            onCreate={(name) => cB.mutateAsync({ name })}
            onUpdate={(id, name) => uB.mutateAsync({ id, name })}
            onDelete={(id) => dB.mutateAsync(id)}
          />
        </div>
        {(brands.data ?? []).length > 0 ? (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(brands.data ?? []).map((b) => (
              <button
                key={b.id}
                onClick={() => { setBrandId(b.id); setModelId(undefined); }}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  brandId === b.id
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-600 px-1">브랜드를 추가하세요.</p>
        )}
      </div>

      {/* 소파 모델 */}
      <div className="space-y-2">
        {brandId ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 font-medium">소파 모델</p>
              <CrudList
                title="소파모델"
                items={models.data ?? []}
                onCreate={(name) => cM.mutateAsync({ name, brand_id: brandId })}
                onUpdate={(id, name) => uM.mutateAsync({ id, name })}
                onDelete={(id) => dM.mutateAsync(id)}
              />
            </div>
            {(models.data ?? []).length > 0 ? (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(models.data ?? []).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      modelId === m.id
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 px-1">소파 모델을 추가하세요.</p>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-16 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-600">위에서 브랜드를 선택하세요.</p>
          </div>
        )}
      </div>

      {/* 모듈 */}
      <div className="space-y-2">
        {modelId ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 font-medium">모듈</p>
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
          <div className="flex items-center justify-center h-16 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-600">위에서 소파 모델을 선택하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
