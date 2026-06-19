// 납기일 기준 월간 발주 캘린더
import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../data/orders";
import { groupOrdersByDueDate } from "../domain/calendar";
import { statusColor, statusLabel } from "../domain/status";
import { monthMatrix, ymd } from "./calendarGrid";

export default function OrderCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month0, setMonth0] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const orders = useOrders();
  const byDate = groupOrdersByDueDate(orders.data ?? []);
  const cells = monthMatrix(year, month0);

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
        <button onClick={prev} className="px-3 py-1 rounded-lg bg-slate-100">◀</button>
        <span className="font-bold">{year}년 {month0 + 1}월</span>
        <button onClick={next} className="px-3 py-1 rounded-lg bg-slate-100">▶</button>
      </div>

      {/* 요일 헤더 + 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d} className="text-slate-500 py-1">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = ymd(d);
          const dayOrders = byDate[key] ?? [];
          return (
            <button
              key={i}
              onClick={() => setSelected(key)}
              className={`aspect-square rounded-lg border p-1 flex flex-col items-center justify-start ${
                selected === key ? "ring-2 ring-slate-900" : ""
              }`}
            >
              <span>{d.getDate()}</span>
              <span className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                {dayOrders.slice(0, 4).map((o) => (
                  <span key={o.id} className={`w-1.5 h-1.5 rounded-full ${statusColor(o.status)}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* 선택된 날짜의 발주 목록 */}
      {selected && (
        <div className="border rounded-lg p-3">
          <p className="font-medium text-sm mb-2">{selected} 납기 발주</p>
          {selectedOrders.length === 0 ? (
            <p className="text-sm text-slate-500">없음</p>
          ) : (
            <ul className="space-y-1">
              {selectedOrders.map((o) => (
                <li key={o.id}>
                  <Link to={`/orders/${o.id}`} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${statusColor(o.status)}`} />
                    {o.brand_name} {o.model_name} · {statusLabel(o.status)}
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
