// 원단회사 및 원단(이름/색상) 관리 탭
import { useState } from "react";
import { useFabricCompanies, useFabrics, useCreate, useUpdate, useDelete } from "../../data/masterData";
import CrudList from "../../components/CrudList";
import { useToast } from "../../components/Toast";

export default function FabricTab() {
  const { show } = useToast();
  const [companyId, setCompanyId] = useState<string>();
  const companies = useFabricCompanies();
  const fabrics = useFabrics(companyId);

  const cC = useCreate("fabric_companies"), uC = useUpdate("fabric_companies"), dC = useDelete("fabric_companies");
  const cF = useCreate("fabrics"), dF = useDelete("fabrics");
  const [fname, setFname] = useState("");
  const [color, setColor] = useState("");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 원단회사 */}
      <div>
        <CrudList
          title="원단회사"
          items={companies.data ?? []}
          onCreate={(name) => cC.mutateAsync({ name })}
          onUpdate={(id, name) => uC.mutateAsync({ id, name })}
          onDelete={(id) => dC.mutateAsync(id)}
        />
        <ul className="mt-2 text-sm">
          {(companies.data ?? []).map((c) => (
            <li key={c.id}>
              <button
                className={companyId === c.id ? "font-bold" : ""}
                onClick={() => setCompanyId(c.id)}
              >
                · {c.name} 선택
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 원단 (이름 + 색상) */}
      <div>
        {companyId ? (
          <div className="space-y-3">
            <h3 className="font-semibold">원단 (이름 + 색상)</h3>
            <div className="flex gap-2">
              <input
                className="border rounded-lg px-3 py-2 flex-1"
                placeholder="원단명"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2 flex-1"
                placeholder="색상"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <button
                className="bg-slate-900 text-white rounded-lg px-4 text-sm"
                onClick={async () => {
                  if (!fname.trim() || !color.trim()) return;
                  try {
                    await cF.mutateAsync({ company_id: companyId, name: fname.trim(), color: color.trim() });
                    setFname(""); setColor("");
                    show("추가됨");
                  } catch {
                    show("오류", "error");
                  }
                }}
              >
                추가
              </button>
            </div>
            <ul className="divide-y border rounded-lg">
              {(fabrics.data ?? []).map((f) => (
                <li key={f.id} className="flex justify-between px-3 py-2">
                  <span>{f.name} / {f.color}</span>
                  <button
                    className="text-sm text-red-600"
                    onClick={async () => {
                      if (!confirm("삭제?")) return;
                      try { await dF.mutateAsync(f.id); show("삭제됨"); }
                      catch { show("오류", "error"); }
                    }}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-slate-500">원단회사를 선택하세요.</p>
        )}
      </div>
    </div>
  );
}
