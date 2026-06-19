// 발주 order_items payload 빌더 단위 테스트
import { buildOrderItemsPayload } from "./orders";

test("order_items payload 생성", () => {
  const r = buildOrderItemsPayload("o1", [
    { module_id: "m1", quantity: 2 },
    { module_id: "m2", quantity: 1 },
  ]);
  expect(r).toEqual([
    { order_id: "o1", module_id: "m1", quantity: 2 },
    { order_id: "o1", module_id: "m2", quantity: 1 },
  ]);
});
