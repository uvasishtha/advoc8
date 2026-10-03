const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  const monthLabel = MONTHS[Number(month) - 1];

  if (!year || !monthLabel || !day) {
    return date;
  }

  return `${monthLabel} ${Number(day)}, ${year}`;
}
