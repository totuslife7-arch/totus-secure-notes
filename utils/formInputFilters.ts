/** Strip non-digit characters — useful after voice dictation on numeric fields. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Parse m/d/yyyy or m/d/yy to display as m/d/yyyy. Returns original if unparseable. */
export function formatDeliveryDateMdY(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const parts = trimmed.split(/[/\-.]/).map((p) => p.trim());
  if (parts.length !== 3) {
    return trimmed;
  }

  let month = parseInt(parts[0], 10);
  let day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);

  if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) {
    return trimmed;
  }

  if (year < 100) {
    year += year >= 70 ? 1900 : 2000;
  }

  return `${month}/${day}/${year}`;
}

export function parseDateMdY(value: string): Date | null {
  const formatted = formatDeliveryDateMdY(value);
  const parts = formatted.split('/');
  if (parts.length !== 3) {
    return null;
  }

  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) {
    return null;
  }

  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  return date;
}
