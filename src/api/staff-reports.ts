import { AssigneeType, AssignmentRole, OrderStatus } from '../enums/order';
import { decimalHundredths, hundredthsDecimal } from './rider-reports';

/**
 * รายงานค่าตอบแทนที่คิด **ต่อเคส** — `CR-035` · `REQ-RPT-013`..`REQ-RPT-020`
 *
 * ต่างจากรายงานไรเดอร์ (`rider-reports.ts`) ที่คิดจากระยะทาง: ที่นี่ 1 เคส = 1 จำนวนเงินคงที่
 * ของ "คนที่ถูก assign ขานั้น" จึง **ไม่มีตารางเรทกลาง** — เรทอยู่ที่ตัวบุคคล (`REQ-TEC-023` · `REQ-DVM-009`)
 *
 * ใช้ร่างเดียวกันทั้ง Technician (2 ขา) และ Device Manager (1 ขา) เพื่อไม่ให้มีการรวมเงิน
 * เขียนซ้ำสองชุด (บทเรียนเดียวกับ `reportTotals` ของไรเดอร์ — ข้อควรระวังข้อ 220)
 *
 * ⚠️ ไม่มี enum ใหม่ในไฟล์นี้ — "ขา" ใช้ `AssignmentRole` ที่มีอยู่ และ "ชนิดรายงาน"
 *    ใช้ `AssigneeType` ที่มีอยู่ (`CR-035` ข้อ 5)
 */

/** ขาที่รายงาน Technician จ่าย — Tele กับ อ่านผล เป็นคนละคนได้ (`REQ-RPT-017`) */
export type TechnicianPayoutLeg =
  | typeof AssignmentRole.TECHNICIAN
  | typeof AssignmentRole.TECHNICIAN_READER;
/** ขาที่รายงาน Device Manager จ่าย — ทำความสะอาดอุปกรณ์ของเคสที่ปฏิบัติการจบแล้ว */
export type DeviceManagerPayoutLeg = typeof AssignmentRole.DEVICE_MANAGER;
export type StaffPayoutLeg = TechnicianPayoutLeg | DeviceManagerPayoutLeg;

export const STAFF_PAYOUT_LEGS: readonly StaffPayoutLeg[] = [
  AssignmentRole.TECHNICIAN,
  AssignmentRole.TECHNICIAN_READER,
  AssignmentRole.DEVICE_MANAGER,
];

/** ชนิดรายงาน — ใช้ค่าเดียวกับ `AssigneeType` ที่ `order_assignments.assignee_type` เก็บอยู่แล้ว */
export type StaffReportKind =
  | typeof AssigneeType.TECHNICIAN
  | typeof AssigneeType.DEVICE_MANAGER;

export const STAFF_REPORT_KINDS: readonly StaffReportKind[] = [
  AssigneeType.TECHNICIAN,
  AssigneeType.DEVICE_MANAGER,
];

/** ขาที่รายงานชนิดนั้นแสดง — **ที่เดียว** ที่ผูกชนิดรายงานกับบทบาท ห้าม hardcode ที่หน้าเว็บ */
export function staffReportLegs(kind: StaffReportKind): readonly StaffPayoutLeg[] {
  return kind === AssigneeType.TECHNICIAN
    ? [AssignmentRole.TECHNICIAN, AssignmentRole.TECHNICIAN_READER]
    : [AssignmentRole.DEVICE_MANAGER];
}

/**
 * ปัญหาของข้อมูลที่ทำให้ยัง "เบิกไม่ได้" — แถวที่มี issue ใด ๆ ต้องได้ `amount = null`
 * (ห้ามเดาเงินแทนคน · กติกาเดียวกับ `RiderReportIssue`)
 */
export type StaffPayoutIssue =
  | 'MISSING_ASSIGNEE'
  | 'UNVERIFIED_ASSIGNEE'
  | 'MISSING_RATE'
  | 'UNCOMPLETED_CASE';

export interface StaffPayoutRow {
  orderId: string;
  orderCode: string;
  appointmentDate: string;
  orderStatus: OrderStatus;
  /** เวลาที่ขานั้นถือว่าเสร็จ — `null` เมื่อยังไม่เสร็จ */
  completedAt: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  patientName: string | null;
  /** รหัสเครื่องที่ใช้ในเคสนี้ — Device Manager ใช้ตรวจว่าทำความสะอาดเครื่องไหน */
  equipmentCode: string | null;
  leg: StaffPayoutLeg;
  /** ค่าตอบแทนต่อเคสของ **คนที่ถูก assign ขานี้** — `null` เมื่อยังไม่ได้ตั้งค่า */
  feePerCase: string | null;
  amount: string | null;
  issues: StaffPayoutIssue[];
}

export interface StaffPayoutLegTotals {
  count: number;
  amount: string;
}

export interface StaffPayoutTotals {
  /** จำนวนแถวที่แสดง (รวมแถวที่ยังเบิกไม่ได้) — ไม่ใช่จำนวนที่จ่าย (ข้อควรระวังข้อ 224) */
  caseCount: number;
  /** แถวที่จ่ายได้จริงแล้ว */
  payableCount: number;
  pendingCount: number;
  totalAmount: string;
  /** มีครบทุกขาเสมอ (ขาที่รายงานนั้นไม่ใช้จะเป็น 0) เพื่อให้ type ไม่ต้องเป็น partial */
  legs: Record<StaffPayoutLeg, StaffPayoutLegTotals>;
}

export interface StaffPayoutSummary extends StaffPayoutTotals {
  assigneeId: string | null;
  assigneeName: string | null;
}

export interface StaffPayoutReport {
  kind: StaffReportKind;
  month: string;
  generatedAt: string;
  rows: StaffPayoutRow[];
  summaries: StaffPayoutSummary[];
  totals: StaffPayoutTotals;
  /** รายชื่อสำหรับ dropdown — รวมคนที่ถูกลบแล้วด้วย เพื่อให้รายงานย้อนหลังยังอ่านชื่อได้ */
  staff: { id: string; name: string }[];
}

/** รูปแบบค่าตอบแทนต่อเคสที่ยอมรับ — เดียวกับเรทไรเดอร์ (`DECIMAL(8,2)` ไม่ติดลบ) */
export const STAFF_FEE_PATTERN = /^\d{1,6}(?:\.\d{1,2})?$/;

/**
 * `REQ-RPT-019` — ยอดรวมชุดเดียวที่ API · ตัวกรองบนหน้าเว็บ · ใบพิมพ์ ใช้ร่วมกัน
 * รวมด้วย BigInt สตางค์ **ห้ามแปลงเป็น float** และ **ข้ามใบงานที่ยกเลิก** ทั้งเงินและจำนวนที่จ่าย
 */
export function staffPayoutTotals(rows: StaffPayoutRow[]): StaffPayoutTotals {
  const legs = Object.fromEntries(
    STAFF_PAYOUT_LEGS.map((leg) => [leg, { count: 0, cents: 0n }]),
  ) as Record<StaffPayoutLeg, { count: number; cents: bigint }>;
  let total = 0n;
  let caseCount = 0;
  let payableCount = 0;
  let pendingCount = 0;
  for (const row of rows) {
    caseCount += 1;
    legs[row.leg].count += 1;
    // `REQ-RPT-020` — ใบงานที่ยกเลิกไม่เข้ายอดเลย แม้ค่าเก่าจะค้างอยู่ในแถว
    if (row.orderStatus === OrderStatus.CANCELLED) continue;
    if (row.issues.length) pendingCount += 1;
    if (row.amount !== null) {
      const cents = decimalHundredths(row.amount);
      legs[row.leg].cents += cents;
      total += cents;
      payableCount += 1;
    }
  }
  return {
    caseCount,
    payableCount,
    pendingCount,
    totalAmount: hundredthsDecimal(total),
    legs: Object.fromEntries(
      STAFF_PAYOUT_LEGS.map((leg) => [
        leg,
        { count: legs[leg].count, amount: hundredthsDecimal(legs[leg].cents) },
      ]),
    ) as Record<StaffPayoutLeg, StaffPayoutLegTotals>,
  };
}

/**
 * `REQ-RPT-016` — เงินของ 1 เคส = เรทต่อเคสของคนนั้นตรง ๆ (ไม่คูณระยะ)
 * มีแต่แถวที่ไม่เหลือ issue เท่านั้นที่ได้ตัวเลข · ใบงานยกเลิกบังคับเป็น 0 และล้าง issue
 */
export function priceStaffPayoutRow(row: StaffPayoutRow): StaffPayoutRow {
  if (row.orderStatus === OrderStatus.CANCELLED) {
    return { ...row, amount: '0.00', issues: [] };
  }
  return {
    ...row,
    amount:
      !row.issues.length && row.feePerCase !== null
        ? hundredthsDecimal(decimalHundredths(row.feePerCase))
        : null,
  };
}
