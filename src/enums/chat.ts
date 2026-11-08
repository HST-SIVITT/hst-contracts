/** ทิศทางข้อความในบทสนทนา LINE OA — FT-10 */
export const ChatMessageDirection = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
} as const;
export type ChatMessageDirection = (typeof ChatMessageDirection)[keyof typeof ChatMessageDirection];

/** ชนิดข้อความขั้นต่ำที่ UI Chat ต้องแสดงได้ (`REQ-CHT-004`) */
export const ChatMessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  STICKER: 'STICKER',
  /**
   * `CR-043` · `REQ-CHT-020` — ไฟล์เอกสารที่ CMS **ส่งออก** ไปให้คู่สนทนา (ขา OUTBOUND เท่านั้น)
   * ⚠️ LINE **ไม่มี** message type สำหรับไฟล์เอกสาร ขาส่งจริงจึงเป็นข้อความ + ลิงก์ดาวน์โหลด
   *    ค่านี้มีไว้ให้ประวัติในหน้า Chat แสดงเป็นการ์ดไฟล์ ไม่ใช่ข้อความเปล่า
   */
  FILE: 'FILE',
  UNKNOWN: 'UNKNOWN',
} as const;
export type ChatMessageType = (typeof ChatMessageType)[keyof typeof ChatMessageType];

/**
 * `CR-043` · `REQ-CHT-016/017/019` — สถานะการแสดงคู่สนทนาในรายชื่อของ **channel นั้น**
 *
 * - `ACTIVE`  = อยู่ในรายชื่อหลัก (ค่าที่หน้า Chat ใช้เป็นปกติ)
 * - `HIDDEN`  = admin กด "ซ่อน" · **ข้อความ INBOUND ใหม่ปลดให้เองเป็น `ACTIVE`** (`REQ-CHT-016`)
 * - `BLOCKED` = admin กด "บล็อค" · ปลดได้ด้วยมือเท่านั้น และข้อความ INBOUND ถูกทิ้ง (`REQ-CHT-017`)
 *
 * ⚠️ "ลบประวัติ" (`REQ-CHT-018`) **ไม่ใช่สถานะในชุดนี้** — มันล้างข้อความแล้วปล่อยให้แถวกลับมา
 *    เองเมื่อมีข้อความใหม่ จึงไม่มี tab ให้จัดการใน popup ของ `REQ-CHT-019`
 */
export const ChatThreadState = {
  ACTIVE: 'ACTIVE',
  HIDDEN: 'HIDDEN',
  BLOCKED: 'BLOCKED',
} as const;
export type ChatThreadState = (typeof ChatThreadState)[keyof typeof ChatThreadState];

/** tab ที่ popup "จัดการรายชื่อที่ซ่อน/บล็อค" มีให้เลือก — เรียงตามลำดับบนหน้าจอ (`REQ-CHT-019`) */
export const CHAT_RESTRICTED_STATES = [
  ChatThreadState.HIDDEN,
  ChatThreadState.BLOCKED,
] as const satisfies readonly ChatThreadState[];
