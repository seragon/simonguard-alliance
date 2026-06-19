// 월간 캘린더 셀(앞뒤 빈칸 포함) 생성 유틸
export function monthMatrix(year: number, month0: number): (Date | null)[] {
  const first = new Date(year, month0, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month0, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Date → 'YYYY-MM-DD' 문자열 */
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
