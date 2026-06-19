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
          <div className="flex flex-wrap gap-2">
            {(brands.data ?? []).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => { setBrandId(b.id); setModelId(""); setQty({}); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  brandId === b.id
                    ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                    : "text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {b.name}
              </button>
            ))}
            {(brands.data ?? []).length === 0 && (
              <p className="text-sm text-zinc-600">브랜드 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 모델 */}
        {brandId && (
          <div>
            <label className={labelCls}>모델</label>
            <div className="flex flex-wrap gap-2">
              {(models.data ?? []).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { setModelId(m.id); setQty({}); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    modelId === m.id
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                      : "text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {m.name}
                </button>
              ))}
              {(models.data ?? []).length === 0 && (
                <p className="text-sm text-zinc-600">모델 데이터가 없습니다.</p>
              )}
            </div>
          </div>
        )}

        {/* 모듈 카드 그리드 (이미지 위, 이름 아래, +/- 수량) */}
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
                    {/* 이미지 */}
                    <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {m.image_url ? (
                        <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                        </svg>
                      )}
                    </div>
                    {/* 이름 */}
                    <p className="text-xs text-center text-zinc-200 font-medium px-2 pt-2 truncate">{m.name}</p>
                    {/* 수량 조절 */}
                    <div className="flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors font-bold text-sm"
                        onClick={() => setQty({ ...qty, [m.id]: Math.max(0, (qty[m.id] ?? 0) - 1) })
                        }
                      >−</button>
                      <span className="w-6 text-center text-sm font-semibold text-zinc-100">{qty[m.id] ?? 0}</span>
                      <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors font-bold text-sm"
                        onClick={() => setQty({ ...qty, [m.id]: (qty[m.id] ?? 0) + 1 })}
                      >+</button>
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
        {/* 원단회사 */}
        <div>
          <label className={labelCls}>원단회사</label>
          <div className="flex flex-wrap gap-2">
            {(fabricCompanies.data ?? []).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setCompanyFabricId(c.id); setFabricId(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  companyFabricId === c.id
                    ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                    : "text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {c.name}
              </button>
            ))}
            {(fabricCompanies.data ?? []).length === 0 && (
              <p className="text-sm text-zinc-600">원단회사 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 원단 (이름/색상) */}
        {companyFabricId && (
          <div>
            <label className={labelCls}>원단 (이름/색상)</label>
            <div className="flex flex-wrap gap-2">
              {(fabrics.data ?? []).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFabricId(f.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    fabricId === f.id
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                      : "text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {f.name} / {f.color}
                </button>
              ))}
              {(fabrics.data ?? []).length === 0 && (
                <p className="text-sm text-zinc-600">원단 데이터가 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* 발주 정보 */}
      <Section title="발주 정보">
        <div>
          <label className={labelCls}>발주회사</label>
          <div className="flex flex-wrap gap-2">
            {(orderCompanies.data ?? []).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setOrderCompanyId(c.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  orderCompanyId === c.id
                    ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                    : "text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {c.name}
              </button>
            ))}
            {(orderCompanies.data ?? []).length === 0 && (
              <p className="text-sm text-zinc-600">발주회사 데이터가 없습니다.</p>
            )}
          </div>
        </div>
        <div>
          <label className={labelCls}>납기일</label>
          <input type="date" className={fieldCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>상태</label>
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  status === s
                    ? statusBadge(s)
                    : "text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800"
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
