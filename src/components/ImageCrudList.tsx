// 이미지(image_url)를 포함한 항목의 목록·추가·수정·삭제 컴포넌트
import { useState } from "react";
import { useToast } from "./Toast";
import ImageUpload from "./ImageUpload";

interface Item { id: string; name: string; image_url?: string | null }

interface Props {
  title: string;
  items: Item[];
  onCreate: (name: string, imageUrl: string | null) => Promise<void>;
  onUpdate: (id: string, name: string, imageUrl: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ImageCrudList({ title, items, onCreate, onUpdate, onDelete }: Props) {
  const { show } = useToast();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>

      {/* 추가 폼 */}
      <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">{title} 이름</label>
          <input
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
            placeholder={`${title} 이름 입력`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
        <button
          type="button"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
          onClick={async () => {
            if (!name.trim()) return;
            try {
              await onCreate(name.trim(), imageUrl);
              setName("");
              setImageUrl(null);
              show("추가됨");
            } catch (e) {
              show((e as Error).message ?? "오류", "error");
            }
          }}
        >
          추가
        </button>
      </div>

      {/* 목록 */}
      <ul className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
        {items.map((it) => (
          <ImageRow
            key={it.id}
            item={it}
            onSave={(n, img) => onUpdate(it.id, n, img)}
            onDelete={() => onDelete(it.id)}
          />
        ))}
        {items.length === 0 && (
          <li className="px-4 py-5 text-center text-sm text-zinc-600">항목이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}

function ImageRow({
  item,
  onSave,
  onDelete,
}: {
  item: Item;
  onSave: (name: string, imageUrl: string | null) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const { show } = useToast();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(item.name);
  const [imageUrl, setImageUrl] = useState<string | null>(item.image_url ?? null);

  return (
    <li className="bg-zinc-900 hover:bg-zinc-800/40 transition-colors">
      <div className="flex items-center gap-3 px-3 py-3">
        {item.image_url && !edit ? (
          <img src={item.image_url} alt="" className="w-9 h-9 object-cover rounded-lg border border-zinc-700 flex-shrink-0" />
        ) : !edit ? (
          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
            </svg>
          </div>
        ) : null}
        {edit ? (
          <input
            className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-2 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm text-zinc-200 truncate">{item.name}</span>
        )}
        <div className="flex items-center gap-2 flex-shrink-0">
          {edit ? (
            <>
              <button
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                onClick={async () => {
                  try { await onSave(name.trim(), imageUrl); setEdit(false); show("수정됨"); }
                  catch (e) { show((e as Error).message ?? "오류", "error"); }
                }}
              >
                저장
              </button>
              <button
                className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
                onClick={() => { setEdit(false); setName(item.name); setImageUrl(item.image_url ?? null); }}
              >
                취소
              </button>
            </>
          ) : (
            <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors" onClick={() => setEdit(true)}>
              수정
            </button>
          )}
          <button
            className="text-xs text-red-500 hover:text-red-400 transition-colors"
            onClick={async () => {
              if (!confirm("삭제할까요?")) return;
              try { await onDelete(); show("삭제됨"); }
              catch (e) { show((e as Error).message ?? "삭제 오류", "error"); }
            }}
          >
            삭제
          </button>
        </div>
      </div>
      {edit && (
        <div className="px-3 pb-3">
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>
      )}
    </li>
  );
}
