/**
 * รูปแบบรหัสใบงาน — `CR-035` · `REQ-ORD-079`..`REQ-ORD-083`
 *
 * ของเดิมตรึงไว้ที่ `L${order.id}` ใน `OrderWriterService` ซึ่งพ่วงรหัสที่คนไข้เห็นไว้กับ
 * primary key ของตาราง (ข้ามเลขทันทีที่มีหลายไซต์) ไฟล์นี้คือ **ที่เดียว** ที่รู้ว่า
 * pattern หน้าตาแบบไหนใช้ได้ และประกอบรหัสออกมายังไง — ทั้ง API และหน้าตั้งค่าต้องเรียกตัวนี้
 *
 * ⚠️ ห้ามเขียน regex ตรวจ pattern หรือประกอบรหัสซ้ำที่อื่น (ข้อควรระวังข้อ 248)
 */

/** token ที่ pattern รู้จัก — ค่าอื่นทั้งหมดถูกปฏิเสธตอนบันทึก ไม่ปล่อยผ่านเป็นตัวอักษรธรรมดา */
export const ORDER_CODE_TOKENS = ['site_code', 'YYYY', 'YY', 'MM', 'RUNNING_ID'] as const;
export type OrderCodeToken = (typeof ORDER_CODE_TOKENS)[number];

/**
 * ค่าเริ่มต้น = พฤติกรรมเดิมเป๊ะ ๆ — ไซต์ที่ไม่เคยเข้าหน้าตั้งค่าต้องได้รหัสหน้าตาเดิม
 * ⚠️ ค่านี้เป็นเพียง **fallback** ค่าจริงอยู่ในตาราง `settings` (`REQ-SET-001`)
 */
export const ORDER_CODE_PATTERN_DEFAULT = 'L[RUNNING_ID]';

/** `orders.code` เป็น `VARCHAR(30)` (migration `0010`) — รหัสที่ประกอบแล้วต้องไม่เกินนี้ */
export const ORDER_CODE_MAX_LENGTH = 30;
export const ORDER_CODE_PATTERN_MAX_LENGTH = 60;
export const ORDER_CODE_SITE_CODE_MAX_LENGTH = 10;

/**
 * เพดานของเลขวิ่ง — กัน `nextRunning` ที่ตั้งพลาดจนรหัสยาวเกินคอลัมน์
 * (9 หลัก + ส่วนที่เหลือของ pattern ยังพอใส่ใน 30 ตัวอักษร)
 */
export const ORDER_CODE_RUNNING_MAX = 999_999_999;

/**
 * ตัวอักษรที่ยอมให้อยู่นอก token และใน `site_code`
 *
 * ⚠️ แคบไว้โดยตั้งใจ: รหัสใบงานถูกนำไปประกอบเป็น **ชื่อห้องประชุมทางไกล** ผ่าน
 * `consult.patientPathTemplate` (`HST_{orderCode}`) แล้วส่งต่อให้ Jitsi ตรง ๆ
 * ถ้าปล่อยช่องว่าง `/` `#` `?` เข้ามา ลิงก์ที่ส่งให้คนไข้จะพังแบบไม่มีใครรู้ (`REQ-ORD-082`)
 */
export const ORDER_CODE_LITERAL_PATTERN = /^[A-Za-z0-9_-]*$/;

export type OrderCodePatternIssue =
  | 'EMPTY'
  | 'TOO_LONG'
  | 'BRACKET'
  | 'TOKEN_UNKNOWN'
  | 'RUNNING_ID_MISSING'
  | 'RUNNING_ID_DUPLICATED'
  | 'LITERAL_CHARSET';

export type OrderCodeSiteCodeIssue = 'TOO_LONG' | 'CHARSET';

export interface OrderCodeFormat {
  /** ค่ากลางของไซต์ที่ส่วนอื่นอ้างอิงได้ด้วย — `REQ-SET-037` · ว่างได้ (pattern อาจไม่ใช้ token นี้) */
  siteCode: string;
  pattern: string;
}

/** สภาพแวดล้อมตอนประกอบรหัส — `now` เป็นเวลา UTC แล้วแปลงเป็นเวลาไทยในตัวฟังก์ชัน */
export interface OrderCodeContext extends OrderCodeFormat {
  runningId: number;
  now: Date;
}

/**
 * ปี **พุทธศักราช** ตามเวลาไทย — ยืนยันโดยเจ้าของงาน 2026-10-21 (`Q-090` RESOLVED)
 *
 * `[YY]`/`[YYYY]` เป็น พ.ศ. เสมอ ไม่ใช่ ค.ศ. (ตัวอย่าง `HST69_200` = พ.ศ. 2569)
 * ⚠️ ไม่มี token ของคริสต์ศักราชโดยตั้งใจ — ถ้าจะเพิ่มภายหลังให้เพิ่มใน `ORDER_CODE_TOKENS`
 *    และ `values` ของ `renderOrderCode()` **ห้ามเปลี่ยนความหมายของ `[YY]` ที่มีอยู่**
 *    เพราะรหัสที่ออกไปแล้วจะอ่านย้อนกลับไม่ตรงกับกติกา
 */
export function buddhistYearParts(now: Date): { yyyy: string; yy: string; mm: string } {
  const bangkok = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const year = bangkok.getUTCFullYear() + 543;
  return {
    yyyy: String(year),
    yy: String(year % 100).padStart(2, '0'),
    mm: String(bangkok.getUTCMonth() + 1).padStart(2, '0'),
  };
}

/** แยก pattern เป็นชิ้น ๆ — คืน `null` เมื่อวงเล็บไม่สมดุล (ต้องให้ caller ตัดสินว่าเป็น error) */
function splitPattern(pattern: string): ({ token: OrderCodeToken } | { literal: string })[] | null {
  const parts: ({ token: OrderCodeToken } | { literal: string })[] = [];
  let index = 0;
  while (index < pattern.length) {
    const open = pattern.indexOf('[', index);
    if (open === -1) {
      parts.push({ literal: pattern.slice(index) });
      break;
    }
    if (open > index) parts.push({ literal: pattern.slice(index, open) });
    const close = pattern.indexOf(']', open);
    if (close === -1) return null;
    const name = pattern.slice(open + 1, close);
    // `]` ที่โผล่มาก่อน `[` ตัวถัดไปแล้วไม่มีชื่ออยู่ข้างใน = วงเล็บเพี้ยน
    if (!name || name.includes('[')) return null;
    parts.push({ token: name as OrderCodeToken });
    index = close + 1;
  }
  return parts;
}

/** `null` = ใช้ได้ · ค่าอื่น = เหตุผลที่ใช้ไม่ได้ (ฝั่ง web แปลเป็นข้อความ ฝั่ง API โยน 422) */
export function validateOrderCodePattern(pattern: string): OrderCodePatternIssue | null {
  if (!pattern) return 'EMPTY';
  if (pattern.length > ORDER_CODE_PATTERN_MAX_LENGTH) return 'TOO_LONG';
  const parts = splitPattern(pattern);
  if (!parts) return 'BRACKET';
  let running = 0;
  for (const part of parts) {
    if ('literal' in part) {
      if (!ORDER_CODE_LITERAL_PATTERN.test(part.literal)) return 'LITERAL_CHARSET';
      continue;
    }
    if (!(ORDER_CODE_TOKENS as readonly string[]).includes(part.token)) return 'TOKEN_UNKNOWN';
    if (part.token === 'RUNNING_ID') running += 1;
  }
  if (running === 0) return 'RUNNING_ID_MISSING';
  if (running > 1) return 'RUNNING_ID_DUPLICATED';
  return null;
}

export function validateOrderCodeSiteCode(siteCode: string): OrderCodeSiteCodeIssue | null {
  if (siteCode.length > ORDER_CODE_SITE_CODE_MAX_LENGTH) return 'TOO_LONG';
  if (!ORDER_CODE_LITERAL_PATTERN.test(siteCode)) return 'CHARSET';
  return null;
}

/**
 * ประกอบรหัสใบงาน — โยน `Error` เมื่อ pattern ใช้ไม่ได้ (ต้องถูกตรวจตอนบันทึกค่าตั้งค่าแล้ว)
 *
 * ⚠️ ไม่ตัดความยาวให้เอง — รหัสที่ถูกตัดคือรหัสผิดที่ยังชนกันได้ ให้ caller ตรวจ
 * `ORDER_CODE_MAX_LENGTH` เองตอนบันทึก pattern แทน
 */
export function renderOrderCode(context: OrderCodeContext): string {
  const issue = validateOrderCodePattern(context.pattern);
  if (issue) throw new Error(`Invalid order code pattern: ${issue}`);
  if (!Number.isInteger(context.runningId) || context.runningId < 1) {
    throw new Error('Invalid running id');
  }
  const { yyyy, yy, mm } = buddhistYearParts(context.now);
  const values: Record<OrderCodeToken, string> = {
    site_code: context.siteCode,
    YYYY: yyyy,
    YY: yy,
    MM: mm,
    RUNNING_ID: String(context.runningId),
  };
  return (splitPattern(context.pattern) ?? [])
    .map((part) => ('literal' in part ? part.literal : values[part.token]))
    .join('');
}

/**
 * ตัวอย่างรหัสที่หน้าตั้งค่าแสดงให้ดูก่อนบันทึก — คืน `null` เมื่อ pattern ยังใช้ไม่ได้
 * ใช้ตัวเดียวกับของจริงเพื่อไม่ให้ preview กับผลลัพธ์จริงเพี้ยนกัน
 */
export function previewOrderCode(context: OrderCodeContext): string | null {
  try {
    return renderOrderCode(context);
  } catch {
    return null;
  }
}

/** สิ่งที่หน้า `ตั้งค่า → รูปแบบรหัสใบงาน` อ่าน/เขียน — `REQ-SET-037`..`REQ-SET-039` */
export interface OrderCodeSettingsView extends OrderCodeFormat {
  /** เลขที่ใบงานใบถัดไปจะได้ — read-only · ตั้งค่าใหม่ได้เฉพาะค่าที่ ≥ ค่านี้ (`REQ-ORD-081`) */
  nextRunning: number;
  /** ตัวอย่างรหัสของใบงานใบถัดไปตามค่าที่บันทึกไว้จริง */
  sample: string | null;
}

export interface OrderCodeSettingsInput extends OrderCodeFormat {
  /** ไม่ส่ง = ไม่แตะเลขวิ่ง · ส่งค่าที่ต่ำกว่าเลขปัจจุบัน = ถูกปฏิเสธ */
  nextRunning?: number;
}
