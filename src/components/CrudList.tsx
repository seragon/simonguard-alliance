// 단일 이름 필드 항목의 목록/추가/수정/삭제 재사용 컴포넌트
import { useState } from "react";
import { useToast } from "./Toast";
import Modal from "./Modal";

interface Item { id: string; name: string }
interface Props {
  title: string;
  items: Item[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const inputCls = "w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors";

export default function CrudList({ title, items, onCreate, onUpdate, onDelete }: Props) {
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
        <ManageModal
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

function ManageModal({ title, items, onCreate, onUpdate, onDelete, onClose }: Props & { onClose: () => void }) {
  const { show } = useToast();
  const [name, setName] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    try { await onCreate(name.trim()); setName(""); show("추가됨"); }
    catch (e) { show((e as Error).message ?? "오류", "error"); }
  }

  return (
    <Modal title={`${title} 관리`} onClose={onClose}>
      {/* 추가 폼 */}
      <div className="flex gap-2">
        <input
          className={inputCls}
          placeholder={`${title} 이름`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
          autoFocus
        />
        <button
          onClick={handleCreate}
          className="flex-shrink-0 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >추가</button>
      </div>

      {/* 목록 */}
      <ul className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
        {items.map((it) => (
          <ManageRow key={it.id} item={it} onSave={(n) => onUpdate(it.id, n)} onDelete={() => onDelete(it.id)} />
        ))}
        {items.length === 0 && (
          <li className="px-4 py-4 text-center text-sm text-zinc-600">항목이 없습니다.</li>
        )}
      </ul>
    </Modal>
  );
}

function ManageRow({ item, onSave, onDelete }: { item: Item; onSave: (n: string) => Promise<void>; onDelete: () => Promise<void> }) {
  const { show } = useToast();
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(item.name);

  return (
    <li className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800/50 transition-colors">
      {edit ? (
        <input
          className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          value={v}
          onChange={(e) => setV(e.target.value)}
          autoFocus
        />
      ) : (
        <span className="flex-1 text-sm text-zinc-200">{item.name}</span>
      )}
      {edit ? (
        <>
          <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            onClick={async () => {
              try { await onSave(v.trim()); setEdit(false); show("수정됨"); }
              catch (e) { show((e as Error).message ?? "오류", "error"); }
            }}>저장</button>
          <button className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            onClick={() => { setEdit(false); setV(item.name); }}>취소</button>
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
    </li>
  );
}
