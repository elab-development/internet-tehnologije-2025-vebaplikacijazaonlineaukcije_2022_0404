export function formatMoney(value) {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(n);
}

export function parseLaravelDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return null;

  const isoLike = value.includes('T') ? value : value.replace(' ', 'T');
  const d = new Date(isoLike);

  if (!Number.isNaN(d.getTime())) return d;

  const m = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!m) return null;
  const [, y, mo, da, h, mi, s = '0'] = m;
  return new Date(
    Number(y),
    Number(mo) - 1,
    Number(da),
    Number(h),
    Number(mi),
    Number(s),
  );
}

export function formatDate(value) {
  const d = parseLaravelDate(value);
  if (!d) return value ? String(value) : '—';
  return d.toLocaleString();
}

export function toLocalDatetimeValue(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
