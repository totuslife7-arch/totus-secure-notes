/**
 * Best-effort drop of a sensitive string reference.
 * JavaScript strings are immutable; this only clears the caller's reference.
 */
export function releaseStringRef(_value: string | null | undefined): void {
  // Intentionally empty — callers should assign null after calling.
}
