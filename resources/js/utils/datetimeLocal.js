/** Browser IANA timezone label (e.g. Asia/Karachi). */
export function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Convert stored UTC datetime from server to <input type="datetime-local"> value. */
export function toDatetimeLocalValue(value) {
  if (!value) return '';

  const str = String(value).trim();

  // Pure datetime-local shape from the input itself (no seconds / timezone)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
    return str;
  }

  let iso = str;
  if (iso.includes(' ') && !iso.includes('T')) {
    iso = iso.replace(' ', 'T');
  }

  // Laravel/MySQL UTC values often omit "Z" — treat as UTC, not local wall clock
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso)) {
    iso = `${iso}Z`;
  }

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert datetime-local picker value to UTC ISO for the server. */
export function datetimeLocalToUtcIso(localValue) {
  if (!localValue) return null;

  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return null;

  return d.toISOString();
}

/** Human-readable label for datetime-local or ISO values. */
export function formatScheduleLabel(value) {
  if (!value) return null;

  const str = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  let iso = str;
  if (iso.includes(' ') && !iso.includes('T')) {
    iso = iso.replace(' ', 'T');
  }
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso)) {
    iso = `${iso}Z`;
  }

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
