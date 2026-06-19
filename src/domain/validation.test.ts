// 발주 폼 검증 테스트
import type { OrderFormInput } from "./validation";
import { validateOrderForm } from "./validation";

const base: OrderFormInput = {
  brand_id: "b", model_id: "m", fabric_id: "f", order_company_id: "c",
  due_date: "2026-07-01", items: [{ module_id: "x", quantity: 1 }],
};

test("유효한 입력은 오류 없음", () => {
  expect(validateOrderForm(base)).toEqual([]);
});
test("브랜드 누락 감지", () => {
  expect(validateOrderForm({ ...base, brand_id: "" })).toContain("브랜드를 선택하세요.");
});
test("모듈 0개 감지", () => {
  expect(validateOrderForm({ ...base, items: [] })).toContain("모듈을 1개 이상 선택하세요.");
});
test("수량 0 이하 감지", () => {
  expect(validateOrderForm({ ...base, items: [{ module_id: "x", quantity: 0 }] }))
    .toContain("모듈 수량은 1 이상이어야 합니다.");
});
test("납기일 누락 감지", () => {
  expect(validateOrderForm({ ...base, due_date: "" })).toContain("납기일을 입력하세요.");
});
