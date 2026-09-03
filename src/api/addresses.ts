/**
 * Master data ที่อยู่ไทย — REQ-INF-003 · DOM-04 §4.3 · ADR-023
 * ใช้ร่วมกันระหว่าง API (`/addresses/*`) และฟอร์มที่อยู่ฝั่ง web
 */

/** ความยาวคำค้นขั้นต่ำของช่องค้นหาที่อยู่ — สั้นกว่านี้ผลลัพธ์กว้างเกินจะช่วยผู้ใช้ */
export const ADDRESS_SEARCH_MIN_LENGTH = 2;

/** จำนวนผลลัพธ์ของช่องค้นหาที่อยู่ (REQ-PAT-005a) — เป็นเพดานของ dropdown ไม่ใช่ pagination */
export const ADDRESS_SEARCH_DEFAULT_LIMIT = 20;
export const ADDRESS_SEARCH_MAX_LIMIT = 50;

/** หนึ่งระดับของ cascade dropdown (จังหวัด / อำเภอ / ตำบล) */
export interface AddressOption {
  id: string;
  nameTh: string;
  nameEn: string;
}

/** ตำบลมีรหัสไปรษณีย์ติดมาด้วยเสมอ เพื่อ auto-fill ช่องรหัสไปรษณีย์ (DOM-04 §4.3) */
export interface SubdistrictOption extends AddressOption {
  postcode: string;
}

/** ผลลัพธ์ของช่องค้นหาเดียว — เติมที่อยู่ได้ครบชุดจากแถวเดียว (REQ-PAT-005a) */
export interface AddressSearchResult {
  subdistrictId: string;
  subdistrictNameTh: string;
  subdistrictNameEn: string;
  districtId: string;
  districtNameTh: string;
  districtNameEn: string;
  provinceId: string;
  provinceNameTh: string;
  provinceNameEn: string;
  postcode: string;
}
