// 발주 캘린더 그룹화 테스트
import { groupOrdersByDueDate } from "./calendar";
test("납기일 기준 그룹화", () => {
  const orders = [
    { id: "1", due_date: "2026-07-01" },
    { id: "2", due_date: "2026-07-01" },
    { id: "3", due_date: "2026-07-02" },
  ];
  const g = groupOrdersByDueDate(orders);
  expect(g["2026-07-01"]).toHaveLength(2);
  expect(g["2026-07-02"]).toHaveLength(1);
});
