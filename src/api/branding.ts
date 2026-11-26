import { StorageDriver } from '../enums/attachment';

/**
 * 🏷️ อัตลักษณ์ของระบบ (โลโก้ + ชื่อระบบ TH/EN) — `REQ-SET-049`..`REQ-SET-052` (`CR-051`)
 *
 * 3 ค่าที่ปรับได้ในเมนู "ตั้งค่า → อัตลักษณ์ระบบ":
 *   1. โลโก้หลัก (รูป **สี่เหลี่ยมจัตุรัส**) → `SettingKey.BRANDING_LOGO`
 *   2. ชื่อระบบ (ไทย)                     → `SettingKey.BRANDING_SYSTEM_NAME_TH`
 *   3. ชื่อระบบ (อังกฤษ)                   → `SettingKey.BRANDING_SYSTEM_NAME_EN`
 *
 * ค่าเหล่านี้แทนที่ `app.shortName` / `app.name` ในไฟล์ภาษาของ hst-web **ทุกจุด**
 * (sidebar · หน้า login/ลืมรหัสผ่าน · `<title>` · favicon · หัวเอกสารที่พิมพ์ออก)
 *
 * ⚠️ ค่าทั้งหมดเป็น **ต่อไซต์** (`REQ-SITE-013`) — อ่านตามโดเมนที่ผู้ใช้เรียกเข้ามาเท่านั้น
 *    ห้ามรับ site จาก query/path ของผู้เรียก (ข้อควรระวังข้อ 226)
 *
 * ⚠️ ยังไม่ได้ตั้งค่า = `null` **เสมอ** ห้าม API เดาค่าแทนไซต์ — ผู้เรียก (hst-web)
 *    ต้อง fallback ไปที่ `app.name` / `app.shortName` ในไฟล์ภาษาของตัวเอง
 *    ไม่งั้นไซต์ที่ยังไม่ได้ตั้งค่าจะเปลี่ยนหน้าตาไปเองตั้งแต่ deploy แรก (กติกาเดียวกับ `VIDEOCON`)
 */

/** ความยาวสูงสุดของชื่อระบบต่อภาษา — เท่ากับ `VIDEOCON_SYSTEM_NAME_MAX_LENGTH` เพื่อไม่ให้ผู้ใช้สับสน */
export const BRANDING_SYSTEM_NAME_MAX_LENGTH = 120;

/**
 * ชนิดไฟล์ที่ **ผู้ใช้เลือกเข้ามาได้** ก่อนขั้นตอน crop (`<input accept>`)
 * กว้างกว่าชนิดที่ API รับ เพราะฝั่งเว็บ crop แล้วแปลงเป็น PNG ให้เสมอ
 *
 * ⚠️ ไม่มี `image/svg+xml` โดยตั้งใจ — SVG รัน script ได้ และโลโก้ถูกเสิร์ฟแบบ public
 *    (กติกาเดียวกับ `VIDEOCON_BRANDING_ACCEPTED_MIME`)
 */
export const BRANDING_LOGO_PICK_ACCEPTED_MIME: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
];

/**
 * ชนิดไฟล์ที่ **API รับ** — PNG เท่านั้น
 * ฝั่งเว็บ crop เป็นสี่เหลี่ยมจัตุรัสแล้ว `canvas.toBlob('image/png')` ออกมาเสมอ
 * (PNG รักษาความคมของตัวอักษรในโลโก้และรองรับพื้นหลังโปร่งใส ซึ่ง favicon ต้องใช้)
 */
export const BRANDING_LOGO_ACCEPTED_MIME: readonly string[] = ['image/png'];

/**
 * ด้านของรูปที่ฝั่งเว็บส่งขึ้นมาหลัง crop (พิกเซล) — **สี่เหลี่ยมจัตุรัสเสมอ** (`REQ-SET-050`)
 * 512 พอสำหรับ favicon (16/32/180) · โลโก้ sidebar (36) · หัวเอกสารพิมพ์ (~96) โดยไม่แตก
 */
export const BRANDING_LOGO_SIZE = 512;

/** เพดานไฟล์ของโลโก้หลัง crop — 512×512 PNG ไม่ควรเกินนี้ ถ้าเกิน = มีอะไรผิด */
export const BRANDING_LOGO_MAX_BYTES = 2 * 1024 * 1024;

/**
 * ค่าที่เก็บในแถว settings ของโลโก้ (valueType = JSON)
 * ⚠️ ต้องเก็บ `driver` ด้วย ไม่ใช่เก็บแค่ key — ไฟล์ที่อัปโหลดตอน dev อยู่บนดิสก์ (ADR-027)
 *    (โครงเดียวกับ `VideoconBrandingImage` โดยตั้งใจ แต่แยกชนิดไว้เพราะคนละ feature คนละ lifecycle)
 */
export interface BrandingImage {
  key: string;
  driver: StorageDriver;
  mime: string;
  size: number;
  /** ชื่อไฟล์ที่ผู้ใช้อัปโหลดมา — แสดงบนหน้าตั้งค่าเท่านั้น ไม่ได้ใช้ตั้ง path */
  originalName: string;
  /** ISO 8601 — ใช้ทำ cache-busting ของ `<img src>` และ favicon */
  updatedAt: string;
}

/** โลโก้ในมุมของผู้เรียก — `url` เป็น path ของ endpoint สาธารณะ ไม่ใช่ลิงก์ S3 */
export interface BrandingImageView {
  url: string;
  mime: string;
  originalName: string;
  size: number;
  updatedAt: string;
}

/**
 * ค่าที่ทุกหน้าของ hst-web อ่านไปใช้ — `REQ-SET-051`
 * ค่าที่ยังไม่ได้ตั้งเป็น `null` **เสมอ** และผู้เรียกต้อง fallback เป็นไฟล์ภาษาของตัวเอง
 */
export interface SystemBrandingView {
  systemNameTh: string | null;
  systemNameEn: string | null;
  logo: BrandingImageView | null;
}

/** path สาธารณะของไฟล์โลโก้ — ใช้ร่วมกันทั้ง API (ตอนสร้าง view) และ web (ตอน preview/favicon) */
export function systemBrandingLogoPath(): string {
  return '/settings/branding/logo';
}

/**
 * ชื่อระบบของภาษาที่กำลังใช้ — `REQ-SET-052`
 *
 * ถอยทีละชั้น: ภาษาที่เลือก → ภาษาอีกภาษา → `null` (ให้ผู้เรียกใช้ไฟล์ภาษาของตัวเอง)
 * ชั้นกลางสำคัญ: ผู้ดูแลหลายคนกรอกแต่ชื่อไทย ถ้าไม่ถอยไปใช้ชื่อไทย หน้า EN จะไม่มีชื่อระบบเลย
 */
export function systemNameForLocale(
  branding: SystemBrandingView | null | undefined,
  locale: string,
): string | null {
  if (!branding) return null;
  const th = trimToNull(branding.systemNameTh);
  const en = trimToNull(branding.systemNameEn);
  return locale.toLowerCase().startsWith('en') ? (en ?? th) : (th ?? en);
}

/**
 * โลโก้ + ชื่อระบบ + ตัวย่อ ที่ "พร้อมแสดง" แล้ว — ผลของการถอยค่าทุกชั้น
 * (ผู้เรียกไม่ต้องถอยเอง · ถอยเองคนละที่แล้วค่าจะเพี้ยนกันในที่สุด)
 */
export interface SystemBrand {
  /** URL เต็มของโลโก้ · `null` = ยังไม่ได้อัปโหลด → ผู้เรียกแสดงกล่องตัวอักษรย่อแทน */
  logoSrc: string | null;
  name: string;
  /** ตัวอักษรย่อในกล่องสี่เหลี่ยม — ใช้เฉพาะเมื่อ `logoSrc === null` */
  shortName: string;
}

/**
 * ⭐ ตรรกะการถอยค่าของโลโก้/ชื่อระบบ — `REQ-SET-051` · `REQ-SET-052` (`T-242`)
 *
 * **อยู่ที่ contracts โดยตั้งใจ** ไม่ใช่ใน component ของ hst-web:
 * หน้า login/ลืมรหัสผ่านเป็น **server component** แต่ sidebar/ปุ่มพิมพ์เอกสารเป็น **client
 * component** · ฟังก์ชันที่ export จากไฟล์ที่มี `'use client'` **เรียกจาก server ไม่ได้**
 * (Next จะขึ้น `Attempted to call ... from the server but ... is on the client` ซึ่ง
 * lint/typecheck/build **จับไม่ได้เลย** เห็นตอนเปิดหน้าเท่านั้น — ข้อควรระวังข้อใหม่)
 * วางไว้ที่นี่ที่เดียว ทั้งสองฝั่งจึงเรียกได้และได้ผลเหมือนกันแน่นอน
 *
 * `apiBaseUrl` ต้องส่งเข้ามา เพราะคนละฝั่งอ่าน base URL จากคนละที่
 * (server: `lib/api` · client: `lib/client-api`) และ contracts ไม่ควรรู้จัก env ของ hst-web
 */
export function resolveSystemBrand(
  branding: SystemBrandingView | null | undefined,
  locale: string,
  fallback: { name: string; shortName: string },
  apiBaseUrl: string,
): SystemBrand {
  const name = systemNameForLocale(branding ?? null, locale);
  return {
    logoSrc: branding?.logo ? `${apiBaseUrl}${branding.logo.url}` : null,
    name: name ?? fallback.name,
    // ตั้งชื่อระบบแล้วแต่ยังไม่มีโลโก้ → ย่อจากชื่อที่ตั้ง ไม่ใช่คาตัวย่อเดิมของระบบไว้
    shortName: (name ? systemNameInitials(name) : null) ?? fallback.shortName,
  };
}

/**
 * ตัวอักษรย่อสำหรับกล่องสี่เหลี่ยมใน sidebar/หน้า login เมื่อ **ยังไม่ได้อัปโหลดโลโก้** แต่ตั้งชื่อระบบแล้ว
 *
 * เอาอักษรแรกของคำ (สูงสุด 3 คำ) · ชื่อคำเดียวเอา 2 ตัวแรก
 * เช่น `"Sleep Lab"` → `"SL"` · `"ศูนย์นิทรารมย์"` → `"ศู"` · `"โรงพยาบาล ก ข"` → `"โกข"`
 *
 * ⚠️ คืน `null` เมื่อชื่อว่าง — ผู้เรียกต้องถอยไปใช้ `app.shortName` ในไฟล์ภาษาของตัวเอง
 *    (ห้ามคืน `''` เพราะกล่องจะกลายเป็นสี่เหลี่ยมเปล่าที่ดูเหมือนรูปโหลดไม่ขึ้น)
 */
export function systemNameInitials(name: string | null | undefined): string | null {
  const text = (name ?? '').trim();
  if (text.length === 0) return null;
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 1) return words[0].slice(0, 2);
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join('');
}

function trimToNull(value: string | null): string | null {
  const text = (value ?? '').trim();
  return text.length > 0 ? text : null;
}
