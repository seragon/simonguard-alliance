// 마스터데이터 CRUD를 위한 React Query 훅 모음
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Brand, SofaModel, Module, FabricCompany, Fabric, OrderCompany } from "../types/db";

type TableName =
  | "brands" | "sofa_models" | "modules"
  | "fabric_companies" | "fabrics" | "order_companies";

/** 리스트 쿼리 키 빌더 — 테이블명 + 필터 객체 조합 */
export function listKey(table: TableName, filter: Record<string, string> = {}) {
  return [table, filter] as const;
}

function useList<T>(table: TableName, filter: Record<string, string> = {}, enabled = true) {
  return useQuery({
    queryKey: listKey(table, filter),
    enabled,
    queryFn: async () => {
      let q = supabase.from(table).select("*").order("created_at", { ascending: true });
      for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
      const { data, error } = await q;
      if (error) throw error;
      return data as T[];
    },
  });
}

// --- 조회 훅 ---
export const useBrands = () => useList<Brand>("brands");
export const useSofaModels = (brandId?: string) =>
  useList<SofaModel>("sofa_models", brandId ? { brand_id: brandId } : {}, !!brandId);
export const useModules = (modelId?: string) =>
  useList<Module>("modules", modelId ? { model_id: modelId } : {}, !!modelId);
export const useFabricCompanies = () => useList<FabricCompany>("fabric_companies");
export const useFabrics = (companyId?: string) =>
  useList<Fabric>("fabrics", companyId ? { company_id: companyId } : {}, !!companyId);
export const useOrderCompanies = () => useList<OrderCompany>("order_companies");

// --- Mutation 훅 ---
export function useCreate(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { error } = await supabase.from(table).insert(row);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}

export function useUpdate(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...row }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase.from(table).update(row).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}

export function useDelete(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error, count } = await supabase
        .from(table)
        .delete({ count: "exact" })
        .eq("id", id);
      if (error) {
        if (error.code === "23503") throw new Error("발주에서 사용 중인 항목은 삭제할 수 없습니다. 해당 발주를 먼저 삭제하세요.");
        throw new Error(error.message);
      }
      if (count === 0) throw new Error("삭제 권한이 없습니다. 최고관리자 계정으로 로그인했는지 확인하세요.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}
