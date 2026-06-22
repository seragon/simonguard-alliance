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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function TabButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        selected
          ? "bg-indigo-600 text-white"
          : "bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

const fieldCls = "w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors";
const labelCls = "block text-xs font-medium text-zinc-400 mb-1.5";

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
        <button onClick={() => nav(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-zinc-100">{editing ? "발주 수정" : "발주 등록"}</h2>
      </div>

      {/* 소파 선택 */}
      <Section title="소파 선택">
        {/* 브랜드 */}
        <div>
          <label className={labelCls}>브랜드</label>
          {(brands.data ?? []).length === 0
            ? <p className="text-sm text-zinc-600">브랜드 데이터가 없습니다.</p>
            : <div className="flex gap-1.5 overflow-x-auto pb-1">
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
              ? <p className="text-sm text-zinc-600">모델 데이터가 없습니다.</p>
              : <div className="flex gap-1.5 overflow-x-auto pb-1">
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
              <p className="text-sm text-zinc-600">모듈 데이터가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(modules.data ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col rounded-xl border overflow-hidden transition-colors ${
                      (qty[m.id] ?? 0) > 0
                        ? "border-indigo-500/40 bg-indigo-600/10"
                        : "border-zinc-700 bg-zinc-800/50"
                    }`}
                  >
                    <div className="relative aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {m.image_url ? (
                        <img
                          src={m.image_url}
                          alt={m.name}
                          className="w-full h-full object-cover transition-transform duration-200"
                          style={flip[m.id] ? { transform: "scaleX(-1)" } : undefined}
                        />
                      ) : (
                        <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                        </svg>
                      )}
                      {/* 좌우 반전 버튼 */}
                      <button
                        type="button"
                        onClick={() => setFlip({ ...flip, [m.id]: !flip[m.id] })}
                        title="좌우 반전"
                        className={`absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                          flip[m.id]
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-900/70 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
                        }`}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-center text-zinc-200 font-medium px-2 pt-2 truncate">{m.name}</p>
                    <div className="flex items-center justify-center gap-2 p-2">
                      <button type="button" className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors font-bold text-sm"
                        onClick={() => setQty({ ...qty, [m.id]: Math.max(0, (qty[m.id] ?? 0) - 1) })}>−</button>
                      <span className="w-6 text-center text-sm font-semibold text-zinc-100">{qty[m.id] ?? 0}</span>
                      <button type="button" className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors font-bold text-sm"
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
            ? <p className="text-sm text-zinc-600">원단회사 데이터가 없습니다.</p>
            : <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(fabricCompanies.data ?? []).map((c) => (
                  <TabButton key={c.id} selected={companyFabricId === c.id} onClick={() => { setCompanyFabricId(c.id); setFabricId(""); }}>
                    {c.image_url && <img src={c.image_url} alt="" className="w-5 h-5 object-cover rounded flex-shrink-0" />}
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
              <p className="text-sm text-zinc-600">원단 데이터가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(fabrics.data ?? []).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFabricId(f.id)}
                    className={`flex flex-col rounded-xl border overflow-hidden transition-colors text-left ${
                      fabricId === f.id
                        ? "border-indigo-500/60 bg-indigo-600/10"
                        : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                    }`}
                  >
                    <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {f.image_url ? (
                        <img src={f.image_url} alt={f.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                        </svg>
                      )}
                    </div>
                    <div className="px-2.5 py-2">
                      <p className={`text-sm font-medium truncate ${fabricId === f.id ? "text-indigo-300" : "text-zinc-200"}`}>{f.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{f.color}</p>
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
            ? <p className="text-sm text-zinc-600">발주회사 데이터가 없습니다.</p>
            : <div className="flex gap-1.5 overflow-x-auto pb-1">
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
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border ${
                  status === s ? statusBadge(s) : "text-zinc-400 border-zinc-700 bg-zinc-800 hover:text-zinc-100 hover:bg-zinc-700"
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
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl py-3 text-sm transition-colors"
          onClick={submit}
        >
          {editing ? "수정 저장" : "발주 등록"}
        </button>
        <button
          className="border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-100 rounded-xl py-3 px-5 text-sm transition-colors"
          onClick={() => nav(-1)}
        >
          취소
        </button>
      </div>
    </div>
  );
}
