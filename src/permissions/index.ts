/**
 * RBAC — DOM-03
 * เพิ่มเมนูใหม่ในอนาคต → ต้องเพิ่ม key ที่นี่ และที่ docs/10-domain/03-permissions-matrix.md §3.2
 * กลุ่ม root admin ได้สิทธิ์เต็มอัตโนมัติผ่าน flag `isSuperAdmin` ไม่ใช่ permission rows (REQ-GRP-011)
 */
export const PermissionSubject = {
  DASHBOARD: 'dashboard',
  SERVICE_REQUESTS: 'service_requests',
  ORDERS: 'orders',
  PATIENTS: 'patients',
  TECHNICIANS: 'technicians',
  RIDERS: 'riders',
  EQUIPMENTS: 'equipments',
  CHAT: 'chat',
  SYSTEM_USERS: 'system_users',
  USER_GROUPS: 'user_groups',
  AUDIT_LOGS: 'audit_logs',
  SETTINGS: 'settings',
} as const;
export type PermissionSubject = (typeof PermissionSubject)[keyof typeof PermissionSubject];

export const PERMISSION_SUBJECTS = Object.values(PermissionSubject) as readonly PermissionSubject[];

/** ระดับสิทธิ์ต่อเมนู — DOM-03 §3.1 · REQ-GRP-010 [MUST] */
export const PermissionLevel = {
  NONE: 'NONE',
  READ_ONLY: 'READ_ONLY',
  MAINTAIN: 'MAINTAIN',
} as const;
export type PermissionLevel = (typeof PermissionLevel)[keyof typeof PermissionLevel];

const LEVEL_RANK: Record<PermissionLevel, number> = { NONE: 0, READ_ONLY: 1, MAINTAIN: 2 };

/** เทียบว่าสิทธิ์ที่มีถึงระดับที่ต้องการหรือยัง — ใช้ทั้ง API guard และการซ่อนปุ่มฝั่ง UI */
export function satisfiesLevel(held: PermissionLevel, required: PermissionLevel): boolean {
  return LEVEL_RANK[held] >= LEVEL_RANK[required];
}

export type PermissionMap = Partial<Record<PermissionSubject, PermissionLevel>>;
