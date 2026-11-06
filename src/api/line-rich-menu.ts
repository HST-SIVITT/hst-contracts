import { LiffPage, type LineChannel, LINE_CHANNELS } from '../enums/line';
import { OwnerType } from '../enums/profile';

/**
 * Rich Menu ของ LINE OA — `CR-039` · `REQ-SET-040`..`REQ-SET-045` · TEC-05 §5.6a–f
 *
 * ไฟล์นี้เป็น **แหล่งเดียว** ของกติกา rich menu ทั้งฝั่ง API และหน้าเว็บ:
 * ขนาดภาพ · ผังปุ่มสำเร็จรูป · ชนิด action · การหา "บทบาทถัดไป" ของปุ่มสลับ · alias id
 * → ห้ามพิมพ์ตัวเลข/ชื่อ alias/รายการผังซ้ำที่อื่น (กติกาเดียวกับ `LINE_CHANNEL_RICH_MENU`)
 */

/**
 * บทบาทที่ rich menu ให้บริการ — ใช้ `OwnerType` **ที่มีอยู่แล้ว** ไม่ออก enum ใหม่
 * (ชุดเดียวกับเจ้าของแถวใน `line_accounts` — DOM-01 §1.3 D1 · กฎข้อ 3 ของ CLAUDE.md)
 *
 * ⚠️ **ลำดับในอาร์เรย์นี้มีความหมาย** — ใช้ทั้ง (ก) เรียงเมนูบนหน้าจอ
 * (ข) หา "บทบาทถัดไป" ของปุ่มสลับ และ (ค) เลือก "บทบาทหลัก" ของ OA (`REQ-SET-040`)
 * เปลี่ยนลำดับ = เปลี่ยนว่าเมนูไหนเป็น default ของ OA นั้น
 */
export const LINE_RICH_MENU_AUDIENCE_ROLES = [
  OwnerType.PATIENT,
  OwnerType.RIDER,
  OwnerType.TECHNICIAN,
  OwnerType.DEVICE_MANAGER,
] as const;
export type LineRichMenuAudienceRole = (typeof LINE_RICH_MENU_AUDIENCE_ROLES)[number];

/** ขนาดภาพที่ LINE รองรับ — `REQ-SET-041` */
export const RichMenuSize = {
  /** เมนูเต็ม 6 ช่อง */
  LARGE: 'LARGE',
  /** เมนูครึ่งความสูง */
  COMPACT: 'COMPACT',
} as const;
export type RichMenuSize = (typeof RichMenuSize)[keyof typeof RichMenuSize];

export interface RichMenuPixelSize {
  width: number;
  height: number;
}

/** พิกเซลจริงที่ LINE บังคับ — ภาพที่อัปโหลดต้องเท่านี้พอดี (`REQ-SET-044`) */
export const RICH_MENU_SIZE_PX: Readonly<Record<RichMenuSize, RichMenuPixelSize>> = {
  [RichMenuSize.LARGE]: { width: 2500, height: 1686 },
  [RichMenuSize.COMPACT]: { width: 2500, height: 843 },
};

export const RICH_MENU_SIZES = Object.values(RichMenuSize) as readonly RichMenuSize[];

/** ชนิดปลายทางของปุ่ม — `REQ-SET-041` */
export const RichMenuActionType = {
  /** เปิดหน้า LIFF ของ OA ที่โฮสต์บทบาทนี้ */
  LIFF: 'LIFF',
  /** ลิงก์ภายนอกที่ผู้ดูแลกรอกเอง */
  URI: 'URI',
  /** ให้ผู้ใช้ส่งข้อความนั้นเข้า OA */
  MESSAGE: 'MESSAGE',
  /** สลับไปเมนูของบทบาทถัดไปบน OA เดียวกัน (`richmenuswitch` · `REQ-SET-042`) */
  SWITCH: 'SWITCH',
} as const;
export type RichMenuActionType = (typeof RichMenuActionType)[keyof typeof RichMenuActionType];

export const RICH_MENU_ACTION_TYPES = Object.values(
  RichMenuActionType,
) as readonly RichMenuActionType[];

export interface RichMenuBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * action ที่เก็บในฐานข้อมูล — **ไม่ใช่** รูปแบบของ LINE
 * (ตัวแปลงอยู่ฝั่ง API เพราะต้องอ่าน LIFF ID/alias จากค่าตั้งค่า ณ เวลา publish)
 */
export interface RichMenuActionDef {
  type: RichMenuActionType;
  /** `LIFF` — หน้าที่จะเปิด */
  page?: LiffPage;
  /** `URI` — ลิงก์ที่ผู้ดูแลกรอก */
  url?: string;
  /** `MESSAGE` — ข้อความที่ผู้ใช้จะส่ง */
  text?: string;
  /** ข้อความบอกผู้ใช้ตอนกด (LINE `label`) — ไม่บังคับ */
  label?: string;
}

export interface RichMenuAreaDef {
  bounds: RichMenuBounds;
  action: RichMenuActionDef;
}

/** meta ของรูปพื้นหลัง — **รูปแบบเดียวกับ `VideoconBrandingImage`** (`REQ-SET-033`) */
export interface RichMenuImage {
  key: string;
  driver: string;
  mime: string;
  size: number;
  originalName: string;
  updatedAt: string;
}

/** meta ของรูปที่ส่งออกทาง HTTP — ไม่ส่ง `key`/`driver` ออกไปให้เบราว์เซอร์ */
export interface RichMenuImageView {
  /** path นับจาก root ของ API (ยังไม่มี `/api/v1`) + `?v=` กำกับรุ่น */
  url: string;
  mime: string;
  originalName: string;
  size: number;
  updatedAt: string;
}

/** สถานะที่หน้าเว็บแสดงต่อบทบาท — `REQ-SET-045` */
export const RichMenuPublishState = {
  /** ยังไม่มีรูป หรือยังไม่วางปุ่ม */
  DRAFT: 'DRAFT',
  /** ครบพร้อม publish แต่ยังไม่เคยส่งขึ้น LINE */
  READY: 'READY',
  /** publish แล้วและผังตรงกับที่ส่งไป */
  PUBLISHED: 'PUBLISHED',
  /** publish แล้วแต่แก้ผังหลังจากนั้น */
  OUT_OF_SYNC: 'OUT_OF_SYNC',
} as const;
export type RichMenuPublishState =
  (typeof RichMenuPublishState)[keyof typeof RichMenuPublishState];

export interface LineRichMenuView {
  id: string;
  audienceRole: LineRichMenuAudienceRole;
  channel: LineChannel;
  name: string;
  chatBarText: string;
  size: RichMenuSize;
  selected: boolean;
  areas: RichMenuAreaDef[];
  image: RichMenuImageView | null;
  lineRichMenuId: string | null;
  aliasId: string | null;
  publishedAt: string | null;
  state: RichMenuPublishState;
  /** OA นี้มีบทบาทอื่นร่วมอยู่ไหม → หน้าเว็บใช้ตัดสินว่าจะให้เลือก action `SWITCH` ได้ */
  switchTargetRole: LineRichMenuAudienceRole | null;
  /** เป็นเมนูเริ่มต้นของ OA นั้นไหม (บทบาทแรกตามลำดับ `LINE_RICH_MENU_AUDIENCE_ROLES`) */
  primaryOnChannel: boolean;
  /** เรื่องที่ต้องแก้ก่อน publish — i18n key ล้วน ไม่ใช่ข้อความ */
  issues: string[];
}

/** สรุปต่อ OA — หน้าเว็บจัดกลุ่มการ์ดด้วยตัวนี้ */
export interface LineRichMenuChannelView {
  channel: LineChannel;
  /** OA นี้กรอก Channel Access Token แล้วหรือยัง (publish ได้ไหม) */
  configured: boolean;
  roles: LineRichMenuAudienceRole[];
}

export interface LineRichMenuBoard {
  channels: LineRichMenuChannelView[];
  menus: LineRichMenuView[];
}

export interface LineRichMenuPublishResult {
  audienceRole: LineRichMenuAudienceRole;
  lineRichMenuId: string;
  aliasId: string;
  /** ตั้งเป็น default menu ของ OA ด้วยไหม */
  setAsDefault: boolean;
  /** ผูกเมนูให้ผู้ใช้ที่ผูกบัญชีไว้แล้วกี่คน */
  linkedUsers: number;
  /** area ที่ถูกข้าม (i18n key + ลำดับปุ่ม) — `REQ-SET-042` / `REQ-SET-044` */
  skippedAreas: { index: number; reason: string }[];
}

// ---------------------------------------------------------------------------
// เพดานของ LINE — `REQ-SET-044`
// ---------------------------------------------------------------------------

export const RICH_MENU_CHAT_BAR_TEXT_MAX = 14;
export const RICH_MENU_NAME_MAX = 100;
export const RICH_MENU_MAX_AREAS = 20;
/** เพดานขนาดไฟล์ของ LINE คือ 1 MB — **ไม่ขึ้นกับ `s3.maxUploadSizeMb`** เพราะเป็นข้อจำกัดปลายทาง */
export const RICH_MENU_IMAGE_MAX_BYTES = 1024 * 1024;
export const RICH_MENU_IMAGE_ACCEPTED_MIME: readonly string[] = ['image/png', 'image/jpeg'];
/** ข้อจำกัดภาพของ LINE ที่ไม่ได้ผูกกับ `RICH_MENU_SIZE_PX` ตรง ๆ */
export const RICH_MENU_IMAGE_MIN_WIDTH = 800;
export const RICH_MENU_IMAGE_MAX_WIDTH = 2500;
export const RICH_MENU_IMAGE_MIN_HEIGHT = 250;
export const RICH_MENU_IMAGE_MIN_RATIO = 1.45;
export const RICH_MENU_URL_MAX = 1000;
export const RICH_MENU_MESSAGE_MAX = 300;

// ---------------------------------------------------------------------------
// ผังปุ่มสำเร็จรูป — หน้าเว็บ **ห้าม** คำนวณกรอบเอง (`REQ-SET-041`)
// ---------------------------------------------------------------------------

export interface RichMenuLayoutPreset {
  id: string;
  size: RichMenuSize;
  /** กรอบของแต่ละปุ่ม เรียงซ้าย→ขวา บน→ล่าง */
  bounds: readonly RichMenuBounds[];
}

function grid(size: RichMenuSize, cols: number, rows: number): readonly RichMenuBounds[] {
  const { width, height } = RICH_MENU_SIZE_PX[size];
  const cellWidth = Math.floor(width / cols);
  const cellHeight = Math.floor(height / rows);
  const cells: RichMenuBounds[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push({
        x: col * cellWidth,
        y: row * cellHeight,
        // ช่องขวาสุด/ล่างสุดกินเศษที่ `Math.floor` ตัดทิ้ง ไม่งั้นมีแถบตายริมภาพ
        width: col === cols - 1 ? width - col * cellWidth : cellWidth,
        height: row === rows - 1 ? height - row * cellHeight : cellHeight,
      });
    }
  }
  return cells;
}

/**
 * ผังที่เลือกได้ในฟอร์ม — ตั้งชื่อ id แบบ `<size>-<cols>x<rows>` เพื่อให้ i18n key เดาได้
 * (`settings.richMenu.layout.<id>`) · เพิ่มผังใหม่ให้เพิ่มที่นี่ที่เดียว
 */
export const RICH_MENU_LAYOUT_PRESETS: readonly RichMenuLayoutPreset[] = [
  { id: 'large-1x1', size: RichMenuSize.LARGE, bounds: grid(RichMenuSize.LARGE, 1, 1) },
  { id: 'large-2x1', size: RichMenuSize.LARGE, bounds: grid(RichMenuSize.LARGE, 2, 1) },
  { id: 'large-3x1', size: RichMenuSize.LARGE, bounds: grid(RichMenuSize.LARGE, 3, 1) },
  { id: 'large-2x2', size: RichMenuSize.LARGE, bounds: grid(RichMenuSize.LARGE, 2, 2) },
  { id: 'large-3x2', size: RichMenuSize.LARGE, bounds: grid(RichMenuSize.LARGE, 3, 2) },
  { id: 'compact-1x1', size: RichMenuSize.COMPACT, bounds: grid(RichMenuSize.COMPACT, 1, 1) },
  { id: 'compact-2x1', size: RichMenuSize.COMPACT, bounds: grid(RichMenuSize.COMPACT, 2, 1) },
  { id: 'compact-3x1', size: RichMenuSize.COMPACT, bounds: grid(RichMenuSize.COMPACT, 3, 1) },
];

export function richMenuLayoutPreset(id: string): RichMenuLayoutPreset | null {
  return RICH_MENU_LAYOUT_PRESETS.find((preset) => preset.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// alias + ปุ่มสลับ — `REQ-SET-042`
// ---------------------------------------------------------------------------

/**
 * รหัสย่อ 2 ตัวอักษร — alias ของ LINE จำกัด `^[a-z0-9_-]{1,32}$`
 * `hst-rm-patient-device_manager` ยาวเกิน จึงต้องย่อ (`DEVICE_MANAGER` ตัวเดียวก็ 14 ตัวอักษร)
 */
const ROLE_SHORT: Readonly<Record<LineRichMenuAudienceRole, string>> = {
  [OwnerType.PATIENT]: 'pt',
  [OwnerType.RIDER]: 'rd',
  [OwnerType.TECHNICIAN]: 'tc',
  [OwnerType.DEVICE_MANAGER]: 'dm',
};

const CHANNEL_SHORT: Readonly<Record<LineChannel, string>> = {
  PATIENT: 'pt',
  RIDER: 'rd',
  TECHNICIAN: 'tc',
  DEVICE_MANAGER: 'dm',
};

/**
 * alias id ของเมนูหนึ่ง — **จุดเดียวที่ประกอบชื่อนี้** ทั้งตอน publish และตอนอ้างเป็นปลายทางของปุ่มสลับ
 * ใส่ channel ด้วยเพราะ alias เป็นของ OA นั้น ๆ และต้องอ่านออกว่าอันไหนของใครเวลาไปดูใน LINE
 */
export function richMenuAliasId(
  channel: LineChannel,
  role: LineRichMenuAudienceRole,
): string {
  return `hst-rm-${CHANNEL_SHORT[channel]}-${ROLE_SHORT[role]}`;
}

/** บทบาทที่อยู่บน OA นั้น เรียงตามลำดับมาตรฐาน */
export function rolesOnChannel(
  assignment: Readonly<Record<LineRichMenuAudienceRole, LineChannel>>,
  channel: LineChannel,
): LineRichMenuAudienceRole[] {
  return LINE_RICH_MENU_AUDIENCE_ROLES.filter((role) => assignment[role] === channel);
}

/**
 * บทบาทหลักของ OA = ตัวแรกตามลำดับมาตรฐาน → เป็น default rich menu ของ OA (`REQ-SET-040`)
 * คืน `null` เมื่อ OA นั้นไม่มีบทบาทเลย
 */
export function primaryRoleOnChannel(
  assignment: Readonly<Record<LineRichMenuAudienceRole, LineChannel>>,
  channel: LineChannel,
): LineRichMenuAudienceRole | null {
  return rolesOnChannel(assignment, channel)[0] ?? null;
}

/**
 * ปลายทางของปุ่มสลับ = **บทบาทถัดไปแบบวน** บน OA เดียวกัน (`REQ-SET-042`)
 * OA ที่มีบทบาทเดียว → `null` = ไม่มีปุ่มสลับ (ปุ่มที่ค้างอยู่จะถูกข้ามตอน publish)
 */
export function switchTargetRole(
  assignment: Readonly<Record<LineRichMenuAudienceRole, LineChannel>>,
  role: LineRichMenuAudienceRole,
): LineRichMenuAudienceRole | null {
  const siblings = rolesOnChannel(assignment, assignment[role]);
  if (siblings.length < 2) return null;
  const index = siblings.indexOf(role);
  return siblings[(index + 1) % siblings.length] ?? null;
}

/** การจัดสรรตั้งต้น = 1 บทบาท 1 OA ชื่อเดียวกัน (พฤติกรรมเดิมก่อน `CR-039`) */
export function defaultRoleChannelAssignment(): Record<
  LineRichMenuAudienceRole,
  LineChannel
> {
  return {
    [OwnerType.PATIENT]: 'PATIENT',
    [OwnerType.RIDER]: 'RIDER',
    [OwnerType.TECHNICIAN]: 'TECHNICIAN',
    [OwnerType.DEVICE_MANAGER]: 'DEVICE_MANAGER',
  };
}

/** ตรวจว่า `value` เป็นบทบาทที่ rich menu รองรับ — ใช้ตอนอ่านค่าจาก DB/HTTP */
export function isRichMenuAudienceRole(value: unknown): value is LineRichMenuAudienceRole {
  return (LINE_RICH_MENU_AUDIENCE_ROLES as readonly string[]).includes(String(value));
}

export function isLineChannelValue(value: unknown): value is LineChannel {
  return (LINE_CHANNELS as readonly string[]).includes(String(value));
}

// ---------------------------------------------------------------------------
// ตรวจผัง — ใช้ร่วมกันทั้งฝั่ง API (ก่อน publish) และหน้าเว็บ (เตือนก่อนกด)
// ---------------------------------------------------------------------------

/** i18n key ของเรื่องที่ต้องแก้ — ขึ้นต้น `settings.richMenu.issue.` ทุกตัว */
export const RichMenuIssue = {
  NO_IMAGE: 'settings.richMenu.issue.noImage',
  NO_AREAS: 'settings.richMenu.issue.noAreas',
  TOO_MANY_AREAS: 'settings.richMenu.issue.tooManyAreas',
  BOUNDS_OUT_OF_RANGE: 'settings.richMenu.issue.boundsOutOfRange',
  CHAT_BAR_TEXT: 'settings.richMenu.issue.chatBarText',
  CHANNEL_NOT_CONFIGURED: 'settings.richMenu.issue.channelNotConfigured',
  SWITCH_WITHOUT_TARGET: 'settings.richMenu.issue.switchWithoutTarget',
  LIFF_ID_MISSING: 'settings.richMenu.issue.liffIdMissing',
  ACTION_INCOMPLETE: 'settings.richMenu.issue.actionIncomplete',
  IMAGE_SIZE_MISMATCH: 'settings.richMenu.issue.imageSizeMismatch',
} as const;
export type RichMenuIssue = (typeof RichMenuIssue)[keyof typeof RichMenuIssue];

/** กรอบอยู่ในภาพทั้งใบไหม — `REQ-SET-044` */
export function boundsWithinSize(bounds: RichMenuBounds, size: RichMenuSize): boolean {
  const px = RICH_MENU_SIZE_PX[size];
  return (
    Number.isInteger(bounds.x) &&
    Number.isInteger(bounds.y) &&
    Number.isInteger(bounds.width) &&
    Number.isInteger(bounds.height) &&
    bounds.x >= 0 &&
    bounds.y >= 0 &&
    bounds.width > 0 &&
    bounds.height > 0 &&
    bounds.x + bounds.width <= px.width &&
    bounds.y + bounds.height <= px.height
  );
}

/** action กรอกครบไหม (ยังไม่ตรวจเรื่อง LIFF ID / ปลายทางของปุ่มสลับ ซึ่งต้องรู้ค่าตั้งค่า) */
export function actionIsComplete(action: RichMenuActionDef): boolean {
  switch (action.type) {
    case RichMenuActionType.LIFF:
      return (
        action.page !== undefined &&
        (Object.values(LiffPage) as string[]).includes(action.page)
      );
    case RichMenuActionType.URI:
      return typeof action.url === 'string' && /^https:\/\/\S+$/.test(action.url.trim());
    case RichMenuActionType.MESSAGE:
      return typeof action.text === 'string' && action.text.trim().length > 0;
    case RichMenuActionType.SWITCH:
      return true;
    default:
      return false;
  }
}

/**
 * path ของรูปพื้นหลัง นับจาก root ของ API (ยังไม่มี `/api/v1`) — `REQ-SET-041`
 * ⭐ **จุดเดียวที่ประกอบ path นี้** ทั้ง controller, service และหน้าเว็บ
 * (รูปถูก stream ผ่าน API ไม่ใช่ presigned URL ที่หมดอายุ 5 นาที — เหมือน branding ของ videocon)
 */
export function lineRichMenuImagePath(role: LineRichMenuAudienceRole): string {
  return `/settings/line/rich-menus/${role}/image`;
}
