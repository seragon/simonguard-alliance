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

const inputCls = "w-full bg-white border border-apple-hairline text-apple-ink placeholder:text-apple-ink-muted-48 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apple-primary/20 focus:border-apple-primary transition-all font-sans";

export default function CrudList({ title, items, onCreate, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-apple-canvas-parchment border border-apple-hairline text-apple-ink-muted-80 hover:text-apple-ink rounded-full text-xs font-normal transition-all active-scale"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
          className="flex-shrink-0 px-4 bg-apple-primary hover:bg-apple-primary-focus text-white rounded-full text-sm font-medium transition-all active-scale"
        >추가</button>
      </div>

      {/* 목록: Apple hairline border 및 둥글기 적용 */}
      <ul className="divide-y divide-apple-divider-soft border border-apple-hairline rounded-apple-lg overflow-hidden max-h-72 overflow-y-auto bg-white mt-4">
        {items.map((it) => (
          <ManageRow key={it.id} item={it} onSave={(n) => onUpdate(it.id, n)} onDelete={() => onDelete(it.id)} />
        ))}
        {items.length === 0 && (
          <li className="px-4 py-4 text-center text-sm text-apple-ink-muted-48">항목이 없습니다.</li>
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
    <li className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-apple-canvas-parchment transition-colors">
      {edit ? (
        <input
          className="bg-white border border-apple-hairline text-apple-ink rounded-full px-3 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
          value={v}
          onChange={(e) => setV(e.target.value)}
          autoFocus
        />
      ) : (
        <span className="flex-1 text-sm text-apple-ink font-normal">{item.name}</span>
      )}
      {edit ? (
        <>
          <button className="text-xs text-apple-primary font-semibold hover:opacity-80 transition-opacity"
            onClick={async () => {
              try { await onSave(v.trim()); setEdit(false); show("수정됨"); }
              catch (e) { show((e as Error).message ?? "오류", "error"); }
            }}>저장</button>
          <button className="text-xs text-apple-ink-muted-80 hover:text-apple-ink transition-colors"
            onClick={() => { setEdit(false); setV(item.name); }}>취소</button>
        </>
      ) : (
        <button className="text-xs text-apple-primary font-medium hover:opacity-80 transition-opacity" onClick={() => setEdit(true)}>수정</button>
      )}
      <button className="text-xs text-red-600 font-medium hover:opacity-80 transition-opacity"
        onClick={async () => {
          if (!confirm("삭제할까요?")) return;
          try { await onDelete(); show("삭제됨"); }
          catch (e) { show((e as Error).message ?? "삭제 오류", "error"); }
        }}>삭제</button>
    </li>
  );
}
