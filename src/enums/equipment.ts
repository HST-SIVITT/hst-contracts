import { OrderStatus } from './order';

/** สถานะที่ Admin ตั้งเอง — DOM-02 §2.8 (คู่ขนานกับ Rider/Technician) */
export const AccountStatus = {
  NORMAL: 'NORMAL',
  SUSPENDED: 'SUSPENDED',
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

/**
 * เครื่องอยู่ที่ไหน — DOM-04 §4.8 · REQ-EQP-020 [MUST]
 * ⚠️ derived ทั้งหมด ห้ามให้ผู้ใช้แก้มือ (ADR-006)
 */
export const EquipmentLocationStatus = {
  IN_STOCK: 'IN_STOCK',
  RESERVED: 'RESERVED',
  WITH_PATIENT: 'WITH_PATIENT',
  IN_TRANSIT: 'IN_TRANSIT',
  /** มาจาก account_status = SUSPENDED — มีลำดับความสำคัญสูงสุด ทับค่า derived */
  MAINTENANCE: 'MAINTENANCE',
} as const;
export type EquipmentLocationStatus =
  (typeof EquipmentLocationStatus)[keyof typeof EquipmentLocationStatus];

/**
 * แมปสถานะ order → สถานะเครื่อง — DOM-02 §2.4 "ผลข้างเคียงต่ออุปกรณ์" · REQ-EQP-020
 * ต้องถูกใช้ในธุรกรรมเดียวกับการเปลี่ยนสถานะ order (ADR-006)
 */
export const ORDER_STATUS_TO_EQUIPMENT_LOCATION: Readonly<
  Record<Exclude<OrderStatus, 'NO_ACTION'>, EquipmentLocationStatus>
> = {
  PENDING_APPOINTMENT: EquipmentLocationStatus.RESERVED,
  APPOINTED: EquipmentLocationStatus.RESERVED,
  READY_TO_DISPATCH: EquipmentLocationStatus.RESERVED,
  DELIVERED: EquipmentLocationStatus.WITH_PATIENT,
  AWAITING_PICKUP: EquipmentLocationStatus.WITH_PATIENT,
  COLLECTED: EquipmentLocationStatus.IN_TRANSIT,
  RETURNED_TO_STOCK: EquipmentLocationStatus.IN_STOCK,
  COMPLETED: EquipmentLocationStatus.IN_STOCK,
  CANCELLED: EquipmentLocationStatus.IN_STOCK,
} as const;

/** เหตุผลที่ปิด booking — DOM-04 §4.8 */
export const BookingReleasedReason = {
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REASSIGNED: 'REASSIGNED',
} as const;
export type BookingReleasedReason =
  (typeof BookingReleasedReason)[keyof typeof BookingReleasedReason];
