// 한글 발주서 PDF 문서 컴포넌트
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import NotoRegular from "./fonts/NotoSansKR-Regular.ttf";
import type { OrderWithRefs } from "../data/orders";
import { statusLabel } from "../domain/status";

Font.register({ family: "Noto", fonts: [{ src: NotoRegular }] });

const s = StyleSheet.create({
  page: { padding: 32, fontFamily: "Noto", fontSize: 11 },
  title: { fontSize: 18, marginBottom: 4 },
  sub: { color: "#666", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "1 solid #eee" },
  label: { color: "#666" },
  th: { flexDirection: "row", backgroundColor: "#f1f5f9", paddingVertical: 4, paddingHorizontal: 6, marginTop: 12 },
  td: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 6, borderBottom: "1 solid #eee" },
  c1: { flex: 1 },
  c2: { width: 80, textAlign: "right" },
});

export function OrderSheetDocument({ order }: { order: OrderWithRefs }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>사이몬가드얼라이언스 발주서</Text>
        <Text style={s.sub}>{order.order_no}</Text>
        <View style={s.row}><Text style={s.label}>발주회사</Text><Text>{order.order_company_name}</Text></View>
        <View style={s.row}><Text style={s.label}>브랜드/모델</Text><Text>{order.brand_name} {order.model_name}</Text></View>
        <View style={s.row}><Text style={s.label}>원단</Text><Text>{order.fabric_label}</Text></View>
        <View style={s.row}><Text style={s.label}>발주일</Text><Text>{order.order_date}</Text></View>
        <View style={s.row}><Text style={s.label}>납기일</Text><Text>{order.due_date}</Text></View>
        <View style={s.row}><Text style={s.label}>상태</Text><Text>{statusLabel(order.status)}</Text></View>
        <View style={s.th}><Text style={s.c1}>모듈</Text><Text style={s.c2}>수량</Text></View>
        {order.items.map((it) => (
          <View key={it.module_id} style={s.td}>
            <Text style={s.c1}>{it.module_name}</Text>
            <Text style={s.c2}>{it.quantity}</Text>
          </View>
        ))}
        {order.note ? (
          <View style={{ marginTop: 12 }}>
            <Text style={s.label}>비고</Text>
            <Text>{order.note}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
