/**
 * master data "จุดรับ" — `Q-051` (ตอบแล้ว 2026-09-04 · ข้อ 3) · `REQ-ORD-003`
 *
 * เดิมชื่อ/ที่อยู่/เบอร์ของจุดรับถูกฝังเป็นข้อความในแม่แบบ `job.newRider` (migration `0024`)
 * ซึ่งใช้ได้แค่ตอนมีจุดรับแห่งเดียว · เจ้าของงานเลือกให้เป็น master data แล้ว **เลือกต่อใบงาน**
 * การ์ด Flex จึงอ่านจุดรับจาก `orders.pickup_location_id` ไม่ใช่จากแม่แบบอีกต่อไป
 *
 * เมนูอยู่ใต้ "ตั้งค่า" จึงใช้ permission subject `settings` เหมือน `positions` / `equipment-models`
 * (แนวเดียวกับคำตอบ `Q-034`)
 */
export interface PickupLocationView {
  id: string;
  /** ชื่อสถานที่/โรงพยาบาล ที่ขึ้นบนการ์ด Flex */
  name: string;
  address: string;
  phone: string;
  note: string | null;
  /** จำนวนใบงานที่อ้างจุดรับนี้ — ใช้ทั้งแสดงในตารางและอธิบายเหตุผลตอนลบไม่ได้ */
  orderCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/** ตัวเลือกใน dropdown ของฟอร์มใบงาน — ตัดให้เหลือเท่าที่การ์ดต้องใช้ */
export interface PickupLocationOption {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export const PICKUP_LOCATION_NAME_MAX = 150;
export const PICKUP_LOCATION_ADDRESS_MAX = 500;
export const PICKUP_LOCATION_PHONE_MAX = 50;
export const PICKUP_LOCATION_NOTE_MAX = 2_000;
