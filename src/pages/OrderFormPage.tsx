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

export default function OrderFormPage() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();
  const { profile } = useAuth();
  const { show } = useToast();
  const existing = useOrder(id);

  // 폼 상태
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [companyFabricId, setCompanyFabricId] = useState("");
  const [fabricId, setFabricId] = useState("");
  const [orderCompanyId, setOrderCompanyId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<OrderStatus>("ordered");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});

  // 마스터데이터 조회
  const brands = useBrands();
  const models = useSofaModels(brandId);
  const modules = useModules(modelId);
  const fabricCompanies = useFabricCompanies();
  const fabrics = useFabrics(companyFabricId);
  const orderCompanies = useOrderCompanies();
  const create = useCreateOrder();
  const update = useUpdateOrder();

  // 수정 모드: 기존 데이터로 폼 초기화
  useEffect(() => {
    if (editing && existing.data) {
      const o = existing.data;
      setBrandId(o.brand_id);
      setModelId(o.model_id);
      setFabricId(o.fabric_id);
      setOrderCompanyId(o.order_company_id);
      setDueDate(o.due_date);
      setStatus(o.status);
      setNote(o.note);
      setQty(Object.fromEntries(o.items.map((it) => [it.module_id, it.quantity])));
    }
  }, [editing, existing.data]);

  // 수량 > 0인 모듈만 items로 변환
  const items = Object.entries(qty)
    .filter(([, q]) => q > 0)
    .map(([module_id, quantity]) => ({ module_id, quantity }));

  async function submit() {
    const errors = validateOrderForm({
      brand_id: brandId,
      model_id: modelId,
      fabric_id: fabricId,
      order_company_id: orderCompanyId,
      due_date: dueDate,
      items,
    });
    if (errors.length) {
      show(errors[0], "error");
      return;
    }

    const order = {
      brand_id: brandId,
      model_id: modelId,
      fabric_id: fabricId,
      order_company_id: orderCompanyId,
      due_date: dueDate,
      status,
      note,
      order_date: new Date().toISOString().slice(0, 10),
      created_by: profile!.id,
    };

    try {
      if (editing) {
        await update.mutateAsync({ id: id!, order, items });
        show("수정됨");
        nav(`/orders/${id}`);
      } else {
        const newId = await create.mutateAsync({ order, items });
        show("발주 등록됨");
        nav(`/orders/${newId}`);
      }
    } catch {
      show("저장 중 오류가 발생했습니다.", "error");
    }
  }

  const field = "border rounded-lg px-3 py-3 w-full";

  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-xl font-bold">{editing ? "발주 수정" : "발주 등록"}</h2>

      {/* 브랜드 */}
      <label className="block text-sm">
        브랜드
        <select className={field} value={brandId} onChange={(e) => { setBrandId(e.target.value); setModelId(""); }}>
          <option value="">선택</option>
          {(brands.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>

      {/* 모델 */}
      {brandId && (
        <label className="block text-sm">
          모델
          <select className={field} value={modelId} onChange={(e) => { setModelId(e.target.value); setQty({}); }}>
            <option value="">선택</option>
            {(models.data ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
      )}

      {/* 모듈 조합 (수량) */}
      {modelId && (
        <div className="space-y-2">
          <p className="text-sm font-medium">모듈 조합 (수량)</p>
          {(modules.data ?? []).map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-2">
              <span>{m.name}</span>
              <input
                type="number"
                min={0}
                className="border rounded-lg px-2 py-2 w-24"
                value={qty[m.id] ?? 0}
                onChange={(e) => setQty({ ...qty, [m.id]: Number(e.target.value) })}
              />
            </div>
          ))}
        </div>
      )}

      {/* 원단회사 */}
      <label className="block text-sm">
        원단회사
        <select className={field} value={companyFabricId} onChange={(e) => { setCompanyFabricId(e.target.value); setFabricId(""); }}>
          <option value="">선택</option>
          {(fabricCompanies.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      {/* 원단 (이름/색상) */}
      {companyFabricId && (
        <label className="block text-sm">
          원단 (이름/색상)
          <select className={field} value={fabricId} onChange={(e) => setFabricId(e.target.value)}>
            <option value="">선택</option>
            {(fabrics.data ?? []).map((f) => <option key={f.id} value={f.id}>{f.name} / {f.color}</option>)}
          </select>
        </label>
      )}

      {/* 발주회사 */}
      <label className="block text-sm">
        발주회사
        <select className={field} value={orderCompanyId} onChange={(e) => setOrderCompanyId(e.target.value)}>
          <option value="">선택</option>
          {(orderCompanies.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      {/* 납기일 */}
      <label className="block text-sm">
        납기일
        <input type="date" className={field} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>

      {/* 상태 */}
      <label className="block text-sm">
        상태
        <select className={field} value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </label>

      {/* 비고 */}
      <label className="block text-sm">
        비고
        <textarea className={field} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button className="bg-slate-900 text-white rounded-lg py-3 px-6 flex-1" onClick={submit}>
          {editing ? "수정 저장" : "발주 등록"}
        </button>
        <button className="border rounded-lg py-3 px-6" onClick={() => nav(-1)}>취소</button>
      </div>
    </div>
  );
}
