// 발주회사(로고 포함) 관리 탭
import { useOrderCompanies, useCreate, useUpdate, useDelete } from "../../data/masterData";
import ImageCrudList from "../../components/ImageCrudList";

export default function OrderCompanyTab() {
  const list = useOrderCompanies();
  const c = useCreate("order_companies"), u = useUpdate("order_companies"), d = useDelete("order_companies");

  return (
    <div className="max-w-md">
      <ImageCrudList
        title="발주회사"
        items={list.data ?? []}
        onCreate={(name, imageUrl) => c.mutateAsync({ name, image_url: imageUrl })}
        onUpdate={(id, name, imageUrl) => u.mutateAsync({ id, name, image_url: imageUrl })}
        onDelete={(id) => d.mutateAsync(id)}
      />
    </div>
  );
}
