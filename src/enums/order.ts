/**
 * สถานะระดับใบงาน (Order) — DOM-02 §2.2 · REQ-ORD-020 [MUST]
 * ⚠️ ห้ามเพิ่ม/แก้ค่าใด ๆ โดยไม่แก้ docs/10-domain/02-order-state-machine.md ก่อน
 */
export const OrderStatus = {
  PENDING_APPOINTMENT: 'PENDING_APPOINTMENT',
  APPOINTED: 'APPOINTED',
  READY_TO_DISPATCH: 'READY_TO_DISPATCH',
  DELIVERED: 'DELIVERED',
  AWAITING_PICKUP: 'AWAITING_PICKUP',
  COLLECTED: 'COLLECTED',
  RETURNED_TO_STOCK: 'RETURNED_TO_STOCK',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  /** derived เท่านั้น — ไม่เคยถูกเขียนลง `orders.status` (ADR-003) */
  NO_ACTION: 'NO_ACTION',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

/** ค่าที่อนุญาตให้เก็บลงคอลัมน์ `orders.status` จริง (ตัด NO_ACTION ออก — ADR-003) */
export const PERSISTED_ORDER_STATUSES = [
  OrderStatus.PENDING_APPOINTMENT,
  OrderStatus.APPOINTED,
  OrderStatus.READY_TO_DISPATCH,
  OrderStatus.DELIVERED,
  OrderStatus.AWAITING_PICKUP,
  OrderStatus.COLLECTED,
  OrderStatus.RETURNED_TO_STOCK,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
] as const;
export type PersistedOrderStatus = (typeof PERSISTED_ORDER_STATUSES)[number];

/** แหล่งที่มาของ link consult — DOM-04 §4.5 */
export const TeleLinkSource = {
  AUTO: 'AUTO',
  EXTERNAL: 'EXTERNAL',
} as const;
export type TeleLinkSource = (typeof TeleLinkSource)[keyof typeof TeleLinkSource];

/** สถานะปลายทาง — เปลี่ยนต่อไม่ได้อีก */
export const TERMINAL_ORDER_STATUSES = [OrderStatus.COMPLETED, OrderStatus.CANCELLED] as const;

/** กลุ่มสถานะสำหรับ drill-down จาก Dashboard โดยไม่สร้างสถานะใหม่ในฐานข้อมูล (`T-090`) */
export const OrderStatusGroup = {
  IN_PROGRESS: 'IN_PROGRESS',
} as const;
export type OrderStatusGroup = (typeof OrderStatusGroup)[keyof typeof OrderStatusGroup];

/** นิยาม KPI “กำลังดำเนินการ” = สถานะลำดับ 3–7 ตาม FT-12 */
export const IN_PROGRESS_ORDER_STATUSES = [
  OrderStatus.READY_TO_DISPATCH,
  OrderStatus.DELIVERED,
  OrderStatus.AWAITING_PICKUP,
  OrderStatus.COLLECTED,
  OrderStatus.RETURNED_TO_STOCK,
] as const;

/** สถานะที่ต้องปกปิดข้อมูลคนไข้ใน LIFF — REQ-LIF-023.4 / REQ-SEC-012 [MUST] */
export const MASKED_ORDER_STATUSES = TERMINAL_ORDER_STATUSES;

/**
 * ตารางการเปลี่ยนสถานะ — DOM-02 §2.4 · REQ-ORD-023 [MUST]
 * ใช้เป็นแหล่งความจริงเดียวของทั้ง API guard และการ enable ปุ่มฝั่ง UI
 */
export const ORDER_STATUS_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  PENDING_APPOINTMENT: [OrderStatus.APPOINTED, OrderStatus.CANCELLED],
  APPOINTED: [OrderStatus.READY_TO_DISPATCH, OrderStatus.CANCELLED],
  READY_TO_DISPATCH: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  DELIVERED: [OrderStatus.AWAITING_PICKUP, OrderStatus.CANCELLED],
  AWAITING_PICKUP: [OrderStatus.COLLECTED, OrderStatus.CANCELLED],
  COLLECTED: [OrderStatus.RETURNED_TO_STOCK, OrderStatus.CANCELLED],
  RETURNED_TO_STOCK: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
  NO_ACTION: [],
} as const;

/** บทบาทผู้รับงาน — DOM-02 §2.5 */
export const AssignmentRole = {
  RIDER_OUTBOUND: 'RIDER_OUTBOUND',
  RIDER_INBOUND: 'RIDER_INBOUND',
  TECHNICIAN: 'TECHNICIAN',
} as const;
export type AssignmentRole = (typeof AssignmentRole)[keyof typeof AssignmentRole];

/** สถานะระดับผู้รับงาน — DOM-02 §2.5 · REQ-DOM-021 [MUST] */
export const AssignmentStatus = {
  NOT_ASSIGNED: 'NOT_ASSIGNED',
  PENDING_ACCEPT: 'PENDING_ACCEPT',
  ACCEPTED: 'ACCEPTED',
  CANCELLED: 'CANCELLED',
} as const;
export type AssignmentStatus = (typeof AssignmentStatus)[keyof typeof AssignmentStatus];

/** ผู้ชมของ label สถานะ — ADR-005 (Technician เห็น DELIVERED เป็น "รอทำ Tele") */
export const StatusAudience = {
  ADMIN: 'ADMIN',
  PATIENT: 'PATIENT',
  RIDER: 'RIDER',
  TECHNICIAN: 'TECHNICIAN',
} as const;
export type StatusAudience = (typeof StatusAudience)[keyof typeof StatusAudience];

/** ผู้ก่อให้เกิดการเปลี่ยนสถานะ — DOM-04 §4.6 */
export const ActorType = {
  SYSTEM_USER: 'SYSTEM_USER',
  RIDER: 'RIDER',
  TECHNICIAN: 'TECHNICIAN',
  SYSTEM: 'SYSTEM',
} as const;
export type ActorType = (typeof ActorType)[keyof typeof ActorType];

/**
 * ชนิดของผู้รับงานใน `order_assignments.assignee_type` — DOM-01 §D2
 * (คู่ขนานกับ `line_accounts.owner_type` ที่มี `PATIENT` เพิ่มมาอีกค่า — ใบงานไม่ assign คนไข้)
 */
export const AssigneeType = {
  RIDER: 'RIDER',
  TECHNICIAN: 'TECHNICIAN',
} as const;
export type AssigneeType = (typeof AssigneeType)[keyof typeof AssigneeType];

/** บทบาทในใบงาน → ชนิดของผู้รับงาน — ห้ามเดาเอง ใช้ตัวนี้ที่เดียว */
export function assigneeTypeForRole(role: AssignmentRole): AssigneeType {
  return role === AssignmentRole.TECHNICIAN ? AssigneeType.TECHNICIAN : AssigneeType.RIDER;
}

/** กติกาของ 1 ช่องในตาราง DOM-02 §2.4 — "ใครทำได้" + "ต้องมีอะไร" */
export interface OrderTransitionRule {
  /** Admin (system_user ที่มีสิทธิ์ `orders = MAINTAIN`) ทำได้หรือไม่ */
  readonly admin: boolean;
  /** บทบาทใน `order_assignments` ที่ทำได้ — ว่าง = ไม่มีใครนอกจาก Admin */
  readonly assignmentRoles: readonly AssignmentRole[];
  /** REQ-ORD-024 — ยกเลิกต้องกรอกหมายเหตุเสมอ */
  readonly noteRequired: boolean;
}

const CANCEL_RULE: OrderTransitionRule = {
  admin: true,
  assignmentRoles: [
    AssignmentRole.RIDER_OUTBOUND,
    AssignmentRole.RIDER_INBOUND,
    AssignmentRole.TECHNICIAN,
  ],
  noteRequired: true,
};

const ADMIN_ONLY: OrderTransitionRule = { admin: true, assignmentRoles: [], noteRequired: false };

const withRoles = (...roles: AssignmentRole[]): OrderTransitionRule => ({
  admin: true,
  assignmentRoles: roles,
  noteRequired: false,
});

/**
 * ⭐ ตารางการเปลี่ยนสถานะพร้อม "ใครทำได้" — DOM-02 §2.4 · REQ-ORD-023 [MUST]
 *
 * เป็นแหล่งความจริงเดียวของทั้ง API (`OrderStateMachine`) และการ enable ปุ่มฝั่ง CMS/LIFF
 * (`REQ-LIF-021/022`) — **ห้ามเขียนกติกาใหม่ที่อื่น**
 *
 * ⚠️ ต้องสอดคล้องกับ `ORDER_STATUS_TRANSITIONS` เสมอ (มีเทสต์ใน `hst-api/test/contracts.spec.ts` ดักไว้)
 */
export const ORDER_TRANSITION_RULES: Readonly<
  Record<PersistedOrderStatus, Readonly<Partial<Record<PersistedOrderStatus, OrderTransitionRule>>>>
> = {
  PENDING_APPOINTMENT: {
    [OrderStatus.APPOINTED]: ADMIN_ONLY,
    [OrderStatus.CANCELLED]: CANCEL_RULE,
  },
  APPOINTED: {
    [OrderStatus.READY_TO_DISPATCH]: ADMIN_ONLY,
    [OrderStatus.CANCELLED]: CANCEL_RULE,
  },
  READY_TO_DISPATCH: {
    [OrderStatus.DELIVERED]: withRoles(AssignmentRole.RIDER_OUTBOUND),
    [OrderStatus.CANCELLED]: CANCEL_RULE,
  },
  DELIVERED: {
    [OrderStatus.AWAITING_PICKUP]: withRoles(AssignmentRole.TECHNICIAN),
    [OrderStatus.CANCELLED]: CANCEL_RULE,
  },
  AWAITING_PICKUP: {
    [OrderStatus.COLLECTED]: withRoles(AssignmentRole.RIDER_INBOUND),
    [OrderStatus.CANCELLED]: CANCEL_RULE,
  },
  COLLECTED: {
    [OrderStatus.RETURNED_TO_STOCK]: withRoles(AssignmentRole.RIDER_INBOUND),
    [OrderStatus.CANCELLED]: CANCEL_RULE,
  },
  RETURNED_TO_STOCK: {
    /** ✅ Q-005 — ปิดงานเป็น "สำเร็จ" ได้เฉพาะ Admin · LIFF ต้องไม่มีปุ่มนี้เลย */
    [OrderStatus.COMPLETED]: ADMIN_ONLY,
    [OrderStatus.CANCELLED]: CANCEL_RULE,
  },
  COMPLETED: {},
  CANCELLED: {},
} as const;

/**
 * ⭐ เส้นทางหลักของใบงาน (happy path) — `REQ-ORD-014` [MUST]
 * "หน้า view ต้องแสดง **journey สถานะของ order ไว้บนสุด** เพื่อให้เข้าใจว่าตอนนี้อยู่ขั้นตอนไหน"
 *
 * **derive จาก `ORDER_STATUS_TRANSITIONS`** โดยเดินตามปลายทางที่ไม่ใช่ `CANCELLED` ไปเรื่อย ๆ
 * → เพิ่ม/ย้ายสถานะในตารางเดียว แล้ว journey ขยับตามเอง (ไม่มีลำดับสถานะเขียนซ้ำที่ไหนอีก · ADR-035)
 *
 * ⚠️ `CANCELLED` ไม่อยู่ในเส้นทางนี้เพราะแตกออกได้จากทุกขั้น — UI ต้องแสดงแยกเมื่อใบงานถูกยกเลิก
 */
export const ORDER_STATUS_JOURNEY: readonly PersistedOrderStatus[] = (() => {
  const steps: PersistedOrderStatus[] = [];
  let current: PersistedOrderStatus | undefined = OrderStatus.PENDING_APPOINTMENT;
  while (current && !steps.includes(current)) {
    steps.push(current);
    current = ORDER_STATUS_TRANSITIONS[current].find(
      (next): next is PersistedOrderStatus => next !== OrderStatus.CANCELLED,
    );
  }
  return steps;
})();

/**
 * ตอนนี้ใบงานอยู่ขั้นที่เท่าไรของ journey — `-1` เมื่อสถานะไม่อยู่บนเส้นทางหลัก (เช่น `CANCELLED`)
 * `NO_ACTION` เป็น derived ของ `APPOINTED` จึงชี้ไปขั้นเดียวกัน (ADR-003)
 */
export function orderJourneyIndex(status: OrderStatus): number {
  const persisted = status === OrderStatus.NO_ACTION ? OrderStatus.APPOINTED : status;
  return ORDER_STATUS_JOURNEY.indexOf(persisted as PersistedOrderStatus);
}

/** สถานะนี้เปลี่ยนต่อไม่ได้อีกแล้วหรือยัง — DOM-02 §2.4 */
export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return (TERMINAL_ORDER_STATUSES as readonly OrderStatus[]).includes(status);
}

/** กติกาของ transition นี้ (undefined = ทำไม่ได้เลย ไม่ว่าใครก็ตาม) */
export function orderTransitionRule(
  from: PersistedOrderStatus,
  to: PersistedOrderStatus,
): OrderTransitionRule | undefined {
  return ORDER_TRANSITION_RULES[from]?.[to];
}

/**
 * REQ-ORD-011 [MUST] — radio ของช่องค้นหาในหน้า list ใบงาน
 * "ค้นหาตาม ชื่อ / HN / เบอร์โทร พร้อม radio เลือกว่าจะค้นหาจากข้อมูลของ คนไข้ / ไรเดอร์ / Technician"
 * (HN มีเฉพาะคนไข้ — ไรเดอร์/Technician ค้นด้วยชื่อกับเบอร์โทรเท่านั้น)
 */
export const OrderSearchTarget = {
  PATIENT: 'PATIENT',
  RIDER: 'RIDER',
  TECHNICIAN: 'TECHNICIAN',
} as const;
export type OrderSearchTarget = (typeof OrderSearchTarget)[keyof typeof OrderSearchTarget];

export const ORDER_SEARCH_TARGETS = Object.values(
  OrderSearchTarget,
) as readonly OrderSearchTarget[];

export const DEFAULT_ORDER_SEARCH_TARGET: OrderSearchTarget = OrderSearchTarget.PATIENT;

/**
 * REQ-ORD-017 [MUST] — เรียงลำดับได้ 4 แบบเท่านั้น (ห้ามเปิดเป็นช่อง sort อิสระ)
 * ชื่อคอลัมน์จริงอยู่ฝั่ง API — ที่นี่เก็บแค่ "ตัวเลือกที่ผู้ใช้เลือกได้" เพื่อให้ UI กับ API ตรงกัน
 */
export const OrderListSort = {
  CREATED_DESC: 'CREATED_DESC',
  CREATED_ASC: 'CREATED_ASC',
  APPOINTMENT_DESC: 'APPOINTMENT_DESC',
  APPOINTMENT_ASC: 'APPOINTMENT_ASC',
} as const;
export type OrderListSort = (typeof OrderListSort)[keyof typeof OrderListSort];

export const ORDER_LIST_SORTS = Object.values(OrderListSort) as readonly OrderListSort[];

export const DEFAULT_ORDER_LIST_SORT: OrderListSort = OrderListSort.CREATED_DESC;

/**
 * FT-09 §B · `REQ-ORD-040/043` [MUST] — ชนิดของ entity ที่ popup selector ในฟอร์มใบงานเลือกได้
 * (คนไข้ / ไรเดอร์ / Technician / อุปกรณ์) — ใช้ร่วมกันทั้ง API `GET /orders/picker-options` และ CMS
 */
export const OrderPickerTarget = {
  PATIENT: 'PATIENT',
  RIDER: 'RIDER',
  TECHNICIAN: 'TECHNICIAN',
  EQUIPMENT: 'EQUIPMENT',
} as const;
export type OrderPickerTarget = (typeof OrderPickerTarget)[keyof typeof OrderPickerTarget];

export const ORDER_PICKER_TARGETS = Object.values(
  OrderPickerTarget,
) as readonly OrderPickerTarget[];
