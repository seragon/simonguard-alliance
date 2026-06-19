// 발주 상태 라벨/색상 매핑
import type { OrderStatus } from "../types/db";
const LABEL: Record<OrderStatus, string> = {
  ordered: "발주됨", producing: "생산중", shipping: "출고/배송", done: "완료",
};
const COLOR: Record<OrderStatus, string> = {
  ordered: "bg-slate-400", producing: "bg-amber-500", shipping: "bg-sky-500", done: "bg-emerald-600",
};
export const statusLabel = (s: OrderStatus) => LABEL[s];
export const statusColor = (s: OrderStatus) => COLOR[s];
export const ALL_STATUSES: OrderStatus[] = ["ordered","producing","shipping","done"];
