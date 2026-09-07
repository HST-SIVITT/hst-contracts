/** Master เวลานัดหมาย Tele (`REQ-SET-025` · `CR-013`) */
export interface TimeSlotView {
  id: string;
  /** เวลาไทยแบบ 24 ชั่วโมง `HH:mm` */
  time: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const TIME_SLOT_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
