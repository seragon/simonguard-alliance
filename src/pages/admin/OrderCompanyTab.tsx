// 발주회사 관리 탭
import { useOrderCompanies, useCreate, useUpdate, useDelete } from "../../data/masterData";
import CrudList from "../../components/CrudList";

export default function OrderCompanyTab() {
  const list = useOrderCompanies();
  const c = useCreate("order_companies"), u = useUpdate("order_companies"), d = useDelete("order_companies");

  return (
    <div className="max-w-md">
      <CrudList
        title="발주회사"
        items={list.data ?? []}
        onCreate={(name) => c.mutateAsync({ name })}
        onUpdate={(id, name) => u.mutateAsync({ id, name })}
        onDelete={(id) => d.mutateAsync(id)}
      />
    </div>
  );
}
