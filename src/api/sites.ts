/**
 * DTO ของ Center Console (project `center`) — `REQ-CTR-001`
 * center-api และ center-web ใช้ไฟล์นี้ร่วมกัน ห้ามประกาศ shape ซ้ำในฝั่งใดฝั่งหนึ่ง
 */
import type { SiteStatus } from '../enums/site';

export interface SiteDomainDto {
  id: string;
  host: string;
  isPrimary: boolean;
}

export interface SiteDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  status: SiteStatus;
  timezone: string;
  storagePrefix: string;
  domains: SiteDomainDto[];
  createdAt: string;
  updatedAt: string;
}

/** ผู้ใช้คนแรกของ site — center สร้างให้พร้อมกับ site (`REQ-CTR-004`) */
export interface SiteFirstAdminInput {
  username: string;
  firstName: string;
  lastName: string;
  /** ไม่ส่ง = center สุ่มให้แล้วคืนกลับมาครั้งเดียวใน `CreateSiteResult.temporaryPassword` */
  password?: string;
}

export interface CreateSiteInput {
  code: string;
  nameTh: string;
  nameEn: string;
  timezone?: string;
  hosts: string[];
  firstAdmin: SiteFirstAdminInput;
}

export interface UpdateSiteInput {
  nameTh?: string;
  nameEn?: string;
  status?: SiteStatus;
  timezone?: string;
  hosts?: string[];
}

export interface CreateSiteResult {
  site: SiteDto;
  /** แสดงครั้งเดียวตอนสร้างเสร็จ — ระบบไม่เก็บ plaintext (`REQ-CTR-005`) */
  temporaryPassword: string;
}

/** ผู้ดูแลระดับแพลตฟอร์ม (คนละชุดกับ `system_users` ของแต่ละ site) — `REQ-CTR-002` */
export interface PlatformUserDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  mustChangePassword: boolean;
}
