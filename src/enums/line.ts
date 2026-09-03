/**
 * LINE OA 3 channel — TEC-05 · แยกขาดจากกัน (credential / LIFF ID / rich menu คนละชุด)
 * ค่าใน enum นี้ใช้เป็น path param ของ webhook ด้วย: /api/v1/webhooks/line/:channel (ตัวพิมพ์เล็ก)
 */
export const LineChannel = {
  PATIENT: 'PATIENT',
  RIDER: 'RIDER',
  TECHNICIAN: 'TECHNICIAN',
} as const;
export type LineChannel = (typeof LineChannel)[keyof typeof LineChannel];

export const LINE_CHANNELS = [
  LineChannel.PATIENT,
  LineChannel.RIDER,
  LineChannel.TECHNICIAN,
] as const;

/** key ข้อความอัตโนมัติที่ implement แล้ว — เพิ่มตาม F03 ทีละงาน ห้ามพิมพ์ string ซ้ำใน service */
export const MessageTemplateKey = {
  PATIENT_WELCOME: 'patient.welcome',
  /** F03 · REQ-SRQ-006 — OA ยืนยันว่าได้รับคำขอเริ่มต้นใช้งาน (ส่งในนาม OA ไม่ใช่ในนามคนไข้ · Q-011) */
  PATIENT_START_ACKNOWLEDGED: 'patient.startAcknowledged',
  /** F03 · REQ-SRQ-007 — ขอให้รอ admin ทำประวัติ ส่งต่อทันทีหลังสร้างคำร้อง */
  PATIENT_WAITING_ADMIN: 'patient.waitingAdmin',
  /** F03 · REQ-SRQ-012 — เคยถูก Reject แล้วกด "เริ่มใช้งาน" ซ้ำ */
  PATIENT_LINK_FAILED: 'patient.linkFailed',
  /** F03 · REQ-ORD-002 — Flex "แจ้งเตือน Tele" ส่งถึงคนไข้และ Technician (T-060) */
  APPOINTMENT_TELE: 'appointment.tele',
  /** F03 · REQ-ORD-003 — Flex "แจ้งงาน Rider" พร้อมปุ่มรับงาน/ยกเลิก (T-061) */
  JOB_NEW_RIDER: 'job.newRider',
  /** F03 · REQ-DOM-012 — แจ้ง Technician เมื่อถูก assign งาน/นัดหมาย */
  TECHNICIAN_NEW_JOB: 'technician.newJob',
} as const;
export type MessageTemplateKey = (typeof MessageTemplateKey)[keyof typeof MessageTemplateKey];

/** แปลง path param เป็น channel กลาง โดยรับตัวพิมพ์เล็ก/ใหญ่และปฏิเสธค่าอื่น */
export function lineChannelFromPath(value: string): LineChannel | null {
  return (
    LINE_CHANNELS.find((channel) => channel.toLowerCase() === value.trim().toLowerCase()) ?? null
  );
}

/**
 * path ของ webhook ต่อ channel (ต่อท้าย base URL ของ API) — TEC-05 §5.3 · REQ-LIF-040
 * หน้าตั้งค่าเอาไปประกอบเป็น URL เต็มให้ผู้ดูแลระบบ copy ไปใส่ใน LINE Developer Console (REQ-SET-004)
 */
export function lineWebhookPath(channel: LineChannel): string {
  return `/webhooks/line/${channel.toLowerCase()}`;
}

/** path ฝั่งเว็บของ LIFF แต่ละหน้า — T-096 คู่มือและ Phase 5 ต้องอ้างตัวเดียวกัน */
export function liffEndpointPath(channel: LineChannel, page: LiffPage): string {
  return `/liff/${channel.toLowerCase()}/${page}`;
}

/** URL ตั้งต้นของ LIFF — ต่อด้วย LIFF ID จะได้ link ที่ใช้ใน rich menu ได้เลย (REQ-SET-004) */
export const LIFF_URL_PREFIX = 'https://liff.line.me/';

/**
 * หน้า LIFF ที่ระบบมี — `REQ-SET-002` · FT-13 §E "LIFF ID แยกต่อ channel และ**อาจแยกต่อหน้า**"
 * ค่าที่นี่คือส่วนท้ายของ setting key: `line.<channel>.liff.<page>`
 */
export const LiffPage = {
  /** rich menu ปุ่ม 1 ของทุก channel — REQ-LIF-001 / 010 / 030 */
  PROFILE: 'profile',
  /** rich menu ปุ่ม 2 ของ Rider/Technician — REQ-LIF-011 / 031 */
  JOBS: 'jobs',
  /** หน้าเชื่อมต่อ account (เปิดจาก QR/link ไม่ใช่ rich menu) — REQ-SEC-031 · T-044 · T-046 */
  LINK: 'link',
} as const;
export type LiffPage = (typeof LiffPage)[keyof typeof LiffPage];

/**
 * หน้า LIFF ที่แต่ละ channel ต้องมี LIFF ID ของตัวเอง — FT-13 §A/B/C
 * คนไข้ไม่มีหน้า list งาน (ต้นฉบับให้ rich menu คนไข้ปุ่มเดียว)
 */
export const LINE_CHANNEL_LIFF_PAGES: Readonly<Record<LineChannel, readonly LiffPage[]>> = {
  [LineChannel.PATIENT]: [LiffPage.PROFILE, LiffPage.LINK],
  [LineChannel.RIDER]: [LiffPage.PROFILE, LiffPage.JOBS, LiffPage.LINK],
  [LineChannel.TECHNICIAN]: [LiffPage.PROFILE, LiffPage.JOBS, LiffPage.LINK],
};

/**
 * ปุ่มของ rich menu **เรียงตามลำดับปุ่ม** — TEC-05 §5.6
 * หน้าตั้งค่าต้องแสดง link ของทุกปุ่มให้ copy ไปตั้งใน LINE Developer Console (`REQ-SET-004`)
 * `LINK` ไม่อยู่ที่นี่โดยตั้งใจ — เข้าผ่าน QR/link ที่ออกให้รายบุคคล ไม่ใช่ปุ่มบน rich menu
 */
export const LINE_CHANNEL_RICH_MENU: Readonly<Record<LineChannel, readonly LiffPage[]>> = {
  [LineChannel.PATIENT]: [LiffPage.PROFILE],
  [LineChannel.RIDER]: [LiffPage.PROFILE, LiffPage.JOBS],
  [LineChannel.TECHNICIAN]: [LiffPage.PROFILE, LiffPage.JOBS],
};

/** URL เต็มของหน้า LIFF — คืน `null` เมื่อยังไม่ได้กรอก LIFF ID (หน้าเว็บเอาไปแสดงข้อความ "ยังกรอกไม่ครบ") */
export function liffUrl(liffId: string | null | undefined): string | null {
  const trimmed = (liffId ?? '').trim();
  return trimmed.length > 0 ? `${LIFF_URL_PREFIX}${trimmed}` : null;
}
