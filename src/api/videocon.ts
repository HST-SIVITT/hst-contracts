import { StorageDriver } from '../enums/attachment';

/**
 * หน้าต้อนรับของห้องประชุมทางไกล — `REQ-SET-032` · `REQ-SET-033` · `REQ-SET-034` · `REQ-SET-035` · `REQ-SET-036`
 *
 * 7 ค่าที่ปรับได้ เรียงตามลำดับที่ปรากฏบนหน้าจอจากบนลงล่าง:
 *   1. โลโก้หลัก (รูป)              → `SettingKey.VIDEOCON_LOGO`
 *   2. ชื่อระบบ (ข้อความ)           → `SettingKey.VIDEOCON_SYSTEM_NAME`
 *   3. รูปประกอบ (รูป)              → `SettingKey.VIDEOCON_ILLUSTRATION`
 *   4. คำอธิบาย (ข้อความ)           → `SettingKey.VIDEOCON_DESCRIPTION`
 *   5. ลิงก์ประกาศฯ ของสถานพยาบาล    → `SettingKey.VIDEOCON_FACILITY_PRIVACY_URL`  (`REQ-SET-035`)
 *   6. ลิงก์ประกาศความเป็นส่วนตัว     → `SettingKey.VIDEOCON_PRIVACY_URL`           (`REQ-SET-035`)
 *   7. copyright (ข้อความ)          → `SettingKey.VIDEOCON_COPYRIGHT`
 *
 * ⚠️ ค่าทั้งหมดเป็น **ต่อไซต์** — หน้า `/tele` อ่านตามโดเมนที่ผู้ใช้เรียกเข้ามา
 *    (`REQ-SITE-010` · ห้ามรับ site จาก query/path ของผู้ใช้ — ข้อควรระวังข้อ 226)
 *
 * 📌 `REQ-SET-036` — หน้านี้ย้ายจาก repo `hst-videocon` (`/room/jitsi/...`) มาอยู่ใน hst-web
 *    ที่ `/tele/<room>/<userType>` แล้ว ([ADR-064](../../../docs/90-workspace/DECISIONS.md))
 *    ชื่อ `userType` และ path ถูกนิยามไว้ที่ไฟล์นี้ที่เดียว เพื่อให้ค่าเริ่มต้นของ
 *    `consult.*PathTemplate` (`REQ-SET-027`) กับตัวหน้าเว็บจริง **เพี้ยนจากกันไม่ได้**
 */

/** ช่องอัปโหลดรูป — 1 ค่า = 1 ช่องบนหน้าจอ และเป็น path param ของ endpoint อัปโหลด */
export const VideoconBrandingSlot = {
  LOGO: 'logo',
  ILLUSTRATION: 'illustration',
} as const;
export type VideoconBrandingSlot =
  (typeof VideoconBrandingSlot)[keyof typeof VideoconBrandingSlot];

export const VIDEOCON_BRANDING_SLOTS = Object.values(
  VideoconBrandingSlot,
) as readonly VideoconBrandingSlot[];

/**
 * ชนิดไฟล์ที่รับได้ต่อช่อง — **บังคับทั้งฝั่ง web (`<input accept>`) และ API**
 * - `logo` รับ png เท่านั้นตามที่เจ้าของงานระบบ ("เป็น png สามารถอัพโหลดเปลี่ยนแปลงได้")
 * - `illustration` ผ่อนให้ jpeg/webp ด้วย เพราะเป็นภาพประกอบที่มักมาจากกล้อง/ไฟล์งานออกแบบ
 *
 * ⚠️ ไม่มี `image/svg+xml` โดยตั้งใจ — SVG รัน script ได้ และรูปทั้งสองถูกเสิร์ฟแบบ public
 */
export const VIDEOCON_BRANDING_ACCEPTED_MIME: Readonly<
  Record<VideoconBrandingSlot, readonly string[]>
> = {
  [VideoconBrandingSlot.LOGO]: ['image/png'],
  [VideoconBrandingSlot.ILLUSTRATION]: ['image/png', 'image/jpeg', 'image/webp'],
};

/**
 * ความยาวสูงสุดของค่าที่เป็นข้อความ — ทั้ง API และฟอร์มต้องบังคับเท่ากัน
 * (ตัวเลขเป็น assumption ของผม ไม่ได้มาจากเอกสาร — ดู `Q-086`)
 */
export const VIDEOCON_SYSTEM_NAME_MAX_LENGTH = 120;
export const VIDEOCON_DESCRIPTION_MAX_LENGTH = 1000;
export const VIDEOCON_COPYRIGHT_MAX_LENGTH = 300;
/**
 * `REQ-SET-035` — ลิงก์ของปุ่ม "ประกาศความเป็นส่วนตัว" สองปุ่ม
 * 500 เท่ากับคอลัมน์ `orders.tele_link` ที่เก็บ URL ยาวสุดในระบบอยู่แล้ว
 */
export const VIDEOCON_PRIVACY_URL_MAX_LENGTH = 500;

/**
 * ค่าที่เก็บในแถว settings ของช่องรูป (valueType = JSON)
 * ⚠️ ต้องเก็บ `driver` ด้วย ไม่ใช่เก็บแค่ key — ไฟล์ที่อัปโหลดตอน dev อยู่บนดิสก์ (ADR-027)
 *    ถ้าเก็บแค่ key ระบบจะไปหาไฟล์บน S3 แล้ว 404 หลังเจ้าของงานกรอกค่า S3 ทีหลัง
 */
export interface VideoconBrandingImage {
  key: string;
  driver: StorageDriver;
  mime: string;
  size: number;
  /** ชื่อไฟล์ที่ผู้ใช้อัปโหลดมา — แสดงบนหน้าตั้งค่าเท่านั้น ไม่ได้ใช้ตั้ง path */
  originalName: string;
  /** ISO 8601 — ใช้ทำ cache-busting ของ `<img src>` */
  updatedAt: string;
}

/** รูปหนึ่งช่องในมุมของผู้เรียก — `url` เป็น path ของ endpoint สาธารณะ ไม่ใช่ลิงก์ S3 */
export interface VideoconBrandingImageView {
  url: string;
  mime: string;
  originalName: string;
  size: number;
  updatedAt: string;
}

/**
 * ค่าที่ hst-videocon อ่านไปใช้ — `REQ-SET-034`
 * ค่าที่ยังไม่ได้ตั้งเป็น `null` **เสมอ** และผู้เรียกต้อง fallback เป็นของเดิมของตัวเอง
 * (ห้ามให้ API เดาค่า default ของหน้าตาแทนไซต์)
 */
export interface VideoconBrandingView {
  systemName: string | null;
  description: string | null;
  copyright: string | null;
  /** `REQ-SET-035` — ปุ่ม "ประกาศความเป็นส่วนตัวของสถานพยาบาล" (ของโรงพยาบาลเจ้าของไซต์) */
  facilityPrivacyUrl: string | null;
  /** `REQ-SET-035` — ปุ่ม "ประกาศความเป็นส่วนตัว" (ของผู้ให้บริการระบบ) */
  privacyUrl: string | null;
  logo: VideoconBrandingImageView | null;
  illustration: VideoconBrandingImageView | null;
}

/** path สาธารณะของรูป 1 ช่อง — ใช้ร่วมกันทั้ง API (ตอนสร้าง view) และ web (ตอน preview) */
export function videoconBrandingImagePath(slot: VideoconBrandingSlot): string {
  return `/settings/videocon/branding/${slot}`;
}

/* ===========================================================================
 * หน้าห้องประชุมทางไกล `/tele/<room>/<userType>` — `REQ-SET-036` (`CR-033`)
 * ย้ายมาจาก `hst-videocon` ที่ `/room/jitsi/<room>/<userRole>` — ADR-064
 * =========================================================================*/

/**
 * บทบาทของผู้ที่เปิดหน้าห้องประชุม — เป็น segment สุดท้ายของ URL
 * `technician` = moderator ของ Jitsi (คุม lobby / ปิดห้อง / เตะ-ปิดไมค์คนอื่นได้)
 */
export const TeleUserType = {
  PATIENT: 'patient',
  TECHNICIAN: 'technician',
} as const;
export type TeleUserType = (typeof TeleUserType)[keyof typeof TeleUserType];

export const TELE_USER_TYPES = Object.values(TeleUserType) as readonly TeleUserType[];

/**
 * ชื่อ segment ที่รับได้ → บทบาทจริง
 *
 * ⚠️ `user` / `moderator` คือชื่อเดิมของ `hst-videocon` **ลบออกไม่ได้**
 *    เพราะลิงก์ที่ระบบส่งให้คนไข้/ช่างไปแล้วถูก snapshot ไว้ในคอลัมน์ `orders.tele_link`
 *    และ `orders.technician_tele_link` (`REQ-ORD-074`) ใบงานเก่าจึงยังเดินเข้าชื่อเดิมอยู่
 */
export const TELE_USER_TYPE_ALIASES: Readonly<Record<string, TeleUserType>> = {
  patient: TeleUserType.PATIENT,
  user: TeleUserType.PATIENT,
  technician: TeleUserType.TECHNICIAN,
  moderator: TeleUserType.TECHNICIAN,
};

/** คืน `null` เมื่อ segment ไม่ใช่บทบาทที่รู้จัก — ผู้เรียกต้อง 404 ห้ามเดาเป็นคนไข้ */
export function teleUserTypeFromPath(raw: string | undefined): TeleUserType | null {
  return TELE_USER_TYPE_ALIASES[(raw ?? '').trim().toLowerCase()] ?? null;
}

/** `true` เมื่อบทบาทนี้เป็น moderator ของห้อง — ใช้ทั้งตอนออก JWT และตอนประกอบ toolbar */
export function isTeleModerator(userType: TeleUserType): boolean {
  return userType === TeleUserType.TECHNICIAN;
}

export const TELE_PATH_PREFIX = '/tele';

/**
 * path ของห้องหนึ่ง — ใช้ร่วมกันทั้งค่าเริ่มต้นของ `consult.*PathTemplate` และตัวหน้าเว็บ
 * `room` ไม่ถูก encode ที่นี่ เพราะผู้เรียกบางรายส่ง template ที่มี `{orderCode}` อยู่ข้างใน
 */
export function telePath(room: string, userType: TeleUserType): string {
  return `${TELE_PATH_PREFIX}/${room}/${userType}`;
}

/** path เดิมของ hst-videocon — hst-web redirect ของเดิมมาที่ `telePath()` ให้ (`REQ-SET-036`) */
export const TELE_LEGACY_PATH_PREFIX = '/room/jitsi';
