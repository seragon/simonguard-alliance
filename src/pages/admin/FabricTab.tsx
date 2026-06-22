// 원단회사 → 원단이름 → 색상 3단계 계층 관리 탭
import { useState } from "react";
import { useFabricCompanies, useFabrics, useCreate, useUpdate, useDelete } from "../../data/masterData";
import ImageCrudList from "../../components/ImageCrudList";
import ImageUpload from "../../components/ImageUpload";
import { useToast } from "../../components/Toast";
import Modal from "../../components/Modal";
import type { Fabric } from "../../types/db";

const inputCls = "w-full bg-white border border-apple-hairline text-apple-ink placeholder:text-apple-ink-muted-48 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apple-primary/20 focus:border-apple-primary transition-all font-sans";

function groupByName(fabrics: Fabric[]): Map<string, Fabric[]> {
  const map = new Map<string, Fabric[]>();
  for (const f of fabrics) {
    const arr = map.get(f.name) ?? [];
    arr.push(f);
    map.set(f.name, arr);
  }
  return map;
}

export default function FabricTab() {
  const { show } = useToast();
  const [companyId, setCompanyId] = useState<string>();
  const [fabricModalOpen, setFabricModalOpen] = useState(false);
  const companies = useFabricCompanies();
  const fabrics = useFabrics(companyId);

  const cC = useCreate("fabric_companies"), uC = useUpdate("fabric_companies"), dC = useDelete("fabric_companies");
  const cF = useCreate("fabrics"), uF = useUpdate("fabrics"), dF = useDelete("fabrics");

  const grouped = groupByName(fabrics.data ?? []);
  const fabricNames = Array.from(grouped.keys());

  return (
    <div className="flex flex-col gap-6">
      {/* 원단회사 탭 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-apple-ink-muted-80 font-semibold tracking-tight">원단회사</p>
          <ImageCrudList
            title="원단회사"
            items={companies.data ?? []}
            onCreate={(name, imageUrl) => cC.mutateAsync({ name, image_url: imageUrl })}
            onUpdate={(id, name, imageUrl) => uC.mutateAsync({ id, name, image_url: imageUrl })}
            onDelete={(id) => dC.mutateAsync(id)}
            previewMode="logo"
          />
        </div>
        {(companies.data ?? []).length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {(companies.data ?? []).map((c) => (
              <button
                key={c.id}
                onClick={() => { setCompanyId(c.id); setFabricModalOpen(false); }}
                className={`flex flex-col items-center justify-center p-3 rounded-apple-lg text-xs font-semibold tracking-tight transition-all active-scale border text-center ${companyId === c.id
                    ? "bg-apple-primary/5 border-apple-primary text-apple-primary"
                    : "bg-white border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink hover:bg-apple-canvas-parchment"
                  }`}
              >
                {c.image_url ? (
                  <div className="w-full max-h-[60px] min-h-[50px] flex items-center justify-center overflow-hidden mb-1.5 bg-white border border-apple-hairline/30 rounded-apple-sm">
                    <img src={c.image_url} alt="" className="w-full h-auto max-h-[60px] min-h-[50px] object-contain" />
                  </div>
                ) : (
                  <div className="w-full max-h-[60px] min-h-[50px] bg-apple-canvas border border-apple-hairline flex items-center justify-center mb-1.5 rounded-apple-sm">
                    <svg className="w-4 h-4 text-apple-ink-muted-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                    </svg>
                  </div>
                )}
                <span className="truncate w-full text-[11px]">{c.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-apple-ink-muted-48 px-1">원단회사를 추가하세요.</p>
        )}
      </div>

      {/* 원단 목록 (이름 → 색상 그룹핑) */}
      <div className="space-y-2">
        {companyId ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-apple-ink-muted-80 font-semibold tracking-tight">원단</p>
              <button
                onClick={() => setFabricModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-apple-canvas-parchment border border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink rounded-full text-xs font-normal transition-all active-scale"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                원단 관리
              </button>
            </div>

            {fabricNames.length > 0 ? (
              <div className="space-y-3">
                {fabricNames.map((name) => {
                  const colors = grouped.get(name)!;
                  const sample = colors.find((f) => f.image_url);
                  return (
                    <div key={name} className="border border-apple-hairline rounded-apple-lg overflow-hidden bg-white">
                      {/* 원단명 헤더 */}
                      <div className="flex items-center gap-3 px-3 py-2.5 bg-apple-canvas-parchment/60 border-b border-apple-hairline">
                        {sample?.image_url ? (
                          <img src={sample.image_url} alt="" className="w-7 h-7 object-cover rounded-md border border-apple-hairline flex-shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-apple-canvas border border-apple-hairline flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-apple-ink">{name}</span>
                        <span className="ml-auto text-xs text-apple-ink-muted-48">{colors.length}색</span>
                      </div>
                      {/* 색상 목록 */}
                      <div className="grid grid-cols-3 gap-2 px-3 py-2.5 bg-white">
                        {colors.map((f) => (
                          <div key={f.id} className="flex flex-col items-center gap-1">
                            {f.image_url ? (
                              <img src={f.image_url} alt={f.color} className="w-full aspect-square object-cover rounded-apple-lg border border-apple-hairline" />
                            ) : (
                              <div className="w-full aspect-square rounded-apple-lg bg-apple-canvas border border-apple-hairline" />
                            )}
                            <span className="text-xs text-apple-ink-muted-80 text-center leading-tight">{f.color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-apple-ink-muted-48 px-1">원단을 추가하세요.</p>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-16 border border-dashed border-apple-hairline rounded-apple-lg bg-white">
            <p className="text-xs text-apple-ink-muted-48">위에서 원단회사를 선택하세요.</p>
          </div>
        )}
      </div>

      {/* 원단 관리 모달 */}
      {fabricModalOpen && companyId && (
        <Modal title="원단 관리" onClose={() => setFabricModalOpen(false)}>
          {/* 추가 폼 */}
          <FabricAddForm
            existingNames={fabricNames}
            onAdd={async (name, color, imageUrl) => {
              await cF.mutateAsync({ company_id: companyId, name, color, image_url: imageUrl });
              show("추가됨");
            }}
          />

          {/* 이름별 그룹 목록 */}
          {fabricNames.length > 0 && (
            <div className="border-t border-apple-hairline pt-3 space-y-3 max-h-72 overflow-y-auto">
              {fabricNames.map((name) => {
                const colors = grouped.get(name)!;
                return (
                  <div key={name} className="border border-apple-hairline rounded-apple-lg overflow-hidden bg-white">
                    <div className="px-3 py-2 bg-apple-canvas-parchment/60 border-b border-apple-hairline">
                      <span className="text-xs font-semibold text-apple-ink">{name}</span>
                    </div>
                    <ul className="divide-y divide-apple-hairline">
                      {colors.map((f) => (
                        <FabricColorRow
                          key={f.id}
                          fabric={f}
                          existingNames={fabricNames}
                          onSave={(newName, color, imageUrl) =>
                            uF.mutateAsync({ id: f.id, name: newName, color, image_url: imageUrl })
                          }
                          onDelete={() => dF.mutateAsync(f.id)}
                        />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function FabricAddForm({ existingNames, onAdd }: {
  existingNames: string[];
  onAdd: (name: string, color: string, imageUrl: string | null) => Promise<void>;
}) {
  const { show } = useToast();
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [img, setImg] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim() || !color.trim()) { show("원단명과 색상을 입력하세요.", "error"); return; }
    try { await onAdd(name.trim(), color.trim(), img); setColor(""); setImg(null); }
    catch (e) { show((e as Error).message ?? "오류", "error"); }
  }

  return (
    <div className="space-y-2">
      <input
        className={inputCls}
        placeholder="원단명 (기존 이름 입력 시 색상 추가)"
        list="fabric-names"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <datalist id="fabric-names">
        {existingNames.map((n) => <option key={n} value={n} />)}
      </datalist>
      <input className={inputCls} placeholder="색상" value={color} onChange={(e) => setColor(e.target.value)} />
      <ImageUpload value={img} onChange={setImg} label="원단 이미지 (선택)" />
      <button onClick={handleAdd} className="w-full bg-apple-primary hover:bg-apple-primary-focus text-white rounded-full py-2.5 text-sm font-semibold transition-all active-scale">
        추가
      </button>
    </div>
  );
}

function FabricColorRow({ fabric, existingNames, onSave, onDelete }: {
  fabric: Fabric;
  existingNames: string[];
  onSave: (name: string, color: string, imageUrl: string | null) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const { show } = useToast();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(fabric.name);
  const [color, setColor] = useState(fabric.color);
  const [imageUrl, setImageUrl] = useState<string | null>(fabric.image_url ?? null);

  return (
    <li className="bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        {edit ? (
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <input
              className={inputCls}
              value={name}
              list="fabric-names-edit"
              onChange={(e) => setName(e.target.value)}
              placeholder="원단명"
              autoFocus
            />
            <datalist id="fabric-names-edit">
              {existingNames.map((n) => <option key={n} value={n} />)}
            </datalist>
            <input className={inputCls} value={color} onChange={(e) => setColor(e.target.value)} placeholder="색상" />
            <ImageUpload value={imageUrl} onChange={setImageUrl} label="색상 이미지" />
          </div>
        ) : (
          <>
            {fabric.image_url ? (
              <img src={fabric.image_url} alt={fabric.color} className="w-10 h-10 object-cover rounded-apple-lg border border-apple-hairline flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-apple-lg bg-apple-canvas border border-apple-hairline flex-shrink-0" />
            )}
            <span className="flex-1 text-sm text-apple-ink">{fabric.color}</span>
          </>
        )}
        <div className="flex items-center gap-2 flex-shrink-0">
          {edit ? (
            <>
              <button className="text-xs text-apple-primary font-semibold hover:opacity-80 transition-opacity"
                onClick={async () => {
                  try { await onSave(name.trim(), color.trim(), imageUrl); setEdit(false); show("수정됨"); }
                  catch (e) { show((e as Error).message ?? "오류", "error"); }
                }}>저장</button>
              <button className="text-xs text-apple-ink-muted-80 hover:text-apple-ink transition-colors"
                onClick={() => { setEdit(false); setName(fabric.name); setColor(fabric.color); setImageUrl(fabric.image_url ?? null); }}>취소</button>
            </>
          ) : (
            <button className="text-xs text-apple-primary font-medium hover:opacity-80 transition-opacity" onClick={() => setEdit(true)}>수정</button>
          )}
          <button className="text-xs text-red-500 hover:opacity-80 transition-opacity font-medium"
            onClick={async () => {
              if (!confirm("삭제할까요?")) return;
              try { await onDelete(); show("삭제됨"); }
              catch (e) { show((e as Error).message ?? "삭제 오류", "error"); }
            }}>삭제</button>
        </div>
      </div>
    </li>
  );
}
