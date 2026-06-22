// 계정 목록 조회 및 Edge Function 기반 계정 생성 훅
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/db";

/** 전체 프로필 목록 조회 (슈퍼관리자 전용) */
export function useAccounts() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at");
      if (error) throw error;
      return data as Profile[];
    },
  });
}

/** Edge Function 호출로 계정 생성 */
export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { username: string; password: string; name: string; role: "super_admin" | "user" }) => {
      const body = {
        username: input.username.trim(),
        email: `${input.username.trim()}@simonguard.local`,
        password: input.password,
        name: input.name,
        role: input.role,
      };
      const { data, error } = await supabase.functions.invoke("create-user", { body });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}
