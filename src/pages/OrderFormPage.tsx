// 발주 등록/수정 폼 (브랜드→모델→모듈조합→원단→발주회사→납기→상태→비고)
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBrands, useSofaModels, useModules, useFabricCompanies, useFabrics, useOrderCompanies } from "../data/masterData";
import { useOrder, useCreateOrder, useUpdateOrder } from "../data/orders";
import { validateOrderForm } from "../domain/validation";
import { ALL_STATUSES, statusLabel } from "../domain/status";
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
    }
  }, [editing, existing.data]);

  const items = Object.entries(qty)
    .filter(([, q]) => q > 0)
    .map(([module_id, quantity]) => ({ module_id, quantity }));

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
    <div className="space-y-4 max-w-xl">
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
        <div>
          <label className={labelCls}>브랜드</label>
          <select className={fieldCls} value={brandId} onChange={(e) => { setBrandId(e.target.value); setModelId(""); setQty({}); }}>
            <option value="">브랜드 선택</option>
            {(brands.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {brandId && (
          <div>
            <label className={labelCls}>모델</label>
            <select className={fieldCls} value={modelId} onChange={(e) => { setModelId(e.target.value); setQty({}); }}>
              <option value="">모델 선택</option>
              {(models.data ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        )}

        {modelId && (
          <div className="space-y-2">
            <label className={labelCls}>모듈 조합 (수량 입력)</label>
            <div className="space-y-2">
              {(modules.data ?? []).map((m) => (
                <div key={m.id} className="flex items-center gap-3 bg-zinc-800 rounded-lg px-3 py-2.5">
                  {m.image_url && <img src={m.image_url} alt="" className="w-8 h-8 object-cover rounded flex-shrink-0" />}
                  <span className="flex-1 text-sm text-zinc-200">{m.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors text-sm font-bold"
                      onClick={() => setQty({ ...qty, [m.id]: Math.max(0, (qty[m.id] ?? 0) - 1) })}
                    >−</button>
                    <span className="w-8 text-center text-sm font-medium text-zinc-100">{qty[m.id] ?? 0}</span>
                    <button
                      type="button"
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors text-sm font-bold"
                      onClick={() => setQty({ ...qty, [m.id]: (qty[m.id] ?? 0) + 1 })}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* 원단 선택 */}
      <Section title="원단 선택">
        <div>
          <label className={labelCls}>원단회사</label>
          <select className={fieldCls} value={companyFabricId} onChange={(e) => { setCompanyFabricId(e.target.value); setFabricId(""); }}>
            <option value="">원단회사 선택</option>
            {(fabricCompanies.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {companyFabricId && (
          <div>
            <label className={labelCls}>원단 (이름/색상)</label>
            <select className={fieldCls} value={fabricId} onChange={(e) => setFabricId(e.target.value)}>
              <option value="">원단 선택</option>
              {(fabrics.data ?? []).map((f) => <option key={f.id} value={f.id}>{f.name} / {f.color}</option>)}
            </select>
          </div>
        )}
      </Section>

      {/* 발주 정보 */}
      <Section title="발주 정보">
        <div>
          <label className={labelCls}>발주회사</label>
          <select className={fieldCls} value={orderCompanyId} onChange={(e) => setOrderCompanyId(e.target.value)}>
            <option value="">발주회사 선택</option>
            {(orderCompanies.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>납기일</label>
          <input type="date" className={fieldCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>상태</label>
          <select className={fieldCls} value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
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
