import type { AnnotationPoint } from './types';

export const PALM_REJECTION_COOLDOWN_MS = 780;
const PALM_MIN_CONTACT_PX = 22;

export interface PointerGateEventLike {
  pointerType: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
}

/**
 * Evaluates whether an incoming `pointerdown` should be ignored due to:
 * 1) `pencilOnlyMode` enabled (rejects `touch` contacts so fingers pan/zoom normally), or
 * 2) Automatic Smart Palm Rejection (rejects broad palm contacts or touches arriving
 *    while/shortly after stylus activity).
 */
export function shouldIgnoreTouchForPalmOrPencilOnly(
  e: PointerGateEventLike,
  pencilOnlyMode: boolean,
  lastPenActivityAtMs: number,
  hasActivePenPointer: boolean,
  nowMs = performance.now()
): boolean {
  if (e.pointerType !== 'touch') {
    return false;
  }
  if (pencilOnlyMode) {
    return true;
  }
  if (hasActivePenPointer) {
    return true;
  }
  const w = e.width ?? 0;
  const h = e.height ?? 0;
  if (w >= PALM_MIN_CONTACT_PX || h >= PALM_MIN_CONTACT_PX) {
    return true;
  }
  if (lastPenActivityAtMs > 0 && nowMs - lastPenActivityAtMs < PALM_REJECTION_COOLDOWN_MS) {
    return true;
  }
  return false;
}

export interface StylusSampleLike {
  pointerType: string;
  pressure: number;
  tiltX?: number;
  tiltY?: number;
}

export function buildStylusPointMeta(
  ev: StylusSampleLike
): Pick<AnnotationPoint, 'pressure' | 'tiltX' | 'tiltY'> {
  if (ev.pointerType !== 'pen') {
    return { pressure: 0.5 };
  }
  const pressure = ev.pressure > 0 ? ev.pressure : 0.5;
  const tx = typeof ev.tiltX === 'number' && Number.isFinite(ev.tiltX) ? Math.round(ev.tiltX) : 0;
  const ty = typeof ev.tiltY === 'number' && Number.isFinite(ev.tiltY) ? Math.round(ev.tiltY) : 0;
  if (tx !== 0 || ty !== 0) {
    return { pressure, tiltX: tx, tiltY: ty };
  }
  return { pressure };
}
