import { ChatMessageType, type ChatMessageDirection } from '../enums/chat';
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
}

/**
 * ข้อความชนิดนี้มีไฟล์ให้ดึงผ่าน `GET /chat/messages/:id/content` (`REQ-CHT-004`)
 * — API ใช้ตัดสินว่าจะยอม proxy ให้ไหม และ UI ใช้ตัดสินว่าจะโหลดรูปมาแสดงไหม **ต้องตรงกันเสมอ**
 */
export function hasChatMessageContent(type: ChatMessageType): boolean {
  return type === ChatMessageType.IMAGE || type === ChatMessageType.STICKER;
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
