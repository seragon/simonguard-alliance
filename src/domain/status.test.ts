// 발주 상태 라벨/색상 테스트
import { statusLabel, statusColor } from "./status";
test("상태 라벨", () => {
  expect(statusLabel("ordered")).toBe("발주됨");
  expect(statusLabel("done")).toBe("완료");
});
test("상태 색상은 4개 모두 정의", () => {
  for (const s of ["ordered","producing","shipping","done"] as const) {
    expect(statusColor(s)).toMatch(/^bg-/);
  }
});
