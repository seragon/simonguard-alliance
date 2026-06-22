// 슈퍼관리자 전용 사용자 계정 생성 Edge Function
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  const authHeader = req.headers.get("Authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 호출자 검증: super_admin만 허용
  const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await caller.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  const { data: prof } = await caller.from("profiles").select("role").eq("id", user.id).single();
  if (prof?.role !== "super_admin") return json({ error: "forbidden" }, 403);

  const { username, password, name, role } = await req.json();
  if (!username || !password) return json({ error: "username/password required" }, 400);

  const email = `${username.trim()}@simonguard.local`;

  // service_role로 사용자 생성
  const admin = createClient(url, service);
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: name ?? "", role: role === "super_admin" ? "super_admin" : "user", username: username.trim() },
  });

  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
