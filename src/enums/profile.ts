/** สถานะที่เจ้าตัวตั้งเองผ่าน LIFF — DOM-02 §2.8 */
export const Availability = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type Availability = (typeof Availability)[keyof typeof Availability];

/** สถานะการผูก LINE — DOM-02 §2.8 */
export const LineLinkStatus = {
  LINE_UNLINKED: 'LINE_UNLINKED',
  LINE_LINKED: 'LINE_LINKED',
} as const;
export type LineLinkStatus = (typeof LineLinkStatus)[keyof typeof LineLinkStatus];

/** สถานะคำร้องขอใช้บริการ — DOM-02 §2.8 */
export const ServiceRequestStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;
export type ServiceRequestStatus =
  (typeof ServiceRequestStatus)[keyof typeof ServiceRequestStatus];

/** ลำดับ tab ของเมนู "การขอใช้บริการ" — REQ-SRQ-021 · Q-007 · UI ห้ามพิมพ์รายการนี้เอง */
export const SERVICE_REQUEST_STATUSES = [
  ServiceRequestStatus.PENDING,
  ServiceRequestStatus.ACCEPTED,
  ServiceRequestStatus.REJECTED,
] as const;

/**
 * ที่อยู่ 3 บล็อก — CTX-03 §3.2 · REQ-PAT-022 [MUST]
 * ⚠️ ที่อยู่ที่ Rider ใช้ไปส่ง/รับอุปกรณ์ = SHIPPING เสมอ (ADR-007) — พลาดง่ายที่สุดในระบบนี้
 */
export const AddressType = {
  BILLING: 'BILLING',
  SHIPPING: 'SHIPPING',
  SPECIMEN_RESULT: 'SPECIMEN_RESULT',
} as const;
export type AddressType = (typeof AddressType)[keyof typeof AddressType];

/** ที่อยู่ที่ Rider ใช้จริงทุกกรณี (ใบงาน, flex message, ปักหมุด GPS) — ADR-007 */
export const RIDER_ADDRESS_TYPE: AddressType = AddressType.SHIPPING;

/** เจ้าของ record แบบ polymorphic (line_accounts, attachments) — DOM-01 §1.3 D1 */
export const OwnerType = {
  PATIENT: 'PATIENT',
  RIDER: 'RIDER',
  TECHNICIAN: 'TECHNICIAN',
} as const;
export type OwnerType = (typeof OwnerType)[keyof typeof OwnerType];
