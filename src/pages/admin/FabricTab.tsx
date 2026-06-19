// 원단회사 및 원단(이름/색상/이미지) 관리 탭
import { useState } from "react";
import { useFabricCompanies, useFabrics, useCreate, useUpdate, useDelete } from "../../data/masterData";
import ImageCrudList from "../../components/ImageCrudList";
import ImageUpload from "../../components/ImageUpload";
import { useToast } from "../../components/Toast";
import type { Fabric } from "../../types/db";

function FabricRow({
  fabric,
  onSave,
  onDelete,
}: {
  fabric: Fabric;
  onSave: (name: string, color: string, imageUrl: string | null) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const { show } = useToast();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(fabric.name);
  const [color, setColor] = useState(fabric.color);
  const [imageUrl, setImageUrl] = useState<string | null>(fabric.image_url ?? null);

  const inputCls = "bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50";

  return (
    <li className="bg-zinc-900 hover:bg-zinc-800/40 transition-colors">
      <div className="flex items-center gap-3 px-3 py-3">
        {!edit && (
          fabric.image_url ? (
            <img src={fabric.image_url} alt="" className="w-9 h-9 object-cover rounded-lg border border-zinc-700 flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159" />
              </svg>
            </div>
          )
        )}
        <div className="flex-1 min-w-0">
          {edit ? (
            <div className="flex gap-2">
              <input className={inputCls + " flex-1"} value={name} onChange={(e) => setName(e.target.value)} placeholder="원단명" autoFocus />
              <input className={inputCls + " w-24"} value={color} onChange={(e) => setColor(e.target.value)} placeholder="색상" />
            </div>
          ) : (
            <>
              <p className="text-sm text-zinc-200 truncate">{fabric.name}</p>
              <p className="text-xs text-zinc-500">{fabric.color}</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {edit ? (
            <>
              <button
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                onClick={async () => {
                  try { await onSave(name.trim(), color.trim(), imageUrl); setEdit(false); show("수정됨"); }
                  catch (e) { show((e as Error).message ?? "오류", "error"); }
                }}
              >저장</button>
              <button
                className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
                onClick={() => { setEdit(false); setName(fabric.name); setColor(fabric.color); setImageUrl(fabric.image_url ?? null); }}
              >취소</button>
            </>
          ) : (
            <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors" onClick={() => setEdit(true)}>수정</button>
          )}
          <button
            className="text-xs text-red-500 hover:text-red-400 transition-colors"
            onClick={async () => {
              if (!confirm("삭제할까요?")) return;
              try { await onDelete(); show("삭제됨"); }
              catch (e) { show((e as Error).message ?? "삭제 오류", "error"); }
            }}
          >삭제</button>
        </div>
      </div>
      {edit && (
        <div className="px-3 pb-3">
          <ImageUpload value={imageUrl} onChange={setImageUrl} label="원단 이미지" />
        </div>
      )}
    </li>
  );
}

export default function FabricTab() {
  const { show } = useToast();
  const [companyId, setCompanyId] = useState<string>();
  const companies = useFabricCompanies();
  const fabrics = useFabrics(companyId);

  const cC = useCreate("fabric_companies"), uC = useUpdate("fabric_companies"), dC = useDelete("fabric_companies");
  const cF = useCreate("fabrics"), uF = useUpdate("fabrics"), dF = useDelete("fabrics");
  const [fname, setFname] = useState("");
  const [color, setColor] = useState("");
  const [fabricImg, setFabricImg] = useState<string | null>(null);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 원단회사 (로고 포함) */}
      <div className="space-y-3">
        <ImageCrudList
          title="원단회사"
          items={companies.data ?? []}
          onCreate={(name, imageUrl) => cC.mutateAsync({ name, image_url: imageUrl })}
          onUpdate={(id, name, imageUrl) => uC.mutateAsync({ id, name, image_url: imageUrl })}
          onDelete={(id) => dC.mutateAsync(id)}
        />
        {(companies.data ?? []).length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 font-medium px-1">원단회사 선택 → 원단 관리</p>
            {(companies.data ?? []).map((c) => (
              <button
                key={c.id}
                onClick={() => setCompanyId(c.id)}
                className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  companyId === c.id
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {c.image_url && <img src={c.image_url} alt="" className="w-5 h-5 object-cover rounded flex-shrink-0" />}
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 원단 (이름 + 색상 + 이미지) */}
      <div>
        {companyId ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-100">원단 등록</h3>
            <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">원단명</label>
                <input className={inputCls} placeholder="원단명 입력" value={fname} onChange={(e) => setFname(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">색상</label>
                <input className={inputCls} placeholder="색상 입력" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <ImageUpload value={fabricImg} onChange={setFabricImg} label="원단 이미지" />
              <button
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
                onClick={async () => {
                  if (!fname.trim() || !color.trim()) return;
                  try {
                    await cF.mutateAsync({ company_id: companyId, name: fname.trim(), color: color.trim(), image_url: fabricImg });
                    setFname(""); setColor(""); setFabricImg(null);
                    show("추가됨");
                  } catch {
                    show("오류", "error");
                  }
                }}
              >
                원단 추가
              </button>
            </div>

            {/* 원단 목록 */}
            <ul className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
              {(fabrics.data ?? []).map((f) => (
                <FabricRow
                  key={f.id}
                  fabric={f}
                  onSave={(name, color, imageUrl) => uF.mutateAsync({ id: f.id, name, color, image_url: imageUrl })}
                  onDelete={() => dF.mutateAsync(f.id)}
                />
              ))}
              {fabrics.data?.length === 0 && (
                <li className="px-4 py-5 text-center text-sm text-zinc-600">원단이 없습니다.</li>
              )}
            </ul>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-600">← 원단회사를 선택하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
