// OrderSheetDocument 오프라인 렌더 검증 테스트 (Supabase 불필요)
import { renderToBuffer } from "@react-pdf/renderer";
import { describe, it, expect } from "vitest";
import { OrderSheetDocument } from "./OrderSheetDocument";
import type { OrderWithRefs } from "../data/orders";

const sample: OrderWithRefs = {
  id: "test-id-001",
  order_no: "ORD-2024-001",
  brand_id: "brand-1",
  model_id: "model-1",
  fabric_id: "fabric-1",
  order_company_id: "company-1",
  order_date: "2024-01-15",
  due_date: "2024-02-15",
  status: "ordered",
  note: "테스트 비고입니다.",
  created_by: "user-1",
  created_at: "2024-01-15T00:00:00Z",
  updated_at: "2024-01-15T00:00:00Z",
  brand_name: "시몬가드",
  model_name: "소파 A형",
  fabric_label: "한국원단 프리미엄/베이지",
  order_company_name: "테스트 발주회사",
  fabric_image_url: null,
  items: [
    { module_id: "module-1", module_name: "좌측 팔걸이", quantity: 2, image_url: null, flipped: false },
    { module_id: "module-2", module_name: "우측 팔걸이", quantity: 1, image_url: null, flipped: false },
  ],
};

describe("OrderSheetDocument 렌더 테스트", () => {
  it("PDF 버퍼를 올바르게 생성하며 %PDF 매직 바이트로 시작해야 한다.", async () => {
    const buffer = await renderToBuffer(<OrderSheetDocument order={sample} />);

    // Buffer extends Uint8Array; constructor.name works across vm contexts
    expect(buffer.constructor.name).toBe("Buffer");
    expect(buffer.length).toBeGreaterThan(1000);

    // %PDF 매직 바이트 확인
    const header = String.fromCharCode(...buffer.slice(0, 4));
    expect(header).toBe("%PDF");
  });
});
