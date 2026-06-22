// 이미지(image_url)를 포함한 항목의 목록·추가·수정·삭제 컴포넌트
import { useState } from "react";
import { useToast } from "./Toast";
import ImageUpload from "./ImageUpload";
import Modal from "./Modal";

interface Item { id: string; name: string; image_url?: string | null }

interface Props {
  title: string;
  items: Item[];
  onCreate: (name: string, imageUrl: string | null) => Promise<void>;
  onUpdate: (id: string, name: string, imageUrl: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const inputCls = "w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors";

export default function ImageCrudList({ title, items, onCreate, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
        {title} 관리
      </button>

      {open && (
        <ImageManageModal
          title={title}
          items={items}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ImageManageModal({ title, items, onCreate, onUpdate, onDelete, onClose }: Props & { onClose: () => void }) {
  const { show } = useToast();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    try { await onCreate(name.trim(), imageUrl); setName(""); setImageUrl(null); show("추가됨"); }
    catch (e) { show((e as Error).message ?? "오류", "error"); }
  }

  return (
    <Modal title={`${title} 관리`} onClose={onClose}>
      {/* 추가 폼 */}
      <div className="space-y-2">
        <input
          className={inputCls}
          placeholder={`${title} 이름`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
          autoFocus
        />
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
        <button
          onClick={handleCreate}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
        >추가</button>
      </div>

      <div className="border-t border-zinc-800 pt-3">
        <ul className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
          {items.map((it) => (
            <ImageManageRow
              key={it.id}
              item={it}
              onSave={(n, img) => onUpdate(it.id, n, img)}
              onDelete={() => onDelete(it.id)}
            />
          ))}
          {items.length === 0 && (
            <li className="px-4 py-4 text-center text-sm text-zinc-600">항목이 없습니다.</li>
          )}
        </ul>
      </div>
    </Modal>
  );
}

function ImageManageRow({ item, onSave, onDelete }: { item: Item; onSave: (name: string, imageUrl: string | null) => Promise<void>; onDelete: () => Promise<void> }) {
  const { show } = useToast();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(item.name);
  const [imageUrl, setImageUrl] = useState<string | null>(item.image_url ?? null);

  return (
    <li className="bg-zinc-900">
      <div className="flex items-center gap-3 px-3 py-2.5">
        {!edit && (item.image_url ? (
          <img src={item.image_url} alt="" className="w-8 h-8 object-cover rounded-lg border border-zinc-700 flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex-shrink-0" />
        ))}
        {edit ? (
          <input
            className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
              <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                onClick={async () => {
                  try { await onSave(name.trim(), imageUrl); setEdit(false); show("수정됨"); }
                  catch (e) { show((e as Error).message ?? "오류", "error"); }
                }}>저장</button>
              <button className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
                onClick={() => { setEdit(false); setName(item.name); setImageUrl(item.image_url ?? null); }}>취소</button>
            </>
          ) : (
            <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors" onClick={() => setEdit(true)}>수정</button>
          )}
          <button className="text-xs text-red-500 hover:text-red-400 transition-colors"
            onClick={async () => {
              if (!confirm("삭제할까요?")) return;
              try { await onDelete(); show("삭제됨"); }
              catch (e) { show((e as Error).message ?? "삭제 오류", "error"); }
            }}>삭제</button>
        </div>
      </div>
      {edit && (
        <div className="px-3 pb-2">
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>
      )}
    </li>
  );
}
