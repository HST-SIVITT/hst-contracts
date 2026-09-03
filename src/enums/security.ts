/**
 * ระดับความยากรหัสผ่าน — FT-01 · REQ-AUTH-005 [MUST]
 * ⚠️ ค่าปัจจุบันอ่านจากตาราง `settings` (key: security.passwordPolicy) ห้าม hardcode
 * เกณฑ์แต่ละระดับยังรอยืนยันที่ Q-009
 */
export const PasswordPolicy = {
  EASY: 'EASY',
  SECURE: 'SECURE',
  VERY_SECURE: 'VERY_SECURE',
} as const;
export type PasswordPolicy = (typeof PasswordPolicy)[keyof typeof PasswordPolicy];

/** เกณฑ์ของแต่ละระดับ — ใช้ร่วมกันทั้ง client validation และ server validation */
export interface PasswordPolicyRule {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSymbol: boolean;
}

export const PASSWORD_POLICY_RULES: Readonly<Record<PasswordPolicy, PasswordPolicyRule>> = {
  EASY: {
    minLength: 6,
    requireUppercase: false,
    requireLowercase: false,
    requireDigit: false,
    requireSymbol: false,
  },
  SECURE: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: false,
    requireDigit: true,
    requireSymbol: false,
  },
  VERY_SECURE: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSymbol: true,
  },
} as const;

/**
 * ขอบเขตของ DB-backed rate limit ที่ `/auth/*` — DOM-04 §4.1b · REQ-SEC-005
 *
 * `LOGIN` เพิ่มตอน `T-092`: account lockout (`REQ-AUTH-004`) จำกัดได้แค่ "ต่อบัญชี"
 * ผู้โจมตีที่ลองรหัสผ่านเดียวกันไล่ไปทีละ username จึงไม่มีบัญชีไหนถูกล็อกเลย (password spraying)
 * เพดานต่อ IP คือชั้นเดียวที่กันเคสนี้ได้ — ดู `AUTH_RATE_LIMIT_RULES` ฝั่ง API
 *
 * ⚠️ คอลัมน์ `auth_rate_limit_events.scope` เป็น `varchar(40)` ไม่ใช่ MySQL ENUM
 * → เพิ่มค่าใหม่ที่นี่ **ไม่ต้องมี migration**
 */
export const AuthRateLimitScope = {
  LOGIN: 'LOGIN',
  FORGOT_PASSWORD_REQUEST: 'FORGOT_PASSWORD_REQUEST',
  FORGOT_PASSWORD_RESET: 'FORGOT_PASSWORD_RESET',
} as const;
export type AuthRateLimitScope =
  (typeof AuthRateLimitScope)[keyof typeof AuthRateLimitScope];
