import { ChatMessageType, type ChatMessageDirection } from '../enums/chat';
import type { LineChannel } from '../enums/line';
import type { LineLinkStatus, OwnerType } from '../enums/profile';

/** รายการคู่สนทนาที่ CMS เห็น — ข้อมูลตัวตนมาจาก LINE account เท่านั้น (`REQ-CHT-001`) */
export interface ChatThreadListItemView {
  id: string;
  channel: LineChannel;
  displayName: string | null;
  pictureUrl: string | null;
  lineUserId: string;
  lineLinkStatus: LineLinkStatus;
  ownerType: OwnerType | null;
  ownerId: string | null;
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
