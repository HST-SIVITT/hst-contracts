/**
 * ไฟล์แนบ — DOM-04 §4.2 · TEC-04 §4.4 · REQ-NFR-004
 * ⚠️ enum ทุกตัวต้อง import จากที่นี่เท่านั้น ห้ามประกาศซ้ำใน hst-api / hst-web
 */

/**
 * ที่เก็บไฟล์จริง — เก็บลงแถวเพื่อให้รู้ว่าไฟล์เก่าอยู่ที่ไหนหลังย้ายจาก dev ขึ้น production
 * `LOCAL` ใช้ได้เฉพาะ development/test เท่านั้น (ADR-027 — กติกาเดียวกับ mail mock ใน ADR-019)
 */
export const StorageDriver = {
  S3: 'S3',
  LOCAL: 'LOCAL',
} as const;
export type StorageDriver = (typeof StorageDriver)[keyof typeof StorageDriver];

/**
 * เจ้าของไฟล์แนบ (polymorphic `owner_type`) — 1 ค่า = 1 ช่องอัปโหลดบนหน้าจอ
 * ใช้เป็นทั้งตัวจัดกลุ่มไฟล์ และตัวกำหนดว่าไฟล์ชนิดไหนอัปโหลดเข้ามาได้ (`ATTACHMENT_RULES`)
 */
export const AttachmentOwnerType = {
  /** ไฟล์ ภพ.20 ของคนไข้ — REQ-PAT-021 */
  PATIENT_VAT_DOC: 'PATIENT_VAT_DOC',
  /** หนังสือรับรองสถานพยาบาลของคนไข้ — REQ-PAT-021 */
  PATIENT_CLINIC_CERT: 'PATIENT_CLINIC_CERT',
  /**
   * รูป/ไฟล์ที่แนบมากับการอัปเดตสถานะใบงาน — REQ-ORD-030/031 (`T-057`)
   * ⚠️ เจ้าของคือ **แถวใน `order_status_histories`** ไม่ใช่ `orders`
   *    เพราะ `REQ-ORD-031` ต้องแยกรูปตามสถานะที่อัปเดตเข้ามาแต่ละครั้ง
   */
  ORDER_STATUS_ATTACHMENT: 'ORDER_STATUS_ATTACHMENT',
} as const;
export type AttachmentOwnerType = (typeof AttachmentOwnerType)[keyof typeof AttachmentOwnerType];

export const ATTACHMENT_OWNER_TYPES = Object.values(
  AttachmentOwnerType,
) as readonly AttachmentOwnerType[];

/**
 * ชนิดไฟล์ที่รับได้ต่อช่องอัปโหลด — **บังคับทั้งฝั่ง web (ตัวกรองใน `<input accept>`) และ API**
 * ⚠️ ขนาดไฟล์สูงสุด **ไม่ได้อยู่ที่นี่** เพราะปรับได้ในเมนูตั้งค่า (`s3.maxUploadSizeMb`)
 */
export const ATTACHMENT_ACCEPTED_MIME: Readonly<Record<AttachmentOwnerType, readonly string[]>> = {
  [AttachmentOwnerType.PATIENT_VAT_DOC]: ['application/pdf', 'image/jpeg', 'image/png'],
  [AttachmentOwnerType.PATIENT_CLINIC_CERT]: ['application/pdf', 'image/jpeg', 'image/png'],
  // REQ-ORD-030 "แนบรูป/ไฟล์" — ไรเดอร์ถ่ายจากมือถือเป็นหลัก จึงรับ webp เพิ่มจากชุดของคนไข้
  [AttachmentOwnerType.ORDER_STATUS_ATTACHMENT]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
};

/** นามสกุลที่ยอมให้ตั้งชื่อไฟล์ที่เก็บ — กัน path traversal และไฟล์ที่ execute ได้ */
export const ATTACHMENT_MIME_EXTENSION: Readonly<Record<string, string>> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** ไฟล์แนบชนิดนี้เป็นรูปหรือไม่ — หน้า view แสดง thumbnail ได้เฉพาะรูป (`REQ-ORD-031`) */
export function isImageMime(mime: string): boolean {
  return mime.startsWith('image/');
}

/**
 * **ค่าเริ่มต้น** ของเพดานจำนวนไฟล์ต่อ **หนึ่งครั้งที่อัปเดตสถานะ** — `REQ-ORD-030`
 *
 * ⚠️ ตั้งแต่ `T-095` ค่านี้ **ปรับได้ในเมนูตั้งค่า** แล้ว (`Q-042` ข้อ 3) —
 *    key คือ `SettingKey.GENERAL_ORDER_STATUS_ATTACHMENT_MAX_FILES`
 *    · ฝั่ง API อ่านผ่าน `SettingsService.getOrderStatusAttachmentMaxFiles()` **ห้ามอ้างค่านี้ตรง ๆ**
 *    · ค่านี้เหลือไว้เป็น fallback ตอนยังไม่มีแถวในตาราง `settings` เท่านั้น
 */
export const ORDER_STATUS_ATTACHMENT_MAX_FILES_DEFAULT = 10;

/**
 * เพดานบนที่ **ตั้งค่าเกินไม่ได้** — DTO ใช้ค่านี้เป็น `@ArrayMaxSize` (decorator อ่านค่าจาก DB ไม่ได้)
 * ส่วนเพดานจริงที่ผู้ใช้ตั้งไว้ถูกบังคับอีกชั้นที่ `OrderStatusService.transition()`
 */
export const ORDER_STATUS_ATTACHMENT_MAX_FILES_HARD_CAP = 30;
