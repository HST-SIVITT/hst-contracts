import { LiffPage } from '../enums/line';

/**
 * กลุ่มค่าตั้งค่า — FT-11 · TEC-03 §3.5 (`GET/PATCH /settings/:group`)
 * ⚠️ ค่าที่เอกสารระบุว่า "ปรับได้ในเมนูตั้งค่า" ห้าม hardcode ในโค้ดเด็ดขาด (REQ-SET-001)
 */
export const SettingGroup = {
  LINE: 'line',
  GOOGLE: 'google',
  S3: 's3',
  MAIL: 'mail',
  SECURITY: 'security',
  GENERAL: 'general',
} as const;
export type SettingGroup = (typeof SettingGroup)[keyof typeof SettingGroup];

export const SETTING_GROUPS = Object.values(SettingGroup) as readonly SettingGroup[];

/** ชนิดค่าที่เก็บใน `settings.value` (เก็บเป็น JSON string เสมอ) */
export const SettingValueType = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  JSON: 'JSON',
  /** ค่า secret — เข้ารหัส AES-GCM ก่อนเก็บ + ส่งออกแบบ masked เท่านั้น (REQ-SEC-020) */
  SECRET: 'SECRET',
} as const;
export type SettingValueType = (typeof SettingValueType)[keyof typeof SettingValueType];

/**
 * คำนำหน้าของค่า secret ที่ถูก mask ก่อนส่งออก (REQ-SEC-020)
 * ใช้ร่วมกันทั้ง server (ข้ามค่านี้ตอนเขียน) และ web (รู้ว่าค่าที่เห็นไม่ใช่ค่าจริง) — REQ-SET-014
 */
export const SECRET_MASK_PREFIX = '••••';

/** ค่าที่ถูกอ่านบ่อยจนต้องมี helper กันพิมพ์ key ผิด — DOM-04 §4.9 · REQ-SET-020 [MUST] */
export const SettingKey = {
  SECURITY_MAX_LOGIN_ATTEMPTS: 'security.maxLoginAttempts',
  SECURITY_LOCKOUT_MINUTES: 'security.lockoutMinutes',
  SECURITY_PASSWORD_POLICY: 'security.passwordPolicy',
  SECURITY_AUDIT_LOG_RETENTION_DAYS: 'security.auditLogRetentionDays',
  /** CMS ไม่มี activity เกินจำนวนนี้ให้เพิกถอน session — REQ-AUTH-011 */
  SECURITY_SESSION_IDLE_MINUTES: 'security.sessionIdleMinutes',
  /** รอบตรวจ session ของ secret page — REQ-AUTH-012 */
  SECURITY_SESSION_CHECK_INTERVAL_SECONDS: 'security.sessionCheckIntervalSeconds',
  /** อายุลิงก์/QR เชื่อมต่อ LINE (ชั่วโมง) — TEC-05 §5.5 · REQ-SEC-031 · ห้าม hardcode (REQ-SET-001) */
  SECURITY_LINE_LINK_TOKEN_TTL_HOURS: 'security.lineLinkTokenTtlHours',
  GENERAL_PAGINATION_OPTIONS: 'general.paginationOptions',
  GENERAL_DEFAULT_PER_PAGE: 'general.defaultPerPage',
  /** จำนวนไฟล์สูงสุดต่อการอัปเดตสถานะ 1 ครั้ง — REQ-ORD-030 · คำตอบ `Q-042` ข้อ 3 (T-095) */
  GENERAL_ORDER_STATUS_ATTACHMENT_MAX_FILES: 'general.orderStatusAttachmentMaxFiles',
  GOOGLE_MAPS_API_KEY: 'google.mapsApiKey',
  S3_ENDPOINT: 's3.endpoint',
  S3_REGION: 's3.region',
  S3_BUCKET: 's3.bucket',
  /** prefix กลางของ object key ใหม่ทั้งหมด — REQ-SET-022 */
  S3_UPLOAD_FOLDER: 's3.uploadFolder',
  S3_ACCESS_KEY_ID: 's3.accessKeyId',
  S3_SECRET_ACCESS_KEY: 's3.secretAccessKey',
  S3_FORCE_PATH_STYLE: 's3.forcePathStyle',
  /** ขนาดไฟล์แนบสูงสุดต่อไฟล์ (MB) — REQ-PAT-021 · ห้าม hardcode (REQ-SET-001) */
  S3_MAX_UPLOAD_SIZE_MB: 's3.maxUploadSizeMb',
  MAIL_HOST: 'mail.host',
  MAIL_PORT: 'mail.port',
  MAIL_SECURE: 'mail.secure',
  MAIL_USER: 'mail.user',
  MAIL_PASSWORD: 'mail.password',
  MAIL_FROM: 'mail.from',
} as const;
export type SettingKey = (typeof SettingKey)[keyof typeof SettingKey];

/**
 * อายุขั้นต่ำของ audit log ที่ปุ่มลบจะแตะได้ — REQ-LOG-005 · ADR-024 (คำตอบของ `Q-022`)
 * เจ้าของงานกำหนดว่า "90 วันเป็นค่าเริ่มต้น ปรับได้ในเมนูตั้งค่า แต่ห้ามต่ำกว่า 30 วัน"
 * ค่านี้เป็นเพดานล่างที่ทั้ง UI, การบันทึกค่า และตอนอ่านค่าไปใช้ ต้องบังคับเหมือนกัน
 */
export const AUDIT_LOG_RETENTION_MIN_DAYS = 30;
export const AUDIT_LOG_RETENTION_DEFAULT_DAYS = 90;
/** 10 ปี — กันพิมพ์ผิดจนปุ่มลบไม่มีวันทำงาน ไม่ใช่ข้อกำหนดจากเอกสาร */
export const AUDIT_LOG_RETENTION_MAX_DAYS = 3650;

/** ค่าเริ่มต้นของอายุลิงก์เชื่อมต่อ LINE — TEC-05 §5.5 "แนะนำ 24 ชม. ปรับได้ในตั้งค่า" */
export const LINE_LINK_TOKEN_TTL_DEFAULT_HOURS = 24;

export const SESSION_IDLE_DEFAULT_MINUTES = 30;
export const SESSION_CHECK_INTERVAL_DEFAULT_SECONDS = 60;

/**
 * ขอบเขตของค่าตั้งค่าที่เป็นตัวเลข — **แหล่งความจริงเดียว** ที่ทั้ง API และ web ใช้ร่วมกัน
 *
 * ค่าของ `auditLogRetentionDays` มาจากเจ้าของงานโดยตรง (ADR-024)
 * ส่วนอีก 3 ตัวยังเป็น assumption ที่รอคำตอบใน `Q-019` — เอกสารไม่ได้ระบุช่วงไว้
 * แต่ปล่อยว่างไม่ได้ เช่น `maxLoginAttempts = 0` จะล็อกทุกคนออกตั้งแต่ login ครั้งแรก
 */
export const SETTING_NUMBER_BOUNDS: Readonly<Record<string, { min: number; max: number }>> = {
  [SettingKey.SECURITY_MAX_LOGIN_ATTEMPTS]: { min: 1, max: 10 },
  // TEC-05 §5.5 แนะนำ 24 ชม. · ต่ำกว่า 1 ชม. ใช้งานจริงไม่ทัน · เกิน 30 วันลิงก์ที่หลุดออกไปยังใช้ได้นานเกินไป
  [SettingKey.SECURITY_LINE_LINK_TOKEN_TTL_HOURS]: { min: 1, max: 720 },
  [SettingKey.SECURITY_LOCKOUT_MINUTES]: { min: 1, max: 1440 },
  // Assumption Q-056 — ห้าม 0 เพราะจะทำให้ทุก session หมดทันที
  [SettingKey.SECURITY_SESSION_IDLE_MINUTES]: { min: 1, max: 1440 },
  // Assumption Q-056 — ถี่กว่า 10 วินาทีเพิ่มโหลด DB โดยไม่ช่วย UX อย่างมีนัยสำคัญ
  [SettingKey.SECURITY_SESSION_CHECK_INTERVAL_SECONDS]: { min: 10, max: 600 },
  [SettingKey.SECURITY_AUDIT_LOG_RETENTION_DAYS]: {
    min: AUDIT_LOG_RETENTION_MIN_DAYS,
    max: AUDIT_LOG_RETENTION_MAX_DAYS,
  },
  [SettingKey.MAIL_PORT]: { min: 1, max: 65535 },
  // เจ้าของงานตอบ `Q-042` ว่าให้ปรับได้ · เพดานบน 30 คือ ORDER_STATUS_ATTACHMENT_MAX_FILES_HARD_CAP
  [SettingKey.GENERAL_ORDER_STATUS_ATTACHMENT_MAX_FILES]: { min: 1, max: 30 },
  // เพดานบน 100 MB เป็นค่าที่ตั้งไว้ก่อน รอเจ้าของงานยืนยัน (`Q-028`)
  [SettingKey.S3_MAX_UPLOAD_SIZE_MB]: { min: 1, max: 100 },
};

/** บีบค่าให้อยู่ในช่วงที่รับได้ — ใช้ตอน "อ่าน" ค่าที่อาจถูกเขียนไว้ก่อนมีกฎนี้ */
export function clampSettingNumber(key: string, value: number, fallback: number): number {
  const bounds = SETTING_NUMBER_BOUNDS[key];
  if (!Number.isFinite(value)) return fallback;
  if (!bounds) return value;
  return Math.min(Math.max(value, bounds.min), bounds.max);
}

/** key ของ LINE ต่อ channel — เช่น lineSettingKey('PATIENT', 'channelSecret') → 'line.patient.channelSecret' */
export function lineSettingKey(
  channel: 'PATIENT' | 'RIDER' | 'TECHNICIAN',
  field: LineSettingField,
): string {
  return `line.${channel.toLowerCase()}.${field}`;
}

/**
 * ค่าที่ต้องมีต่อ channel — FT-11 §1 (REQ-SET-002)
 * ⚠️ **LIFF ID ไม่อยู่ในลิสต์นี้** เพราะแยกต่อ "หน้า" ไม่ใช่ค่าเดียวต่อ channel (FT-13 §E)
 * → ใช้ `lineLiffSettingKey()` กับ `LINE_CHANNEL_LIFF_PAGES` แทน
 */
export const LINE_SETTING_FIELDS = [
  'channelId',
  'channelSecret',
  'channelAccessToken',
  'basicId',
  'loginChannelId',
] as const;
export type LineSettingField = (typeof LINE_SETTING_FIELDS)[number];

/**
 * key ของ LIFF ID รายหน้า — `lineLiffSettingKey('RIDER', 'jobs')` → `line.rider.liff.jobs`
 * (`REQ-SET-002` · migration `0015` ย้ายค่า `line.<ch>.liffId` เดิมมาเป็น `liff.profile` ให้แล้ว)
 */
export function lineLiffSettingKey(
  channel: 'PATIENT' | 'RIDER' | 'TECHNICIAN',
  page: LiffPage,
): string {
  return `line.${channel.toLowerCase()}.liff.${page}`;
}

/** อ่านชื่อหน้าจาก key ของ LIFF — คืน `null` ถ้า key นั้นไม่ใช่ค่า LIFF */
export function liffPageOfSettingKey(key: string): LiffPage | null {
  const match = /^line\.(?:patient|rider|technician)\.liff\.(.+)$/.exec(key);
  const page = match?.[1];
  return page && (Object.values(LiffPage) as string[]).includes(page) ? (page as LiffPage) : null;
}

/** field ที่เป็น secret — ต้องเข้ารหัสและ mask (REQ-SEC-020) */
export const LINE_SECRET_FIELDS: readonly LineSettingField[] = [
  'channelSecret',
  'channelAccessToken',
];
