// 발주 상세: 내용 조회, 수정/삭제, PDF 버튼
import { useNavigate, useParams, Link } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useOrder, useDeleteOrder } from "../data/orders";
import { statusLabel } from "../domain/status";
import { useToast } from "../components/Toast";
import { OrderSheetDocument } from "../pdf/OrderSheetDocument";

export default function OrderDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { show } = useToast();
  const { data: o, isLoading } = useOrder(id);
  const del = useDeleteOrder();

  if (isLoading) return <div className="p-4">불러오는 중…</div>;
  if (!o) return <div className="p-4">발주를 찾을 수 없습니다.</div>;

  const row = "flex justify-between py-2 border-b text-sm";

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{o.order_no}</h2>
        <span className="text-sm">{statusLabel(o.status)}</span>
      </div>

      <div>
        <div className={row}><span className="text-slate-500">브랜드/모델</span><span>{o.brand_name} {o.model_name}</span></div>
        <div className={row}><span className="text-slate-500">발주회사</span><span>{o.order_company_name}</span></div>
        <div className={row}><span className="text-slate-500">원단</span><span>{o.fabric_label}</span></div>
        <div className={row}><span className="text-slate-500">발주일</span><span>{o.order_date}</span></div>
        <div className={row}><span className="text-slate-500">납기일</span><span>{o.due_date}</span></div>

        {/* 모듈 조합 */}
        <div className="py-2">
          <p className="text-slate-500 text-sm mb-1">모듈 조합</p>
          <ul className="text-sm">
            {o.items.map((it) => (
              <li key={it.module_id} className="flex justify-between">
                <span>{it.module_name}</span>
                <span>×{it.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 비고 */}
        {o.note && (
          <div className="py-2 text-sm">
            <p className="text-slate-500 mb-1">비고</p>
            <p>{o.note}</p>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <PDFDownloadLink
          document={<OrderSheetDocument order={o} />}
          fileName={`${o.order_no}.pdf`}
          className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm"
        >
          {({ loading }) => (loading ? "PDF 생성 중…" : "발주서 PDF")}
        </PDFDownloadLink>
        <Link to={`/orders/${o.id}/edit`} className="border rounded-lg px-4 py-2 text-sm">수정</Link>
        <button
          className="border border-red-300 text-red-600 rounded-lg px-4 py-2 text-sm"
          onClick={async () => {
            if (!confirm("삭제할까요?")) return;
            try {
              await del.mutateAsync(o.id);
              show("삭제됨");
              nav("/");
            } catch {
              show("오류", "error");
            }
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
