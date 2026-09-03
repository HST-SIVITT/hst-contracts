import { AssignmentStatus, OrderStatus, StatusAudience } from '../enums/order';
import { EquipmentLocationStatus } from '../enums/equipment';

/**
 * สี hex ของสถานะงาน — DOM-02 §2.2 · REQ-UIX-005 [MUST]
 * "หากส่วนไหนก็ตามมีการเอาสถานะของงานไปแสดง ก็ให้แสดงสีประกอบตามที่ระบุด้วยเสมอ"
 * ⚠️ ห้ามคัดลอกค่าสีเหล่านี้ไปเขียนซ้ำที่อื่น — import จากที่นี่เท่านั้น
 */
export const ORDER_STATUS_COLORS: Readonly<Record<OrderStatus, string>> = {
  PENDING_APPOINTMENT: '#F59E0B',
  APPOINTED: '#2563EB',
  READY_TO_DISPATCH: '#7C3AED',
  DELIVERED: '#0EA5E9',
  AWAITING_PICKUP: '#F97316',
  COLLECTED: '#EC4899',
  RETURNED_TO_STOCK: '#92400E',
  COMPLETED: '#16A34A',
  CANCELLED: '#DC2626',
  NO_ACTION: '#6B7280',
} as const;

/** สีวงกลมของสถานะผู้รับงาน — DOM-02 §2.5 · REQ-ORD-026 */
export const ASSIGNMENT_STATUS_COLORS: Readonly<Record<AssignmentStatus, string>> = {
  NOT_ASSIGNED: '#9CA3AF',
  PENDING_ACCEPT: '#F97316',
  ACCEPTED: '#16A34A',
  CANCELLED: '#DC2626',
} as const;

/** สี badge ของสถานะเครื่อง — DOM-04 §4.8 · REQ-EQP-012 */
export const EQUIPMENT_LOCATION_COLORS: Readonly<Record<EquipmentLocationStatus, string>> = {
  IN_STOCK: '#16A34A',
  RESERVED: '#F97316',
  WITH_PATIENT: '#0EA5E9',
  IN_TRANSIT: '#7C3AED',
  MAINTENANCE: '#6B7280',
} as const;

/**
 * i18n key ที่ผู้ชมแต่ละกลุ่มเห็นต่างจากค่ามาตรฐาน — ADR-005 · REQ-ORD-022
 * ตอนนี้มีรายการเดียว: Technician เห็น DELIVERED เป็น "รอทำ Tele"
 *
 * ⚠️ key เป็น `order.statusTechnician.<STATUS>` ไม่ใช่ `order.status.<STATUS>.technician`
 *    เพราะ next-intl สงวนอักขระ "." ไว้เป็นตัวคั่น namespace จึงมี "." ในชื่อ key ไม่ได้
 *    (ดู ADR-012) — ค่า enum ในระบบหลังบ้านยังเป็น DELIVERED ตัวเดิม ไม่มีสถานะใหม่
 */
const AUDIENCE_LABEL_OVERRIDES: Partial<
  Record<StatusAudience, Partial<Record<OrderStatus, string>>>
> = {
  [StatusAudience.TECHNICIAN]: {
    [OrderStatus.DELIVERED]: 'order.statusTechnician.DELIVERED',
  },
};

/** i18n key ของ label สถานะงาน ตามผู้ชม — ADR-005 */
export function orderStatusLabelKey(status: OrderStatus, audience: StatusAudience): string {
  return AUDIENCE_LABEL_OVERRIDES[audience]?.[status] ?? `order.status.${status}`;
}

/**
 * สถานะที่แสดงจริง — NO_ACTION เป็นค่า derived ตอนอ่าน ไม่เคยเก็บใน DB (ADR-003)
 * `teleAppointmentAt` เป็น UTC · `now` ให้ผู้เรียกส่งเข้ามาเพื่อให้ test ได้
 */
export function resolveDisplayOrderStatus(
  status: OrderStatus,
  teleAppointmentAt: Date | string | null | undefined,
  now: Date = new Date(),
): OrderStatus {
  if (status !== OrderStatus.APPOINTED || !teleAppointmentAt) return status;
  const at = teleAppointmentAt instanceof Date ? teleAppointmentAt : new Date(teleAppointmentAt);
  return at.getTime() < now.getTime() ? OrderStatus.NO_ACTION : status;
}
