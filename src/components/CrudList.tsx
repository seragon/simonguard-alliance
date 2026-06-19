// 단일 이름 필드 항목의 목록/추가/수정/삭제 재사용 컴포넌트
import { useState } from "react";
import { useToast } from "./Toast";

interface Item { id: string; name: string }
interface Props {
  title: string;
  items: Item[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function CrudList({ title, items, onCreate, onUpdate, onDelete }: Props) {
  const { show } = useToast();
  const [name, setName] = useState("");

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
      <div className="flex gap-2">
        <input
          className="bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          placeholder={`${title} 이름`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.form?.requestSubmit(); }}
        />
        <button
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors flex-shrink-0"
          onClick={async () => {
            if (!name.trim()) return;
            try { await onCreate(name.trim()); setName(""); show("추가됨"); }
            catch (e) { show((e as Error).message ?? "오류", "error"); }
          }}
        >
          추가
        </button>
      </div>
      <ul className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
        {items.map((it) => (
          <Row key={it.id} item={it} onSave={(n) => onUpdate(it.id, n)} onDelete={() => onDelete(it.id)} />
        ))}
        {items.length === 0 && (
          <li className="px-4 py-5 text-center text-sm text-zinc-600">항목이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}

function Row({ item, onSave, onDelete }: { item: Item; onSave: (n: string) => Promise<void>; onDelete: () => Promise<void> }) {
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
        <button
          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          onClick={async () => {
            try { await onSave(v.trim()); setEdit(false); show("수정됨"); }
            catch (e) { show((e as Error).message ?? "오류", "error"); }
          }}
        >
          저장
        </button>
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
    </li>
  );
}
