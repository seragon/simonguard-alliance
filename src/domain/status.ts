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
  ordered: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  producing: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  shipping: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
  done: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

export const statusLabel = (s: OrderStatus) => LABEL[s];
export const statusColor = (s: OrderStatus) => COLOR[s];
export const statusBadge = (s: OrderStatus) => BADGE[s];
export const ALL_STATUSES: OrderStatus[] = ["ordered", "producing", "shipping", "done"];
