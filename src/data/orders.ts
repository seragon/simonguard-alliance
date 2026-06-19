// 발주 CRUD 및 조인 조회 훅
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Order, OrderStatus } from "../types/db";
import type { OrderFormInput } from "../domain/validation";

/** 발주 + 조인된 표시명을 포함하는 뷰 타입 */
export interface OrderItemView { module_id: string; module_name: string; quantity: number; image_url: string | null; }
export interface OrderWithRefs extends Order {
  brand_name: string;
  model_name: string;
  fabric_label: string;
  fabric_image_url: string | null;
  order_company_name: string;
  items: OrderItemView[];
}

// 조인 조회 select 문
const SELECT = `*,
  brands(name), sofa_models(name), order_companies(name),
  fabrics(name, color, image_url, fabric_companies(name)),
  order_items(quantity, module_id, modules(name, image_url))`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(r: any): OrderWithRefs {
  return {
    ...r,
    brand_name: r.brands?.name ?? "",
    model_name: r.sofa_models?.name ?? "",
    order_company_name: r.order_companies?.name ?? "",
    fabric_label: r.fabrics
      ? `${r.fabrics.fabric_companies?.name ?? ""} ${r.fabrics.name}/${r.fabrics.color}`
      : "",
    fabric_image_url: r.fabrics?.image_url ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (r.order_items ?? []).map((it: any) => ({
      module_id: it.module_id,
      module_name: it.modules?.name ?? "",
      quantity: it.quantity,
      image_url: it.modules?.image_url ?? null,
    })),
  };
}

/** 발주 목록 조회 (필터 지원) */
export function useOrders(filter?: {
  status?: OrderStatus;
  brand_id?: string;
  order_company_id?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: ["orders", filter ?? {}],
    queryFn: async () => {
      let q = supabase.from("orders").select(SELECT).order("due_date", { ascending: true });
      if (filter?.status) q = q.eq("status", filter.status);
      if (filter?.brand_id) q = q.eq("brand_id", filter.brand_id);
      if (filter?.order_company_id) q = q.eq("order_company_id", filter.order_company_id);
      if (filter?.from) q = q.gte("due_date", filter.from);
      if (filter?.to) q = q.lte("due_date", filter.to);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await q;
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[]).map(mapRow);
    },
  });
}

/** 발주 단건 조회 */
export function useOrder(id?: string) {
  return useQuery({
    queryKey: ["orders", "one", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select(SELECT).eq("id", id).single();
      if (error) throw error;
      return mapRow(data);
    },
  });
}

/** order_items insert용 payload 빌더 (순수 함수) */
export function buildOrderItemsPayload(orderId: string, items: { module_id: string; quantity: number }[]) {
  return items.map((it) => ({ order_id: orderId, module_id: it.module_id, quantity: it.quantity }));
}

type OrderWrite = Omit<OrderFormInput, "items"> & {
  status: OrderStatus;
  note: string;
  order_date: string;
  created_by: string;
};

/** 발주 신규 등록 (RPC로 원자 처리) */
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ order, items }: { order: OrderWrite; items: OrderFormInput["items"] }) => {
      const { data, error } = await supabase.rpc("create_order_with_items", {
        p_order: order,
        p_items: items,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

/** 발주 수정 (RPC로 원자 처리 — order_items 전체 교체) */
export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, order, items }: { id: string; order: Partial<OrderWrite>; items: OrderFormInput["items"] }) => {
      const { error } = await supabase.rpc("update_order_with_items", {
        p_id: id,
        p_order: order,
        p_items: items,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

/** 발주 삭제 */
export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error, count } = await supabase
        .from("orders")
        .delete({ count: "exact" })
        .eq("id", id);
      if (error) throw error;
      if (count === 0) throw new Error("삭제 권한이 없거나 발주를 찾을 수 없습니다.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
