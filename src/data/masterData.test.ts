// 마스터데이터 리스트 키 빌더 단위 테스트
import { listKey } from "./masterData";

test("필터 없는 리스트 키", () => {
  expect(listKey("brands")).toEqual(["brands", {}]);
});

test("필터 있는 리스트 키", () => {
  expect(listKey("sofa_models", { brand_id: "b1" })).toEqual(["sofa_models", { brand_id: "b1" }]);
});
