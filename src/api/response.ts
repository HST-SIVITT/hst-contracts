import type { ErrorCode } from './errors';

/** TEC-03 §3.2 */
export interface ApiMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  traceId: string;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: ApiMeta;
  traceId: string;
}

export interface ApiErrorBody {
  code: ErrorCode | string;
  messageKey: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
  traceId: string;
}

/** TEC-03 §3.3 · REQ-NFR-002 [MUST] — ค่า default อ่านจาก settings ห้าม hardcode */
export const PAGINATION_OPTIONS = [20, 50, 100] as const;
export type PaginationOption = (typeof PAGINATION_OPTIONS)[number];

export function isPaginationOption(value: number): value is PaginationOption {
  return (PAGINATION_OPTIONS as readonly number[]).includes(value);
}

/** ค่าเรียงลำดับที่รองรับใน orders — TEC-03 §3.4 · REQ-ORD-017 */
export const ORDER_SORT_VALUES = [
  '-createdAt',
  'createdAt',
  '-teleAppointmentAt',
  'teleAppointmentAt',
] as const;
export type OrderSort = (typeof ORDER_SORT_VALUES)[number];

/** header ที่ LIFF ต้องส่ง LINE ID token มาให้ server verify ทุกครั้ง — TEC-03 §3.1 */
export const LINE_ID_TOKEN_HEADER = 'x-line-id-token';
export const API_BASE_PATH = '/api/v1';
