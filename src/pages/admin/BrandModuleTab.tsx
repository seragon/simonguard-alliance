// 브랜드→모델→모듈 계층 관리 탭
import { useState } from "react";
import { useBrands, useSofaModels, useModules, useCreate, useUpdate, useDelete } from "../../data/masterData";
import CrudList from "../../components/CrudList";

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
    <div className="grid gap-6 md:grid-cols-3">
      {/* 브랜드 */}
      <div>
        <CrudList
          title="브랜드"
          items={brands.data ?? []}
          onCreate={(name) => cB.mutateAsync({ name })}
          onUpdate={(id, name) => uB.mutateAsync({ id, name })}
          onDelete={(id) => dB.mutateAsync(id)}
        />
        <ul className="mt-2 text-sm">
          {(brands.data ?? []).map((b) => (
            <li key={b.id}>
              <button
                className={brandId === b.id ? "font-bold" : ""}
                onClick={() => { setBrandId(b.id); setModelId(undefined); }}
              >
                · {b.name} 선택
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 소파 모델 */}
      <div>
        {brandId ? (
          <>
            <CrudList
              title="소파 모델"
              items={models.data ?? []}
              onCreate={(name) => cM.mutateAsync({ name, brand_id: brandId })}
              onUpdate={(id, name) => uM.mutateAsync({ id, name })}
              onDelete={(id) => dM.mutateAsync(id)}
            />
            <ul className="mt-2 text-sm">
              {(models.data ?? []).map((m) => (
                <li key={m.id}>
                  <button
                    className={modelId === m.id ? "font-bold" : ""}
                    onClick={() => setModelId(m.id)}
                  >
                    · {m.name} 선택
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-slate-500">브랜드를 선택하세요.</p>
        )}
      </div>

      {/* 모듈 */}
      <div>
        {modelId ? (
          <CrudList
            title="모듈"
            items={modules.data ?? []}
            onCreate={(name) => cMo.mutateAsync({ name, model_id: modelId })}
            onUpdate={(id, name) => uMo.mutateAsync({ id, name })}
            onDelete={(id) => dMo.mutateAsync(id)}
          />
        ) : (
          <p className="text-sm text-slate-500">모델을 선택하세요.</p>
        )}
      </div>
    </div>
  );
}
