// 파일 선택 또는 URL 직접 입력으로 이미지를 등록하는 공통 컴포넌트
import { useRef, useState } from "react";
import { uploadAsset } from "../lib/storage";
import { useToast } from "./Toast";

interface Props {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "이미지" }: Props) {
  const { show } = useToast();
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadAsset(file);
      onChange(url);
    } catch {
      show("업로드 실패", "error");
    } finally {
      setUploading(false);
    }
  };

  const applyUrl = () => {
    const trimmed = urlDraft.trim();
    if (trimmed) { onChange(trimmed); setUrlDraft(""); }
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</span>
      {value ? (
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <img src={value} alt="" className="w-16 h-16 object-cover rounded-lg border border-zinc-700" />
            <button
              type="button"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center transition-colors"
              onClick={() => onChange(null)}
            >
              ×
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-1">이미지가 등록됨. 변경하려면 아래에서 새로 선택하세요.</p>
        </div>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={uploading}
          className="flex items-center gap-1.5 border border-zinc-700 hover:border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 flex-shrink-0"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              업로드 중…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              파일 선택
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <input
          className="bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 rounded-lg px-3 py-2 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 min-w-0"
          placeholder="또는 이미지 URL 붙여넣기 후 Enter"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyUrl(); } }}
          onBlur={applyUrl}
        />
      </div>
    </div>
  );
}
