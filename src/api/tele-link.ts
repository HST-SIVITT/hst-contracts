/* ===========================================================================
 * ลิงก์ตัวกลางของการ์ดนัดหมาย (short link) — `REQ-ORD-084` · `CR-041`
 *
 * ปัญหาเดิม: การ์ด Flex ใน LINE แนบ **ปลายทางจริง** (`orders.tele_link` /
 * `orders.technician_tele_link`) ไปเลย · การ์ดที่ส่งออกไปแล้วแก้ไม่ได้ ดังนั้นพอ
 * ปลายทางเปลี่ยน (เปลี่ยนห้องประชุม / ย้ายไปลิงก์ภายนอก) ต้องส่งการ์ดใบใหม่ซ้ำเสมอ
 *
 * ทางแก้: แนบ `/<prefix>/<token>` ของ **ใบงาน** ไปแทน · token ผูกกับ (ใบงาน, ฝั่งผู้รับ)
 * ไม่เปลี่ยนตลอดอายุใบงาน ส่วนปลายทางอ่านสด ๆ ตอนมีคนกดลิงก์
 *
 * ⚠️ prefix ต้องไม่ขึ้นต้นด้วย `/api/` — nginx ส่ง `/api/*` เข้า NestJS ทั้งหมด
 *    (ข้อควรระวัง `CR-023` ข้อ 3) · route จริงอยู่ที่ hst-web
 * =========================================================================*/

/** คำนำหน้า path ของลิงก์ตัวกลาง — สั้นที่สุดเท่าที่ยังไม่ชนกับเมนูของ CMS */
export const TELE_LINK_PATH_PREFIX = '/r';

/**
 * ความยาวของ token — `randomBytes(16).toString('base64url')` ได้ 22 อักขระพอดี
 * (เอนโทรปี 128 บิต · เดาไม่ได้ และไม่ต้องตรวจชนกับของเดิม)
 */
export const TELE_LINK_TOKEN_LENGTH = 22;

/**
 * รูปแบบที่รับได้ — base64url เท่านั้น เพื่อให้ path ไม่ต้อง encode และตรวจทิ้งได้ตั้งแต่ชั้นแรก
 *
 * ⚠️ ช่วงความยาวกว้างกว่า `TELE_LINK_TOKEN_LENGTH` โดยตั้งใจ เพราะใบงานที่มีอยู่ก่อน `CR-041`
 *    ถูก backfill ด้วย `REPLACE(UUID(),'-','')` ของ MariaDB (32 อักขระ) ซึ่งเขียนใน SQL ล้วน
 *    ได้แน่นอนทุกรุ่น ต่างจาก `RANDOM_BYTES()` ที่มีเฉพาะรุ่นใหม่
 */
export const TELE_LINK_TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export function isTeleLinkToken(raw: string | undefined | null): boolean {
  return typeof raw === 'string' && TELE_LINK_TOKEN_PATTERN.test(raw);
}

/** path ของลิงก์ตัวกลาง — ใช้ร่วมกันทั้งฝั่งที่ประกอบ URL และ route ของ hst-web */
export function teleLinkPath(token: string): string {
  return `${TELE_LINK_PATH_PREFIX}/${token}`;
}

/** URL เต็มที่เอาไปแนบการ์ด/ให้ผู้ใช้คัดลอก — `baseUrl` ต้องเป็น origin ของ hst-web */
export function teleLinkUrl(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/+$/, '')}${teleLinkPath(token)}`;
}

/** คำตอบของ `GET /tele-links/:token` — เปิดสาธารณะ จึงคืนเฉพาะปลายทาง ไม่มีข้อมูลผู้ป่วย */
export interface TeleLinkTargetView {
  url: string;
}
