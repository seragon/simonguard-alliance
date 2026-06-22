// 납기일 기준 월간 발주 캘린더
import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../data/orders";
import { groupOrdersByDueDate } from "../domain/calendar";
import { statusColor, statusLabel, statusBadge } from "../domain/status";
import { monthMatrix, ymd } from "./calendarGrid";

export default function OrderCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month0, setMonth0] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const orders = useOrders();
  const byDate = groupOrdersByDueDate(orders.data ?? []);
  const cells = monthMatrix(year, month0);
  const todayKey = ymd(today);

  function prev() {
    if (month0 === 0) { setYear(year - 1); setMonth0(11); }
    else setMonth0(month0 - 1);
  }
  function next() {
    if (month0 === 11) { setYear(year + 1); setMonth0(0); }
    else setMonth0(month0 + 1);
  }

  const selectedOrders = selected ? byDate[selected] ?? [] : [];

  return (
    <div className="space-y-3">
      {/* 월 이동 */}
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink hover:bg-apple-canvas-parchment transition-all active-scale"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="font-semibold text-apple-ink text-sm">{year}년 {month0 + 1}월</span>
        <button
          onClick={next}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink hover:bg-apple-canvas-parchment transition-all active-scale"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center">
        {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
          <div key={d} className={`py-1.5 text-xs font-semibold ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-apple-ink-muted-48"}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = ymd(d);
          const dayOrders = byDate[key] ?? [];
          const isToday = key === todayKey;
          const isSelected = selected === key;
          const dow = d.getDay();

          return (
            <button
              key={i}
              onClick={() => setSelected(isSelected ? null : key)}
              className={`aspect-square rounded-apple-lg p-1 flex flex-col items-center justify-start transition-all active-scale ${
                isSelected
                  ? "bg-apple-primary/5 border border-apple-primary"
                  : "bg-white border border-apple-hairline/30 hover:bg-apple-canvas-parchment"
              }`}
            >
              <span className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
                isToday
                  ? "bg-apple-primary text-white"
                  : isSelected
                  ? "text-apple-primary"
                  : dow === 0
                  ? "text-red-500"
                  : dow === 6
                  ? "text-blue-500"
                  : "text-apple-ink"
              }`}>
                {d.getDate()}
              </span>
              {dayOrders.length > 0 && (
                <span className="flex flex-wrap gap-0.5 mt-1 justify-center">
                  {dayOrders.slice(0, 3).map((o) => (
                    <span key={o.id} className={`w-1.5 h-1.5 rounded-full ${statusColor(o.status)}`} />
                  ))}
                  {dayOrders.length > 3 && <span className="w-1.5 h-1.5 rounded-full bg-apple-ink-muted-48" />}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 날짜의 발주 목록 */}
      {selected && (
        <div className="bg-white border border-apple-hairline rounded-apple-lg p-4 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
          <p className="text-xs font-semibold text-apple-ink-muted-80">{selected} 납기 발주</p>
          {selectedOrders.length === 0 ? (
            <div className="bg-apple-canvas border border-apple-hairline rounded-apple-lg py-8 text-center">
              <p className="text-apple-ink-muted-48 text-xs">납기 예정인 발주가 없습니다.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedOrders.map((o) => (
                <li key={o.id} className="bg-apple-canvas border border-apple-hairline rounded-apple-lg transition-all duration-200 hover:border-apple-primary/30 active-scale shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                  <Link
                    to={`/orders/${o.id}`}
                    className="flex flex-col justify-between p-3.5 h-full min-h-[90px]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-apple-ink tracking-tight truncate">{o.brand_name} {o.model_name}</p>
                        <p className="text-[11px] text-apple-ink-muted-80 font-normal mt-0.5 truncate">{o.order_company_name}</p>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold tracking-tight flex-shrink-0 ${statusBadge(o.status)}`}>
                        {statusLabel(o.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-apple-divider-soft mt-3 pt-2 text-[10px] text-apple-ink-muted-48">
                      <span>납기 {o.due_date}</span>
                      <span className="text-apple-primary font-medium inline-flex items-center gap-0.5">
                        상세보기
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
