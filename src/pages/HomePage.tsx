// 메인 페이지: 캘린더 + 발주 리스트
import OrderCalendar from "../components/OrderCalendar";
import OrderList from "../components/OrderList";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <OrderCalendar />
      <OrderList />
    </div>
  );
}
