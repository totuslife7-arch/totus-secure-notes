/** Overwrite sensitive Uint8Array contents before releasing references. */
export function zeroize(buffer: Uint8Array | null | undefined): void {
  if (!buffer) {
    return;
  }
  buffer.fill(0);
}
