// 모듈 카드 그리드: 이미지(위) + 이름(아래), PC 3열 / 모바일 2열
import { useState } from "react";
import { useToast } from "./Toast";
import ImageUpload from "./ImageUpload";

interface Item { id: string; name: string; image_url?: string | null }

interface Props {
  items: Item[];
  onCreate: (name: string, imageUrl: string | null) => Promise<void>;
  onUpdate: (id: string, name: string, imageUrl: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ModuleCardGrid({ items, onCreate, onUpdate, onDelete }: Props) {
  const { show } = useToast();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* 추가 폼 */}
      <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-zinc-400">모듈 추가</p>
        <input
          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
          placeholder="모듈 이름 입력"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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

      {/* 카드 그리드: 모바일 2열 / PC 3열 */}
      {items.length === 0 ? (
        <div className="flex items-center justify-center h-24 border border-dashed border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-600">모듈이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((it) => (
            <ModuleCard
              key={it.id}
              item={it}
              onSave={(n, img) => onUpdate(it.id, n, img)}
              onDelete={() => onDelete(it.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleCard({
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
    <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl overflow-hidden flex flex-col">
      {/* 이미지 영역 */}
      <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
        {item.image_url && !edit ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
          </svg>
        )}
      </div>

      {/* 이름 + 버튼 영역 */}
      <div className="p-2 flex flex-col gap-1.5">
        {edit ? (
          <>
            <input
              className="bg-zinc-700 border border-zinc-600 text-zinc-100 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
            <div className="flex gap-1">
              <button
                className="flex-1 text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-lg py-1 transition-colors hover:bg-emerald-600/30"
                onClick={async () => {
                  try { await onSave(name.trim(), imageUrl); setEdit(false); show("수정됨"); }
                  catch (e) { show((e as Error).message ?? "오류", "error"); }
                }}
              >
                저장
              </button>
              <button
                className="flex-1 text-xs text-zinc-500 border border-zinc-700 rounded-lg py-1 transition-colors hover:text-zinc-300"
                onClick={() => { setEdit(false); setName(item.name); setImageUrl(item.image_url ?? null); }}
              >
                취소
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-zinc-200 text-center font-medium truncate">{item.name}</p>
            <div className="flex gap-1">
              <button
                className="flex-1 text-xs text-zinc-500 border border-zinc-700 rounded-lg py-1 hover:text-zinc-300 transition-colors"
                onClick={() => setEdit(true)}
              >
                수정
              </button>
              <button
                className="flex-1 text-xs text-red-500 border border-red-900/40 rounded-lg py-1 hover:text-red-400 transition-colors"
                onClick={async () => {
                  if (!confirm("삭제할까요?")) return;
                  try { await onDelete(); show("삭제됨"); }
                  catch (e) { show((e as Error).message ?? "삭제 오류", "error"); }
                }}
              >
                삭제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
