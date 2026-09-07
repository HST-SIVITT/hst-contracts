/**
 * ประเภทงานของ Technician — `CR-011` ข้อ 3.1 · `REQ-TEC-020` [MUST]
 *
 * ใช้กรองรายชื่อในช่อง "Technician Tele" / "Technician อ่านผล" ของฟอร์มใบงาน (`REQ-ORD-054`)
 * ⚠️ ห้ามเดาค่าเพิ่มเอง — ต้องแก้ `docs/10-domain/04-data-dictionary.md` ก่อนเสมอ
 */
export const TechnicianJobType = {
  /** ทำได้ทั้ง Tele และอ่านผล — ขึ้นในทั้งสองช่อง */
  ALL: 'ALL',
  TELE: 'TELE',
  /** อ่านผลการตรวจ */
  READING: 'READING',
} as const;
export type TechnicianJobType = (typeof TechnicianJobType)[keyof typeof TechnicianJobType];

export const TECHNICIAN_JOB_TYPES = [
  TechnicianJobType.ALL,
  TechnicianJobType.TELE,
  TechnicianJobType.READING,
] as const;

/** ค่าเริ่มต้นของ Technician ที่มีอยู่ก่อน `CR-011` — ทำได้ทุกงาน (migration `0032` ใช้ค่าเดียวกัน) */
export const TECHNICIAN_JOB_TYPE_DEFAULT: TechnicianJobType = TechnicianJobType.ALL;

/**
 * ช่างคนนี้รับงานประเภทที่ต้องการได้ไหม — `ALL` เข้าได้ทุกช่อง
 * ใช้ทั้งฝั่ง API (กรอง picker) และฝั่งเว็บ **ห้ามเขียนเงื่อนไขซ้ำ**
 */
export function technicianHandlesJobType(
  held: TechnicianJobType,
  required: TechnicianJobType,
): boolean {
  if (required === TechnicianJobType.ALL || held === TechnicianJobType.ALL) return true;
  return held === required;
}
