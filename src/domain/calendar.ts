// 발주를 납기일(YYYY-MM-DD) 기준으로 그룹화
export function groupOrdersByDueDate<T extends { due_date: string }>(orders: T[]): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const o of orders) (map[o.due_date] ??= []).push(o);
  return map;
}
