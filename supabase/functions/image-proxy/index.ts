// 외부 이미지를 서버에서 가져와 CORS 헤더와 함께 중계하는 프록시 Edge Function
// (브라우저는 CORS 미허용 외부 도메인 이미지를 직접 fetch 할 수 없으므로 서버를 경유한다.)
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  let target = "";
  try {
    if (req.method === "POST") {
      const body = await req.json();
      target = body?.url ?? "";
    } else {
      target = new URL(req.url).searchParams.get("url") ?? "";
    }
  } catch {
    target = "";
  }

  if (!target || !/^https?:\/\//i.test(target)) {
    return new Response("invalid url", { status: 400, headers: cors });
  }

  try {
    const upstream = await fetch(target, { redirect: "follow" });
    if (!upstream.ok) {
      return new Response("upstream error", { status: 502, headers: cors });
    }
    const buf = await upstream.arrayBuffer();
    // functions.invoke 가 Blob 으로 받도록 octet-stream 으로 반환 (브라우저가 실제 바이트로 디코딩)
    return new Response(buf, {
      headers: {
        ...cors,
        "Content-Type": "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("fetch failed", { status: 502, headers: cors });
  }
});
