import { StorageDriver } from '../enums/attachment';

/**
 * หน้าต้อนรับของห้องประชุมทางไกล (hst-videocon) — `REQ-SET-032` · `REQ-SET-033` · `REQ-SET-034`
 *
 * 5 ค่าที่ปรับได้ เรียงตามลำดับที่ปรากฏบนหน้าจอจากบนลงล่าง:
 *   1. โลโก้หลัก (รูป)      → `SettingKey.VIDEOCON_LOGO`
 *   2. ชื่อระบบ (ข้อความ)   → `SettingKey.VIDEOCON_SYSTEM_NAME`
 *   3. รูปประกอบ (รูป)      → `SettingKey.VIDEOCON_ILLUSTRATION`
 *   4. คำอธิบาย (ข้อความ)   → `SettingKey.VIDEOCON_DESCRIPTION`
 *   5. copyright (ข้อความ)  → `SettingKey.VIDEOCON_COPYRIGHT`
 *
 * ⚠️ ค่าทั้งหมดเป็น **ต่อไซต์** — hst-videocon อ่านตามโดเมนที่ผู้ใช้เรียกเข้ามา
 *    (`REQ-SITE-010` · ห้ามรับ site จาก query/path ของผู้ใช้ — ข้อควรระวังข้อ 226)
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
  logo: VideoconBrandingImageView | null;
  illustration: VideoconBrandingImageView | null;
}

/** path สาธารณะของรูป 1 ช่อง — ใช้ร่วมกันทั้ง API (ตอนสร้าง view) และ web (ตอน preview) */
export function videoconBrandingImagePath(slot: VideoconBrandingSlot): string {
  return `/settings/videocon/branding/${slot}`;
}
