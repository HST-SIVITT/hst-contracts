import type { LiffPage, LineChannel } from '../enums/line';
import type { LineLinkStatus, OwnerType, ServiceRequestStatus } from '../enums/profile';

/** ตัวตนจาก LINE ID token หลัง server verify กับ LINE แล้วเท่านั้น (REQ-SEC-030) */
export interface VerifiedLineIdentity {
  channel: LineChannel;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
}

/**
 * ผลของหน้า LIFF "เชื่อมต่อบัญชี" (REQ-SRQ-005 · REQ-SRQ-012 · F01.4)
 * client แสดงผลจาก `outcome` เท่านั้น ห้ามตัดสินจาก `serviceRequestStatus` เอง
 * — CONNECTED ครอบคลุมทั้งคำร้องที่เพิ่งสร้าง คำร้องที่ยังรออยู่ และที่ admin อนุมัติแล้ว
 */
export const LiffLinkOutcome = {
  CONNECTED: 'CONNECTED',
  REJECTED: 'REJECTED',
} as const;
export type LiffLinkOutcome = (typeof LiffLinkOutcome)[keyof typeof LiffLinkOutcome];

/** payload ที่หน้า LIFF เชื่อมต่อบัญชีได้รับกลับ — ไม่มี token/secret ใด ๆ อยู่ในนี้ */
export interface LiffLinkAccountResult {
  outcome: LiffLinkOutcome;
  /** สถานะคำร้องล่าสุดของ LINE account นี้ (ที่เดียวที่เก็บสถานะคำร้อง — Q-046) */
  serviceRequestStatus: ServiceRequestStatus;
  /** true เฉพาะรอบที่สร้างคำร้องใหม่จริง — รอบถัด ๆ ไปเป็น false (REQ-SRQ-012) */
  created: boolean;
  displayName: string | null;
  pictureUrl: string | null;
  /** สถานะการผูกกับ profile ในระบบ — ผูกจริงเมื่อ admin กด Accept/Link Profile (T-045) */
  linkStatus: LineLinkStatus;
}

/**
 * ค่าที่หน้า LIFF ต้องรู้ "ก่อน" จะ init SDK ได้ — จึงเป็น endpoint สาธารณะที่ยังไม่มี ID token
 * มีแค่ LIFF ID ซึ่งเปิดเผยอยู่แล้วใน URL `https://liff.line.me/<liffId>` — ห้ามใส่ค่าอื่นเพิ่ม
 */
export interface LiffPageConfig {
  channel: LineChannel;
  page: LiffPage;
  liffId: string;
}

/**
 * คำร้องขอใช้บริการที่ฝั่ง CMS เห็น — FT-05 · REQ-SRQ-020
 * ข้อมูล LINE (ชื่อ/รูป/user id) อยู่ใน `line_accounts` แต่ list ของเมนูนี้ต้องแสดงคู่กันเสมอ
 */
export interface ServiceRequestListItemView {
  id: string;
  status: ServiceRequestStatus;
  channel: LineChannel;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  linkStatus: LineLinkStatus;
  ownerType: OwnerType | null;
  ownerId: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface ServiceRequestView extends ServiceRequestListItemView {
  linkedAt: string | null;
}

/**
 * ลิงก์/QR เชื่อมต่อบัญชี LINE รายบุคคล — REQ-PAT-011 · REQ-TEC-005 · REQ-RDR-005 · REQ-SEC-031
 * `token` ถูกส่งกลับ **ครั้งเดียวตอนสร้าง** เท่านั้น (ฝั่ง server เก็บเฉพาะ hash)
 * `url` เป็น null เมื่อยังไม่ได้กรอก LIFF ID ของหน้าเชื่อมต่อใน channel นั้น — UI ต้องบอกให้ไปตั้งค่า
 */
export interface LineLinkTokenView {
  token: string;
  url: string | null;
  channel: LineChannel;
  ownerType: OwnerType;
  ownerId: string;
  expiresAt: string;
}

/** query param ที่แนบไปกับลิงก์เชื่อมต่อ — หน้า LIFF อ่านค่านี้แล้วส่งกลับมาที่ API */
export const LINE_LINK_TOKEN_PARAM = 'linkToken';
