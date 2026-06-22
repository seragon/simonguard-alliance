// 외부 이미지 URL을 react-pdf 호환 PNG base64로 변환 (CORS 우회 + 포맷 정규화)
import { supabase } from "./supabase";

// 이미지 원본 blob 확보. Supabase Storage URL은 인증 다운로드, 외부 URL은 Edge Function 프록시로 CORS를 우회한다.
async function fetchBlob(url: string): Promise<Blob | null> {
  const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
  if (m) {
    const { data, error } = await supabase.storage.from(m[1]).download(m[2]);
    if (error || !data) return null;
    return data;
  }
  // 외부 도메인 이미지 → image-proxy Edge Function 경유 (브라우저 CORS 차단 우회)
  const { data, error } = await supabase.functions.invoke("image-proxy", { body: { url } });
  if (error || !data) return null;
  return data instanceof Blob ? data : new Blob([data as BlobPart]);
}

// blob을 canvas에 그려 react-pdf가 지원하는 PNG data URL로 정규화한다.
// (react-pdf는 PNG/JPEG만 디코딩하므로 WebP 등은 PNG로 변환해야 PDF에 표시된다.)
// flip=true면 픽셀 자체를 좌우 반전한다 (react-pdf transform 은 Image에서 불안정하므로 픽셀로 처리).
function blobToPngDataUrl(blob: Blob, flip: boolean): Promise<string | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const maxW = 1200;
        const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        if (flip) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(null); };
    img.src = objectUrl;
  });
}

export async function toBase64(url: string, flip = false): Promise<string | null> {
  if (!url) return null;
  try {
    const blob = await fetchBlob(url);
    if (!blob) return null;
    return await blobToPngDataUrl(blob, flip);
  } catch {
    return null;
  }
}
