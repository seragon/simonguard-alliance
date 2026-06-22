// 발주 폼 검증 순수 함수
export interface OrderFormInput {
  brand_id: string; model_id: string; fabric_id: string; order_company_id: string;
  due_date: string; items: { module_id: string; quantity: number; flipped?: boolean }[];
}

export function validateOrderForm(i: OrderFormInput): string[] {
  const errors: string[] = [];
  if (!i.brand_id) errors.push("브랜드를 선택하세요.");
  if (!i.model_id) errors.push("모델을 선택하세요.");
  if (!i.fabric_id) errors.push("원단을 선택하세요.");
  if (!i.order_company_id) errors.push("발주회사를 선택하세요.");
  if (!i.due_date) errors.push("납기일을 입력하세요.");
  if (i.items.length === 0) errors.push("모듈을 1개 이상 선택하세요.");
  if (i.items.some((it) => it.quantity < 1)) errors.push("모듈 수량은 1 이상이어야 합니다.");
  return errors;
}
