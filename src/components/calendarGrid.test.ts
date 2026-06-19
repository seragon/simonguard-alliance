// 월간 캘린더 그리드 유틸 테스트
import { monthMatrix } from "./calendarGrid";

test("2026-07 그리드는 7의 배수 셀", () => {
  const cells = monthMatrix(2026, 6); // month 0-based: 6=July
  expect(cells.length % 7).toBe(0);
  expect(cells.some((d) => d?.toISOString().slice(0, 10) === "2026-07-01")).toBe(true);
});
