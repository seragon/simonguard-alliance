// Supabase Storage 파일 업로드 헬퍼
import { supabase } from "./supabase";

export async function uploadAsset(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("assets")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("assets").getPublicUrl(path);
  return data.publicUrl;
}
