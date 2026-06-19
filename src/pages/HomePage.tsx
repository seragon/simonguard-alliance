// 메인 페이지: 캘린더(Task 13) + 발주 리스트
import OrderList from "../components/OrderList";

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* 캘린더는 Task 13에서 이 위에 추가 */}
      <OrderList />
    </div>
  );
}
