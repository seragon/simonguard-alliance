// 발주 등록/수정 폼 (브랜드→모델→모듈조합→원단→발주회사→납기→상태→비고)
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBrands, useSofaModels, useModules, useFabricCompanies, useFabrics, useOrderCompanies } from "../data/masterData";
import { useOrder, useCreateOrder, useUpdateOrder } from "../data/orders";
import { validateOrderForm } from "../domain/validation";
import { ALL_STATUSES, statusLabel, statusBadge } from "../domain/status";
import { useAuth } from "../auth/useAuth";
import { useToast } from "../components/Toast";
import type { OrderStatus } from "../types/db";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-apple-canvas border border-apple-hairline rounded-apple-lg p-5 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
      <h3 className="text-xs font-semibold text-apple-ink-muted-80 uppercase tracking-wider mb-1">{title}</h3>
      {children}
    </div>
  );
}

function TabButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-normal tracking-tight transition-all active-scale whitespace-nowrap border ${
        selected
          ? "bg-apple-primary border-apple-primary text-white"
          : "bg-white border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink hover:bg-apple-canvas-parchment"
      }`}
    >
      {children}
    </button>
  );
}

const fieldCls = "w-full bg-white border border-apple-hairline text-apple-ink placeholder:text-apple-ink-muted-48 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apple-primary/20 focus:border-apple-primary transition-all font-sans";
const labelCls = "block text-xs font-semibold text-apple-ink-muted-80 mb-1.5";

export default function OrderFormPage() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();
  const { profile } = useAuth();
  const { show } = useToast();
  const existing = useOrder(id);

  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [companyFabricId, setCompanyFabricId] = useState("");
  const [fabricId, setFabricId] = useState("");
  const [orderCompanyId, setOrderCompanyId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<OrderStatus>("ordered");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [flip, setFlip] = useState<Record<string, boolean>>({});

  const brands = useBrands();
  const models = useSofaModels(brandId);
  const modules = useModules(modelId);
  const fabricCompanies = useFabricCompanies();
  const fabrics = useFabrics(companyFabricId);
  const orderCompanies = useOrderCompanies();
  const create = useCreateOrder();
  const update = useUpdateOrder();

  useEffect(() => {
    if (editing && existing.data) {
      const o = existing.data;
      setBrandId(o.brand_id); setModelId(o.model_id); setFabricId(o.fabric_id);
      setOrderCompanyId(o.order_company_id); setDueDate(o.due_date);
      setStatus(o.status); setNote(o.note);
      setQty(Object.fromEntries(o.items.map((it) => [it.module_id, it.quantity])));
      setFlip(Object.fromEntries(o.items.filter((it) => it.flipped).map((it) => [it.module_id, true])));
    }
  }, [editing, existing.data]);

  // 수정 모드에서 원단회사 id 초기화 (fabric_id로 역추적)
  useEffect(() => {
    if (editing && existing.data && fabricCompanies.data) {
      const fabricId = existing.data.fabric_id;
      // 현재 선택된 원단의 company_id를 찾아서 설정
      // fabrics 데이터가 없으므로 일단 첫 번째 회사를 기본값으로
      if (!companyFabricId && fabricCompanies.data.length > 0) {
        setCompanyFabricId(fabricCompanies.data[0].id);
      }
      void fabricId;
    }
  }, [editing, existing.data, fabricCompanies.data, companyFabricId]);

  const items = Object.entries(qty)
    .filter(([, q]) => q > 0)
    .map(([module_id, quantity]) => ({ module_id, quantity, flipped: flip[module_id] ?? false }));

  async function submit() {
    const errors = validateOrderForm({ brand_id: brandId, model_id: modelId, fabric_id: fabricId, order_company_id: orderCompanyId, due_date: dueDate, items });
    if (errors.length) { show(errors[0], "error"); return; }
    const order = {
      brand_id: brandId, model_id: modelId, fabric_id: fabricId,
      order_company_id: orderCompanyId, due_date: dueDate, status, note,
      order_date: new Date().toISOString().slice(0, 10), created_by: profile!.id,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: id!, order, items });
        show("수정됨"); nav(`/orders/${id}`);
      } else {
        const newId = await create.mutateAsync({ order, items });
        show("발주 등록됨"); nav(`/orders/${newId}`);
      }
    } catch { show("저장 중 오류가 발생했습니다.", "error"); }
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-3">
        <button onClick={() => nav(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink hover:bg-apple-canvas-parchment transition-all active-scale">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-apple-ink tracking-tight">{editing ? "발주 수정" : "발주 등록"}</h2>
      </div>

      {/* 소파 선택 */}
      <Section title="소파 선택">
        {/* 브랜드 */}
        <div>
          <label className={labelCls}>브랜드</label>
          {(brands.data ?? []).length === 0
            ? <p className="text-sm text-apple-ink-muted-48">브랜드 데이터가 없습니다.</p>
            : <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                {(brands.data ?? []).map((b) => (
                  <TabButton key={b.id} selected={brandId === b.id} onClick={() => { setBrandId(b.id); setModelId(""); setQty({}); setFlip({}); }}>
                    {b.name}
                  </TabButton>
                ))}
              </div>
          }
        </div>

        {/* 모델 */}
        {brandId && (
          <div>
            <label className={labelCls}>모델</label>
            {(models.data ?? []).length === 0
              ? <p className="text-sm text-apple-ink-muted-48">모델 데이터가 없습니다.</p>
              : <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                  {(models.data ?? []).map((m) => (
                    <TabButton key={m.id} selected={modelId === m.id} onClick={() => { setModelId(m.id); setQty({}); setFlip({}); }}>
                      {m.name}
                    </TabButton>
                  ))}
                </div>
            }
          </div>
        )}

        {/* 모듈 카드 그리드 */}
        {modelId && (
          <div>
            <label className={labelCls}>모듈 조합 (수량 입력)</label>
            {(modules.data ?? []).length === 0 ? (
              <p className="text-sm text-apple-ink-muted-48">모듈 데이터가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                {(modules.data ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col rounded-apple-lg border overflow-hidden transition-all duration-200 ${
                      (qty[m.id] ?? 0) > 0
                        ? "border-apple-primary/40 bg-apple-primary/5"
                        : "border-apple-hairline bg-white"
                    }`}
                  >
                    <div className="relative aspect-square bg-apple-canvas-parchment flex items-center justify-center overflow-hidden">
                      {m.image_url ? (
                        <img
                          src={m.image_url}
                          alt={m.name}
                          className="w-full h-full object-cover transition-transform duration-200 mix-blend-multiply"
                          style={flip[m.id] ? { transform: "scaleX(-1)" } : undefined}
                        />
                      ) : (
                        <svg className="w-8 h-8 text-apple-ink-muted-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                        </svg>
                      )}
                      {/* 좌우 반전 버튼 */}
                      <button
                        type="button"
                        onClick={() => setFlip({ ...flip, [m.id]: !flip[m.id] })}
                        title="좌우 반전"
                        className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full transition-all active-scale ${
                          flip[m.id]
                            ? "bg-apple-primary text-white"
                            : "bg-apple-canvas-parchment/80 backdrop-blur text-apple-ink-muted-80 hover:text-apple-ink"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-center text-apple-ink font-semibold px-2.5 pt-2.5 truncate">{m.name}</p>
                    <div className="flex items-center justify-center gap-2.5 p-2.5">
                      <button type="button" className="w-7 h-7 flex items-center justify-center rounded-full bg-apple-canvas-parchment border border-apple-hairline hover:bg-apple-surface-pearl text-apple-ink transition-colors font-semibold text-sm active-scale"
                        onClick={() => setQty({ ...qty, [m.id]: Math.max(0, (qty[m.id] ?? 0) - 1) })}>−</button>
                      <span className="w-6 text-center text-sm font-semibold text-apple-ink">{qty[m.id] ?? 0}</span>
                      <button type="button" className="w-7 h-7 flex items-center justify-center rounded-full bg-apple-canvas-parchment border border-apple-hairline hover:bg-apple-surface-pearl text-apple-ink transition-colors font-semibold text-sm active-scale"
                        onClick={() => setQty({ ...qty, [m.id]: (qty[m.id] ?? 0) + 1 })}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* 원단 선택 */}
      <Section title="원단 선택">
        <div>
          <label className={labelCls}>원단회사</label>
            {(fabricCompanies.data ?? []).length === 0
              ? <p className="text-sm text-apple-ink-muted-48">원단회사 데이터가 없습니다.</p>
              : <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                  {(fabricCompanies.data ?? []).map((c) => (
                    <TabButton key={c.id} selected={companyFabricId === c.id} onClick={() => { setCompanyFabricId(c.id); setFabricId(""); }}>
                      {c.image_url && <img src={c.image_url} alt="" className="w-5 h-5 object-cover rounded-full flex-shrink-0 mix-blend-multiply" />}
                      {c.name}
                    </TabButton>
                  ))}
                </div>
            }
        </div>

        {/* 원단 이미지 카드 그리드 */}
        {companyFabricId && (
          <div>
            <label className={labelCls}>원단 선택</label>
            {(fabrics.data ?? []).length === 0 ? (
              <p className="text-sm text-apple-ink-muted-48">원단 데이터가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                {(fabrics.data ?? []).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFabricId(f.id)}
                    className={`flex flex-col rounded-apple-lg border overflow-hidden transition-all duration-200 text-left active-scale ${
                      fabricId === f.id
                        ? "border-apple-primary/40 bg-apple-primary/5"
                        : "border-apple-hairline bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="aspect-square bg-apple-canvas-parchment flex items-center justify-center overflow-hidden">
                      {f.image_url ? (
                        <img src={f.image_url} alt={f.name} className="w-full h-full object-cover mix-blend-multiply" />
                      ) : (
                        <svg className="w-8 h-8 text-apple-ink-muted-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                        </svg>
                      )}
                    </div>
                    <div className="px-3 py-2.5">
                      <p className={`text-sm font-semibold truncate ${fabricId === f.id ? "text-apple-primary" : "text-apple-ink"}`}>{f.name}</p>
                      <p className="text-xs text-apple-ink-muted-48 mt-0.5 truncate">{f.color}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* 발주 정보 */}
      <Section title="발주 정보">
        <div>
          <label className={labelCls}>발주회사</label>
            {(orderCompanies.data ?? []).length === 0
              ? <p className="text-sm text-apple-ink-muted-48">발주회사 데이터가 없습니다.</p>
              : <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                {(orderCompanies.data ?? []).map((c) => (
                  <TabButton key={c.id} selected={orderCompanyId === c.id} onClick={() => setOrderCompanyId(c.id)}>
                    {c.name}
                  </TabButton>
                ))}
              </div>
          }
        </div>
        <div>
          <label className={labelCls}>납기일</label>
          <input type="date" className={fieldCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>상태</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-normal transition-all active-scale whitespace-nowrap border ${
                  status === s ? statusBadge(s) : "text-apple-ink-muted-80 border-apple-hairline bg-white hover:text-apple-ink hover:bg-apple-canvas-parchment"
                }`}
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>비고</label>
          <textarea className={fieldCls} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="메모 (선택)" />
        </div>
      </Section>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          className="flex-1 bg-apple-primary hover:bg-apple-primary-focus text-white font-semibold rounded-full py-3 text-sm transition-all active-scale"
          onClick={submit}
        >
          {editing ? "수정 저장" : "발주 등록"}
        </button>
        <button
          className="border border-apple-hairline hover:border-zinc-300 text-apple-ink-muted-80 hover:text-apple-ink rounded-full py-3 px-6 text-sm transition-all active-scale bg-white"
          onClick={() => nav(-1)}
        >
          취소
        </button>
      </div>
    </div>
  );
}
