/**
 * Multi-site (multi-tenant) — `REQ-SITE-001` · ADR-060
 *
 * ระบบ HST หนึ่งชุดให้บริการได้หลายโรงพยาบาล ("site") โดยแยกข้อมูลด้วยคอลัมน์ `site_id`
 * ทุกตารางที่เป็นข้อมูลของผู้ใช้ — ไม่ใช่การ deploy ใหม่ทีละโรงพยาบาลอีกต่อไป
 *
 * ⚠️ ไฟล์นี้คือ **ที่เดียว** ที่นิยามชื่อ header และกติกาการ normalize host
 * ห้ามพิมพ์ชื่อ header หรือเขียน `.toLowerCase().split(':')` เองในโค้ดเรียกใช้
 */

/** สถานะของ site — `REQ-SITE-002` */
export const SiteStatus = {
  /** center กำลังสร้าง/seed ข้อมูลตั้งต้นอยู่ — ยังเข้าใช้งานไม่ได้ */
  PROVISIONING: 'PROVISIONING',
  /** ใช้งานได้ตามปกติ */
  ACTIVE: 'ACTIVE',
  /** ระงับชั่วคราว — เข้าระบบไม่ได้ แต่ข้อมูลยังอยู่ครบ */
  SUSPENDED: 'SUSPENDED',
} as const;
export type SiteStatus = (typeof SiteStatus)[keyof typeof SiteStatus];

export const SITE_STATUSES = Object.values(SiteStatus) as SiteStatus[];

/**
 * header ที่ reverse proxy (nginx/cloudflare) ตั้งให้เป็นโดเมนจริงที่ผู้ใช้พิมพ์เข้ามา
 *
 * ⚠️ **ต้องให้ nginx เขียนทับเสมอ** (`proxy_set_header X-Forwarded-Host $host;`)
 * ไม่งั้นเบราว์เซอร์ปลอม header นี้เพื่อข้ามไปอ่าน site อื่นได้ — ข้อควรระวังข้อ 226
 */
export const SITE_HOST_HEADER = 'x-forwarded-host';

/**
 * header ทางลัดสำหรับ **เครือข่ายภายใน/dev เท่านั้น** (เช่น Next server→API ที่วิ่งตรงเข้า `http://api:3001`
 * ซึ่ง `Host` เป็นชื่อ container ไม่ใช่โดเมนของ site)
 *
 * ⚠️ API จะเชื่อ header นี้เฉพาะเมื่อ `SITE_TRUST_FORWARDED=true` เท่านั้น
 */
export const SITE_CODE_HEADER = 'x-hst-site';

/** site ตั้งต้นที่ข้อมูลเดิมทั้งหมดถูกย้ายไปอยู่ — `REQ-SITE-003` */
export const DEFAULT_SITE_CODE = 'uat';

/** a-z 0-9 และ `-` ยาว 2–40 — ใช้เป็นทั้งชื่อโฟลเดอร์ S3 และ subdomain ได้ */
export const SITE_CODE_PATTERN = /^[a-z0-9][a-z0-9-]{1,39}$/;

export function isValidSiteCode(code: string): boolean {
  return SITE_CODE_PATTERN.test(code);
}

/**
 * ทำ host ให้เป็นรูปเดียวกันก่อนนำไปเทียบกับ `site_domains.host`
 * — ตัด port · ตัด `.` ท้าย (FQDN แบบเต็ม) · lowercase · ตัดช่องว่าง
 * — รับค่าที่มีหลายตัวคั่นด้วย `,` (X-Forwarded-Host ผ่าน proxy หลายชั้น) โดยเอาตัวแรก
 *
 * คืน `null` เมื่อว่างหรือไม่ใช่ host ที่ใช้ได้ — ผู้เรียกต้องจัดการเองว่าจะ 404 หรือ fallback
 */
export function normalizeSiteHost(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const first = raw.split(',')[0]?.trim() ?? '';
  if (!first) return null;
  // IPv6 literal `[::1]:3000` — เก็บวงเล็บไว้ ตัดเฉพาะ port ข้างนอก
  const withoutPort = first.startsWith('[')
    ? first.slice(0, first.indexOf(']') + 1)
    : (first.split(':')[0] ?? '');
  const host = withoutPort.replace(/\.+$/, '').toLowerCase();
  return host.length > 0 && host.length <= 255 ? host : null;
}
