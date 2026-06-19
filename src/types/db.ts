// DB 엔티티 타입 정의
export type Role = "super_admin" | "user";
export type OrderStatus = "ordered" | "producing" | "shipping" | "done";

export interface Profile { id: string; name: string; role: Role; created_at: string; }
export interface Brand { id: string; name: string; created_at: string; }
export interface SofaModel { id: string; brand_id: string; name: string; created_at: string; }
export interface Module { id: string; model_id: string; name: string; image_url: string | null; created_at: string; }
export interface FabricCompany { id: string; name: string; image_url: string | null; created_at: string; }
export interface Fabric { id: string; company_id: string; name: string; color: string; image_url: string | null; created_at: string; }
export interface OrderCompany { id: string; name: string; image_url: string | null; created_at: string; }
export interface Order {
  id: string; order_no: string; brand_id: string; model_id: string; fabric_id: string;
  order_company_id: string; order_date: string; due_date: string; status: OrderStatus;
  note: string; created_by: string; created_at: string; updated_at: string;
}
export interface OrderItem { id: string; order_id: string; module_id: string; quantity: number; }
