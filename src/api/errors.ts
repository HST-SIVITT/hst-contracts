/** Error code ที่ต้องมี — TEC-03 §3.6 */
export const ErrorCode = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  AUTH_MUST_CHANGE_PASSWORD: 'AUTH_MUST_CHANGE_PASSWORD',
  AUTH_WEAK_PASSWORD: 'AUTH_WEAK_PASSWORD',
  /** OTP ไม่ถูกต้อง หมดอายุ ถูกใช้แล้ว หรือถูกยกเลิก — ใช้ข้อความกลางเดียวกัน (REQ-SEC-006) */
  AUTH_INVALID_OTP: 'AUTH_INVALID_OTP',
  /** public auth endpoint ถูกจำกัดตาม IP/username (REQ-SEC-004/005) */
  AUTH_RATE_LIMITED: 'AUTH_RATE_LIMITED',
  FORBIDDEN_NO_PERMISSION: 'FORBIDDEN_NO_PERMISSION',
  FORBIDDEN_NOT_ASSIGNED: 'FORBIDDEN_NOT_ASSIGNED',
  ORDER_INVALID_TRANSITION: 'ORDER_INVALID_TRANSITION',
  ORDER_CANCEL_NOTE_REQUIRED: 'ORDER_CANCEL_NOTE_REQUIRED',
  /** ใบงานที่จบแล้ว (COMPLETED/CANCELLED) แก้ไขไม่ได้ — FT-09 §B · T-054 */
  ORDER_NOT_EDITABLE: 'ORDER_NOT_EDITABLE',
  /** ใบงานที่ "เสร็จสิ้น" แล้วลบไม่ได้ — Q-043 หมายเหตุเจ้าของงาน · T-052 (ยกเลิกแล้วยังลบได้) */
  ORDER_NOT_DELETABLE: 'ORDER_NOT_DELETABLE',
  ASSIGNEE_NOT_AVAILABLE: 'ASSIGNEE_NOT_AVAILABLE',
  POSITION_IN_USE: 'POSITION_IN_USE',
  USER_GROUP_IN_USE: 'USER_GROUP_IN_USE',
  ROOT_USER_IMMUTABLE: 'ROOT_USER_IMMUTABLE',
  ROOT_GROUP_IMMUTABLE: 'ROOT_GROUP_IMMUTABLE',
  LINE_ALREADY_LINKED: 'LINE_ALREADY_LINKED',
  /** LINE webhook ไม่มี/ใช้ลายเซ็นที่ไม่ตรงกับ raw request body (REQ-SEC-027) */
  LINE_SIGNATURE_INVALID: 'LINE_SIGNATURE_INVALID',
  /** LINE Login ปฏิเสธ ID token หรือ token ไม่ตรงกับ channel ที่เรียก (REQ-SEC-030) */
  LINE_ID_TOKEN_INVALID: 'LINE_ID_TOKEN_INVALID',
  /** LINE Login verify endpoint ติดต่อไม่ได้/จำกัดคำขอ — แยกจาก token ผิดเพื่อให้ client retry ได้ */
  LINE_VERIFY_UNAVAILABLE: 'LINE_VERIFY_UNAVAILABLE',
  /** Messaging API ปฏิเสธ/ติดต่อไม่ได้ — ไม่ส่งรายละเอียด upstream ที่อาจมี credential ออกไป */
  LINE_MESSAGE_SEND_FAILED: 'LINE_MESSAGE_SEND_FAILED',
  /** ไม่มี template หรือข้อมูล template ผิดรูปแบบ — ป้องกัน fallback ไป hardcode ในโค้ด */
  MESSAGE_TEMPLATE_NOT_CONFIGURED: 'MESSAGE_TEMPLATE_NOT_CONFIGURED',
  /** ยังไม่ได้กรอก Channel Secret ของ OA ช่องทางนั้นในเมนูตั้งค่า */
  LINE_CHANNEL_NOT_CONFIGURED: 'LINE_CHANNEL_NOT_CONFIGURED',
  SERVICE_REQUEST_ALREADY_PROCESSED: 'SERVICE_REQUEST_ALREADY_PROCESSED',
  LINE_LINK_TOKEN_EXPIRED: 'LINE_LINK_TOKEN_EXPIRED',
  EQUIPMENT_ALREADY_RESERVED: 'EQUIPMENT_ALREADY_RESERVED',
  EQUIPMENT_NOT_AVAILABLE: 'EQUIPMENT_NOT_AVAILABLE',
  EQUIPMENT_IN_USE: 'EQUIPMENT_IN_USE',
  EQUIPMENT_MODEL_IN_USE: 'EQUIPMENT_MODEL_IN_USE',
  /** ยังไม่ได้ตั้งค่า SMTP ในเมนูตั้งค่า → ส่งเมลจริงไม่ได้ (REQ-SET-012) */
  MAIL_NOT_CONFIGURED: 'MAIL_NOT_CONFIGURED',
  /** ตั้งค่าแล้วแต่ SMTP server ปฏิเสธ/ติดต่อไม่ได้ — รายละเอียดอยู่ใน log ฝั่ง server เท่านั้น */
  MAIL_SEND_FAILED: 'MAIL_SEND_FAILED',
  /** ยังไม่ได้ตั้งค่า S3 ในเมนูตั้งค่า → เก็บไฟล์จริงไม่ได้ (REQ-NFR-004 · REQ-SET-006) */
  STORAGE_NOT_CONFIGURED: 'STORAGE_NOT_CONFIGURED',
  /** ตั้งค่าแล้วแต่ S3 ปฏิเสธ/ติดต่อไม่ได้ — รายละเอียดอยู่ใน log ฝั่ง server เท่านั้น */
  STORAGE_WRITE_FAILED: 'STORAGE_WRITE_FAILED',
  /** ไฟล์ใหญ่เกิน `s3.maxUploadSizeMb` — `details.maxMb` บอกเพดานที่ตั้งไว้ */
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  /** ชนิดไฟล์ไม่อยู่ใน `ATTACHMENT_ACCEPTED_MIME` ของช่องนั้น — `details.accepted` บอกชนิดที่รับได้ */
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  /** รหัสประจำตัวไรเดอร์/Technician ซ้ำกับคนอื่น — REQ-ORD-013 · Q-038 (T-094) */
  STAFF_CODE_DUPLICATE: 'STAFF_CODE_DUPLICATE',
  /** ใช้กับ validation error ทั่วไปที่ไม่มี code เฉพาะ */
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** i18n key ของแต่ละ error code — frontend แปลผ่าน key นี้ (TEC-03 §3.2) */
export function errorMessageKey(code: ErrorCode): string {
  return `error.${code}`;
}
