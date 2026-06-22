// 발주 상태 라벨/색상 매핑
import type { OrderStatus } from "../types/db";

const LABEL: Record<OrderStatus, string> = {
  ordered: "발주됨", producing: "생산중", shipping: "출고/배송", done: "완료",
};

const COLOR: Record<OrderStatus, string> = {
  ordered: "bg-blue-500",
  producing: "bg-amber-500",
  shipping: "bg-violet-500",
  done: "bg-emerald-500",
};

const BADGE: Record<OrderStatus, string> = {
  ordered: "bg-blue-50 text-blue-600 border border-blue-200",
  producing: "bg-amber-50 text-amber-700 border border-amber-200",
  shipping: "bg-violet-50 text-violet-700 border border-violet-200",
  done: "bg-emerald-50 text-emerald-600 border border-emerald-200",
};

export const statusLabel = (s: OrderStatus) => LABEL[s];
export const statusColor = (s: OrderStatus) => COLOR[s];
export const statusBadge = (s: OrderStatus) => BADGE[s];
export const ALL_STATUSES: OrderStatus[] = ["ordered", "producing", "shipping", "done"];
