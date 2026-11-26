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

/**
 * ⭐ โหมดการกรอกที่อยู่ของคนไข้/ใบงาน — `REQ-PAT-033` · `REQ-ORD-087` (`CR-051` · `T-243`)
 *
 * `REQ-PAT-031` เดิมเก็บโหมดนี้ไว้ในฟอร์มอย่างเดียว แล้ว **เดาย้อนกลับ** จาก "มีข้อมูลที่อยู่ไหม"
 * ตอนเปิดฟอร์มรอบถัดไป → ผู้ใช้ที่กรอกที่อยู่ไปแล้วแล้วย้อนมาเลือก `LATER` และกดบันทึก
 * จะเห็นระบบเด้งกลับเป็น `NOW` เพราะที่อยู่เดิมยังอยู่ในฐานข้อมูล (ตั้งใจเก็บไว้)
 * จึงต้องเก็บ "เจตนาของผู้ใช้" เป็นคอลัมน์ของตัวเอง แยกจาก "มีข้อมูลหรือไม่"
 *
 * - `NOW`   = กรอกที่อยู่ตอนนี้ → แสดงบล็อกที่อยู่ทั้งในฟอร์มและหน้า view
 * - `LATER` = ยังไม่กรอก ค่อยเพิ่มภายหลัง → **ซ่อน**ทั้งฟอร์มและหน้า view
 *            (ข้อมูลเดิมยังอยู่ในฐานข้อมูล ไม่ถูกลบ — กลับมาเลือก `NOW` แล้วเห็นเหมือนเดิม)
 */
export const AddressMode = {
  NOW: 'NOW',
  LATER: 'LATER',
} as const;
export type AddressMode = (typeof AddressMode)[keyof typeof AddressMode];

export const ADDRESS_MODES = Object.values(AddressMode) as readonly AddressMode[];

/** ค่าเริ่มต้นของ record ที่สร้างก่อนมีคอลัมน์นี้ (migration เติมย้อนหลังด้วยค่าที่เดาจากข้อมูลจริง) */
export const ADDRESS_MODE_DEFAULT: AddressMode = AddressMode.NOW;

export function isAddressMode(value: unknown): value is AddressMode {
  return typeof value === 'string' && (ADDRESS_MODES as readonly string[]).includes(value);
}

/** เจ้าของ record แบบ polymorphic (line_accounts, attachments) — DOM-01 §1.3 D1 */
export const OwnerType = {
  PATIENT: 'PATIENT',
  RIDER: 'RIDER',
  TECHNICIAN: 'TECHNICIAN',
  /** `CR-022` ข้อ 5 · `REQ-DVM-007` — Device Manager ผูกบัญชี LINE ได้แล้ว (ADR-052) */
  DEVICE_MANAGER: 'DEVICE_MANAGER',
} as const;
export type OwnerType = (typeof OwnerType)[keyof typeof OwnerType];
