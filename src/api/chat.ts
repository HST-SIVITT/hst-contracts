import { ChatMessageType, type ChatMessageDirection, type ChatThreadState } from '../enums/chat';
import type { LineChannel } from '../enums/line';
import type { LineLinkStatus, OwnerType } from '../enums/profile';

/** รายการคู่สนทนาที่ CMS เห็น — ข้อมูลตัวตนมาจาก LINE account เท่านั้น (`REQ-CHT-001`) */
export interface ChatThreadListItemView {
  id: string;
  channel: LineChannel;
  displayName: string | null;
  pictureUrl: string | null;
  lineUserId: string | null;
  lineLinkStatus: LineLinkStatus;
  ownerType: OwnerType | null;
  ownerId: string | null;
  /** ชื่อจริงจาก profile ที่ผูกแล้ว — ไม่ใช่ชื่อ LINE display name */
  ownerNameTh: string | null;
  ownerNameEn: string | null;
  unreadCount: number;
  lastMessageAt: string | null;
  /** ข้อความล่าสุดแบบตัวอักษร — มีค่าเฉพาะข้อความชนิด `TEXT` เท่านั้น */
  lastMessagePreview: string | null;
  /**
   * ชนิดของข้อความล่าสุด — UI ใช้แปลคำว่า "รูปภาพ"/"สติกเกอร์" เอง
   * (ห้ามให้ API เขียนคำไทยลง `lastMessagePreview` เพราะผู้ใช้ภาษาอังกฤษจะเห็นคำไทย · `REQ-INF-002`)
   */
  lastMessageType: ChatMessageType | null;
  /**
   * `CR-043` · `REQ-CHT-016/017` — สถานะการแสดงในรายชื่อของ channel นี้
   * รายการปกติเป็น `ACTIVE` เสมอ · ค่าอื่นโผล่เฉพาะใน popup จัดการรายชื่อ (`REQ-CHT-019`)
   */
  state: ChatThreadState;
  /** เวลาที่ถูกซ่อน/ถูกบล็อค — ใช้เรียงใน popup และบอกผู้ใช้ว่าทำไปเมื่อไหร่ */
  hiddenAt: string | null;
  blockedAt: string | null;
}

/**
 * ข้อความชนิดนี้มีไฟล์ให้ดึงผ่าน `GET /chat/messages/:id/content` (`REQ-CHT-004`)
 * — API ใช้ตัดสินว่าจะยอม proxy ให้ไหม และ UI ใช้ตัดสินว่าจะโหลดรูปมาแสดงไหม **ต้องตรงกันเสมอ**
 */
export function hasChatMessageContent(type: ChatMessageType): boolean {
  return (
    type === ChatMessageType.IMAGE ||
    type === ChatMessageType.STICKER ||
    // `CR-043` · `REQ-CHT-020` — ไฟล์ที่ CMS ส่งออกอยู่บนที่เก็บไฟล์ของระบบ ไม่ใช่ที่ LINE
    type === ChatMessageType.FILE
  );
}

/**
 * `CR-043` · `REQ-CHT-020` — ชนิดไฟล์ที่ LINE รับเป็น **image message** ได้จริง
 *
 * ⚠️ LINE รับแค่ JPEG/PNG · `image/webp` ส่งไปแล้วผู้ใช้จะเห็นช่องรูปเสียในแอป LINE
 *    ชนิดอื่นที่ระบบยอมให้อัปโหลดจึงถูกส่งเป็น "ข้อความ + ลิงก์ดาวน์โหลด" แทน
 */
export const LINE_IMAGE_MESSAGE_MIME: readonly string[] = ['image/jpeg', 'image/png'];

/** ไฟล์นี้ส่งเป็น image message ของ LINE ได้ไหม — API และ UI ต้องตัดสินด้วยตัวเดียวกัน */
export function sendsAsLineImage(mime: string): boolean {
  return LINE_IMAGE_MESSAGE_MIME.includes(mime);
}

/**
 * payload ของข้อความ OUTBOUND ที่มีไฟล์แนบ (`REQ-CHT-020`)
 * — UI อ่าน `attachmentId` ไปขอไฟล์ที่ `GET /chat/messages/:id/content` เหมือนรูปขา INBOUND
 */
export interface ChatOutboundFilePayload {
  attachmentId: string;
  originalName: string;
  mime: string;
  size: number;
}

/** อ่าน payload ไฟล์แนบออกจากข้อความแบบปลอดภัย — คืน `null` เมื่อข้อความนี้ไม่มีไฟล์ของระบบ */
export function chatOutboundFileOf(
  payload: Record<string, unknown> | null,
): ChatOutboundFilePayload | null {
  const id = payload?.attachmentId;
  if (typeof id !== 'string' || !id) return null;
  return {
    attachmentId: id,
    originalName: typeof payload?.originalName === 'string' ? payload.originalName : '',
    mime: typeof payload?.mime === 'string' ? payload.mime : '',
    size: typeof payload?.size === 'number' ? payload.size : 0,
  };
}

export interface ChatMessageView {
  id: string;
  threadId: string;
  direction: ChatMessageDirection;
  messageType: ChatMessageType;
  body: string | null;
  payload: Record<string, unknown> | null;
  sentAt: string;
}

export interface ChatThreadView extends ChatThreadListItemView {
  messages: ChatMessageView[];
}

/**
 * payload ของ `GET /chat/updates` (SSE) — `REQ-CHT-010` · `REQ-CHT-011`
 *
 * - `revision` เปลี่ยนเมื่อมีข้อความใหม่ **ในช่องทางที่สตรีมนี้กรองไว้** → หน้าเว็บ refresh
 * - `unread` เป็นยอดค้างอ่าน **ของทุกช่องทาง** ไม่ใช่แค่ช่องทางที่กรอง เพราะผู้ใช้ที่เปิดแท็บ
 *   "คนไข้" อยู่ ต้องรู้ด้วยว่ามีข้อความใหม่เข้าช่องทาง "ไรเดอร์" (`REQ-CHT-011`)
 *   ช่องทางที่ยังไม่มีคู่สนทนาเลยจะไม่มีคีย์ — ผู้อ่านต้องถือว่าเป็น 0
 */
export interface ChatUpdateEvent {
  revision: string;
  unread: Partial<Record<LineChannel, number>>;
}

/** ตัวเลือก profile ที่ยังไม่ผูก LINE และอยู่ใน channel เดียวกับ thread (`REQ-CHT-007`) */
export interface ChatLineLinkCandidateView {
  id: string;
  nameTh: string;
  nameEn: string;
  /** Patient = HN, Rider/Technician = staff code; ไม่มีค่าให้เป็น null */
  referenceCode: string | null;
  phone: string;
}

export interface ChatLineConnectCardResult {
  sent: true;
  ownerType: OwnerType;
  ownerId: string;
}

/** ผลของการซ่อน/บล็อค/ปลด 1 คู่สนทนา (`REQ-CHT-016/017`) */
export interface ChatThreadStateResult {
  id: string;
  state: ChatThreadState;
  hiddenAt: string | null;
  blockedAt: string | null;
}

/** ผลของการลบประวัติการสนทนาเฉพาะราย (`REQ-CHT-018`) */
export interface ChatThreadHistoryClearedResult {
  id: string;
  /** จำนวนข้อความที่ถูกลบจริง — ใช้บอกผู้ใช้ใน toast ว่าล้างไปกี่ข้อความ */
  deletedMessages: number;
}
