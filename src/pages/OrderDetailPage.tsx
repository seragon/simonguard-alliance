// 발주 상세: 내용 조회, 상태 즉시 변경, 수정/삭제, PDF
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useOrder, useDeleteOrder, useUpdateOrderStatus } from "../data/orders";
import type { OrderWithRefs } from "../data/orders";
import { statusLabel, statusBadge, ALL_STATUSES } from "../domain/status";
import { useToast } from "../components/Toast";
import { OrderSheetDocument } from "../pdf/OrderSheetDocument";
import { toBase64 } from "../lib/imageToBase64";
import type { OrderStatus } from "../types/db";

export default function OrderDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { show } = useToast();
  const { data: o, isLoading } = useOrder(id);
  const del = useDeleteOrder();
  const updateStatus = useUpdateOrderStatus();
  const [pdfOrder, setPdfOrder] = useState<OrderWithRefs | null>(null);

  useEffect(() => {
    if (!o) return;
    const order = o;
    setPdfOrder(null);
    async function resolve() {
      const fabricImg = order.fabric_image_url ? await toBase64(order.fabric_image_url) : null;
      const items = await Promise.all(
        order.items.map(async (it) => ({
          ...it,
          image_url: it.image_url ? await toBase64(it.image_url, it.flipped) : null,
        }))
      );
      setPdfOrder({ ...order, fabric_image_url: fabricImg, items });
    }
    resolve();
  }, [o]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-apple-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!o) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-apple-ink-muted-48">발주를 찾을 수 없습니다.</p>
    </div>
  );

  return (
    <div className="space-y-4 w-full">
      {/* 헤더 */}
      <div className="flex items-start gap-3">
        <button onClick={() => nav(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink hover:bg-apple-canvas-parchment transition-all active-scale flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-apple-ink tracking-tight">{o.order_no}</h2>
          <p className="text-sm text-apple-ink-muted-48 mt-0.5">{o.brand_name} {o.model_name}</p>
          {/* 상태 선택 버튼 - 항상 표시, 클릭 즉시 저장 */}
          <div className="flex flex-wrap gap-2 mt-3">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                disabled={updateStatus.isPending}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all active-scale ${
                  o.status === s
                    ? statusBadge(s)
                    : "text-apple-ink-muted-80 border-apple-hairline bg-white hover:text-apple-ink hover:bg-apple-canvas-parchment"
                }`}
                onClick={async () => {
                  if (o.status === s) return;
                  try {
                    await updateStatus.mutateAsync({ id: o.id, status: s as OrderStatus });
                    show(`상태 변경: ${statusLabel(s)}`);
                  } catch {
                    show("상태 변경 실패", "error");
                  }
                }}
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white border border-apple-hairline rounded-apple-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-apple-hairline">
          <p className="text-xs font-semibold text-apple-ink-muted-80 uppercase tracking-wider">기본 정보</p>
        </div>
        {/* 발주회사 */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-apple-hairline">
          <span className="text-sm text-apple-ink-muted-80">발주회사</span>
          <span className="text-sm text-apple-ink font-medium">{o.order_company_name}</span>
        </div>

        {/* 원단: 라벨 좌측, 이미지+이름 우측 세로 정렬 */}
        <div className="px-4 py-3 border-b border-apple-hairline flex justify-between items-start gap-4">
          <span className="text-sm text-apple-ink-muted-80 pt-1">원단</span>
          <div className="flex flex-col items-end gap-1.5">
            {o.fabric_image_url && (
              <img
                src={o.fabric_image_url}
                alt="원단 이미지"
                className="w-32 h-32 object-cover rounded-apple-lg border border-apple-hairline"
              />
            )}
            <span className="text-sm text-apple-ink font-medium text-right">{o.fabric_label}</span>
          </div>
        </div>

        {/* 발주일 */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-apple-hairline">
          <span className="text-sm text-apple-ink-muted-80">발주일</span>
          <span className="text-sm text-apple-ink font-medium">{o.order_date}</span>
        </div>

        {/* 납기일 */}
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-apple-ink-muted-80">납기일</span>
          <span className="text-sm text-apple-ink font-medium">{o.due_date}</span>
        </div>
      </div>

      {/* 모듈 조합 - 가로 가득 채우는 카드 레이아웃 */}
      <div className="bg-white border border-apple-hairline rounded-apple-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-apple-hairline">
          <p className="text-xs font-semibold text-apple-ink-muted-80 uppercase tracking-wider">모듈 조합</p>
        </div>
        <div className="flex flex-col gap-4 p-4">
          {o.items.map((it) => (
            <div key={it.module_id} className="bg-apple-canvas-parchment/60 border border-apple-hairline rounded-apple-lg overflow-hidden flex flex-col w-full">
              {/* 모듈 이미지 */}
              <div className="w-full aspect-video md:aspect-[21/9] bg-apple-canvas-parchment flex items-center justify-center overflow-hidden">
                {it.image_url ? (
                  <img
                    src={it.image_url}
                    alt={it.module_name}
                    className="w-full h-full object-cover"
                    style={it.flipped ? { transform: "scaleX(-1)" } : undefined}
                  />
                ) : (
                  <svg className="w-12 h-12 text-apple-ink-muted-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                  </svg>
                )}
              </div>
              {/* 이름 + 수량 */}
              <div className="p-3 flex justify-between items-center bg-white border-t border-apple-hairline">
                <p className="text-sm text-apple-ink font-medium truncate flex-1">{it.module_name}</p>
                <span className="text-sm text-apple-primary font-semibold flex-shrink-0">× {it.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 비고 */}
      {o.note && (
        <div className="bg-white border border-apple-hairline rounded-apple-lg px-4 py-3">
          <p className="text-xs font-semibold text-apple-ink-muted-80 uppercase tracking-wider mb-2">비고</p>
          <p className="text-sm text-apple-ink whitespace-pre-wrap">{o.note}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2 flex-wrap">
        {pdfOrder ? (
          <PDFDownloadLink
            document={<OrderSheetDocument order={pdfOrder} />}
            fileName={`${o.order_no}.pdf`}
            className="inline-flex items-center gap-2 bg-apple-primary hover:bg-apple-primary-focus text-white rounded-full px-4 py-2.5 text-sm font-medium transition-all active-scale"
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
        ) : (
          <button disabled className="inline-flex items-center gap-2 bg-apple-canvas border border-apple-hairline text-apple-ink-muted-48 rounded-full px-4 py-2.5 text-sm font-medium cursor-not-allowed">
            <div className="w-4 h-4 border-2 border-apple-primary border-t-transparent rounded-full animate-spin" />
            이미지 로드 중…
          </button>
        )}
        <Link
          to={`/orders/${o.id}/edit`}
          className="inline-flex items-center gap-2 border border-apple-hairline hover:border-zinc-300 bg-white text-apple-ink-muted-80 hover:text-apple-ink rounded-full px-4 py-2.5 text-sm transition-all active-scale"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
          수정
        </Link>
        <button
          className="inline-flex items-center gap-2 border border-red-200 bg-white hover:bg-red-50 text-red-500 rounded-full px-4 py-2.5 text-sm transition-all active-scale"
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
