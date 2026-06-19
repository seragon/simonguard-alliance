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
      <h3 className="font-semibold">{title}</h3>
      <div className="flex gap-2">
        <input
          className="border rounded-lg px-3 py-2 flex-1"
          placeholder={`${title} 이름`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="bg-slate-900 text-white rounded-lg px-4 text-sm"
          onClick={async () => {
            if (!name.trim()) return;
            try {
              await onCreate(name.trim());
              setName("");
              show("추가됨");
            } catch {
              show("처리 중 오류가 발생했습니다.", "error");
            }
          }}
        >
          추가
        </button>
      </div>
      <ul className="divide-y border rounded-lg">
        {items.map((it) => (
          <Row
            key={it.id}
            item={it}
            onSave={(n) => onUpdate(it.id, n)}
            onDelete={() => onDelete(it.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function Row({
  item,
  onSave,
  onDelete,
}: {
  item: Item;
  onSave: (n: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const { show } = useToast();
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(item.name);

  return (
    <li className="flex items-center gap-2 px-3 py-2">
      {edit ? (
        <input
          className="border rounded px-2 py-1 flex-1"
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      ) : (
        <span className="flex-1">{item.name}</span>
      )}
      {edit ? (
        <button
          className="text-sm text-emerald-700"
          onClick={async () => {
            try {
              await onSave(v.trim());
              setEdit(false);
              show("수정됨");
            } catch {
              show("오류", "error");
            }
          }}
        >
          저장
        </button>
      ) : (
        <button className="text-sm text-slate-600" onClick={() => setEdit(true)}>
          수정
        </button>
      )}
      <button
        className="text-sm text-red-600"
        onClick={async () => {
          if (!confirm("삭제할까요?")) return;
          try {
            await onDelete();
            show("삭제됨");
          } catch {
            show("오류", "error");
          }
        }}
      >
        삭제
      </button>
    </li>
  );
}
