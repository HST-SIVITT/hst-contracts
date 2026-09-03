/** การกระทำที่บันทึกลง audit log — DOM-04 §4.7 · REQ-LOG-001 [MUST] */
export const AuditAction = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  LINK_LINE: 'LINK_LINE',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  EXPORT: 'EXPORT',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
