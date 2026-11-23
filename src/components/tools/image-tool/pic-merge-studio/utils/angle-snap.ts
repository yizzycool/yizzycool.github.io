/**
 * Normalize an angle in degrees into the [0, 360) range.
 */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Compute the signed shortest angular delta between two angles in degrees (-180, 180].
 * Prevents sudden jumps when multi-touch rotation crosses +/-180 degrees.
 */
export function shortestAngleDelta(fromDeg: number, toDeg: number): number {
  let delta = toDeg - fromDeg;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

/**
 * Snap a raw rotation angle to the nearest multiple of `snapAngle`
 * when within `snapThreshold` degrees. Returns a normalized [0, 360) angle.
 */
export function applyAngleSnap(
  rawAngle: number,
  snapAngle: number | undefined,
  snapThreshold: number | undefined
): number {
  if (!snapAngle || snapAngle <= 0 || !snapThreshold || snapThreshold <= 0) {
    return normalizeAngle(rawAngle);
  }

  const nearest = Math.round(rawAngle / snapAngle) * snapAngle;
  if (Math.abs(rawAngle - nearest) <= snapThreshold) {
    return normalizeAngle(nearest);
  }

  return normalizeAngle(rawAngle);
}
