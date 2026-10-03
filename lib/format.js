const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_SHORT = MONTHS.map((month) => month.slice(0, 3));

// Dates are stored as plain "YYYY-MM-DD" strings so they never shift when a
// browser and a server disagree about timezones. Parse them at UTC midnight.
function toDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function formatDate(iso, { withYear = true } = {}) {
  if (!isIsoDate(iso)) return iso ?? "";
  const date = toDate(iso);
  const base = `${MONTHS[date.getUTCMonth()].slice(0, 3)} ${date.getUTCDate()}`;
  return withYear ? `${base}, ${date.getUTCFullYear()}` : base;
}

export function formatDateLong(iso) {
  if (!isIsoDate(iso)) return iso ?? "";
  const date = toDate(iso);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function formatMonthYear(iso) {
  if (!isIsoDate(iso)) return iso ?? "";
  const date = toDate(iso);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatMonthShort(iso) {
  if (!isIsoDate(iso)) return iso ?? "";
  return MONTHS_SHORT[toDate(iso).getUTCMonth()];
}

export function formatDateRange(startIso, endIso) {
  if (!startIso || !endIso) return "";
  const start = toDate(startIso);
  const end = toDate(endIso);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) {
    return `${MONTHS[end.getUTCMonth()].slice(0, 3)} ${start.getUTCDate()} – ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
  }

  if (sameYear) {
    return `${MONTHS_SHORT[start.getUTCMonth()]} ${start.getUTCDate()} – ${MONTHS_SHORT[end.getUTCMonth()]} ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
  }

  return `${formatDate(startIso)} – ${formatDate(endIso)}`;
}

export function formatDuration(minutes) {
  if (minutes == null || Number.isNaN(minutes)) return "—";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (rest === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
  return `${hours}h ${rest}m`;
}

export function formatSigned(value, suffix = "") {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = Math.round(value * 10) / 10;
  if (rounded > 0) return `+${rounded}${suffix}`;
  return `${rounded}${suffix}`;
}

export function roundTo(value, places = 1) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function addDays(iso, amount) {
  const date = toDate(iso);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(startIso, endIso) {
  const start = toDate(startIso).getTime();
  const end = toDate(endIso).getTime();
  return Math.round((end - start) / 86400000);
}

export function eachDayOfRange(startIso, endIso) {
  const days = [];
  let cursor = startIso;
  let guard = 0;

  while (cursor <= endIso && guard < 1000) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }

  return days;
}