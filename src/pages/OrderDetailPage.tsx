// 발주 상세: 내용 조회, 수정/삭제, PDF 버튼
import { useNavigate, useParams, Link } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useOrder, useDeleteOrder } from "../data/orders";
import { statusLabel, statusBadge } from "../domain/status";
import { useToast } from "../components/Toast";
import { OrderSheetDocument } from "../pdf/OrderSheetDocument";

export default function OrderDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { show } = useToast();
  const { data: o, isLoading } = useOrder(id);
  const del = useDeleteOrder();

  if (isLoading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!o) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-zinc-500">발주를 찾을 수 없습니다.</p>
    </div>
  );

  return (
    <div className="space-y-4 max-w-xl">
      {/* 헤더 */}
      <div className="flex items-start gap-3">
        <button onClick={() => nav(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-zinc-100">{o.order_no}</h2>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(o.status)}`}>
              {statusLabel(o.status)}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">{o.brand_name} {o.model_name}</p>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {[
          ["발주회사", o.order_company_name],
          ["원단", o.fabric_label],
          ["발주일", o.order_date],
          ["납기일", o.due_date],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between items-center px-4 py-3 border-b border-zinc-800 last:border-0">
            <span className="text-sm text-zinc-500">{label}</span>
            <span className="text-sm text-zinc-100 font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* 모듈 조합 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">모듈 조합</p>
        </div>
        <ul className="divide-y divide-zinc-800">
          {o.items.map((it) => (
            <li key={it.module_id} className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-zinc-200">{it.module_name}</span>
              <span className="text-sm font-semibold text-zinc-100 tabular-nums">× {it.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 비고 */}
      {o.note && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">비고</p>
          <p className="text-sm text-zinc-300 whitespace-pre-wrap">{o.note}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2 flex-wrap">
        <PDFDownloadLink
          document={<OrderSheetDocument order={o} />}
          fileName={`${o.order_no}.pdf`}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
        >
          {({ loading }) => (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {loading ? "PDF 생성 중…" : "발주서 PDF"}
            </>
          )}
        </PDFDownloadLink>
        <Link
          to={`/orders/${o.id}/edit`}
          className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-zinc-100 rounded-xl px-4 py-2.5 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
          수정
        </Link>
        <button
          className="inline-flex items-center gap-2 border border-red-900/50 hover:border-red-700/70 text-red-500 hover:text-red-400 rounded-xl px-4 py-2.5 text-sm transition-colors"
          onClick={async () => {
            if (!confirm("이 발주를 삭제할까요?")) return;
            try { await del.mutateAsync(o.id); show("삭제됨"); nav("/"); }
            catch (e) { show((e as Error).message ?? "삭제 오류", "error"); }
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          삭제
        </button>
      </div>
    </div>
  );
}
