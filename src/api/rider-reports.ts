import { AssignmentRole, OrderStatus } from '../enums/order';

/** CR-027 / Q-073..076. Existing assignment roles, no new order statuses. */
export type RiderReportLeg = typeof AssignmentRole.RIDER_OUTBOUND | typeof AssignmentRole.RIDER_INBOUND;
export type RiderReportIssue = 'MISSING_RIDER' | 'UNVERIFIED_RIDER' | 'MISSING_DISTANCE' | 'MISSING_RATE' | 'UNCOMPLETED_LEG';
export interface RiderRateInput {
  name: string;
  startDate: string;
  endDate: string | null;
  outboundBase: string;
  outboundPerKm: string;
  inboundBase: string;
  inboundPerKm: string;
}
export interface RiderRateView extends RiderRateInput {
  id: string;
  used: boolean;
  lastUsedDate: string | null;
}
export interface RiderReportRow {
  orderId: string;
  orderCode: string;
  appointmentDate: string;
  orderStatus: OrderStatus;
  completedAt: string | null;
  riderId: string | null;
  riderName: string | null;
  patientName: string | null;
  address: string | null;
  leg: RiderReportLeg;
  distanceKm: string | null;
  rateId: string | null;
  rateName: string | null;
  base: string | null;
  perKm: string | null;
  amount: string | null;
  issues: RiderReportIssue[];
}
export interface RiderReportTotals {
  outboundCount: number;
  inboundCount: number;
  outboundDistanceKm: string;
  inboundDistanceKm: string;
  totalDistanceKm: string;
  outboundAmount: string;
  inboundAmount: string;
  totalAmount: string;
  pendingCount: number;
  missingDistanceCount: number;
}
export interface RiderReportSummary extends RiderReportTotals {
  riderId: string | null;
  riderName: string | null;
}
export interface RiderMonthlyReport {
  month: string;
  generatedAt: string;
  rows: RiderReportRow[];
  summaries: RiderReportSummary[];
  totals: RiderReportTotals;
  riders: { id: string; name: string }[];
}

/** Exact nonnegative hundredths, used for money AND km. Avoid floating point sums. */
export function decimalHundredths(value: string): bigint {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error('Invalid nonnegative decimal');
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}
export function hundredthsDecimal(value: bigint): string {
  if (value < 0n) throw new Error('Negative decimal');
  return `${value / 100n}.${(value % 100n).toString().padStart(2, '0')}`;
}
/** REQ-RPT-004: round HALF_UP to cents PER LEG, then sum those cents. */
export function riderLegAmount(base: string, perKm: string, distanceKm: string): string {
  const baseCents = decimalHundredths(base);
  const distancePrice = decimalHundredths(perKm) * decimalHundredths(distanceKm);
  return hundredthsDecimal(baseCents + (distancePrice + 50n) / 100n);
}

/** REQ-RPT-009: one exact totals projection for API and filtered UI/export. */
export function reportTotals(rows: RiderReportRow[]): RiderReportTotals {
  let outboundDistance = 0n, inboundDistance = 0n, outboundAmount = 0n, inboundAmount = 0n;
  let outboundCount = 0, inboundCount = 0, pendingCount = 0, missingDistanceCount = 0;
  for (const row of rows) {
    const outbound = row.leg === AssignmentRole.RIDER_OUTBOUND;
    if (outbound) outboundCount++; else inboundCount++;
    // REQ-RPT-011: cancelled rows never contribute money/km, even stale input.
    if (row.orderStatus === OrderStatus.CANCELLED) continue;
    if (row.issues.length) pendingCount++;
    if (row.distanceKm === null) missingDistanceCount++;
    else if (outbound) outboundDistance += decimalHundredths(row.distanceKm);
    else inboundDistance += decimalHundredths(row.distanceKm);
    if (row.amount !== null) {
      if (outbound) outboundAmount += decimalHundredths(row.amount);
      else inboundAmount += decimalHundredths(row.amount);
    }
  }
  return {
    outboundCount, inboundCount, pendingCount, missingDistanceCount,
    outboundDistanceKm: hundredthsDecimal(outboundDistance), inboundDistanceKm: hundredthsDecimal(inboundDistance),
    totalDistanceKm: hundredthsDecimal(outboundDistance + inboundDistance),
    outboundAmount: hundredthsDecimal(outboundAmount), inboundAmount: hundredthsDecimal(inboundAmount),
    totalAmount: hundredthsDecimal(outboundAmount + inboundAmount),
  };
}
