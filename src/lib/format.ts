/** Format a price string/number as SAR currency in Arabic */
export function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
  }).format(num);
}

/** Format an ISO date string in Arabic locale */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** تقسيم رقم العضوية (16 خانة) إلى مجموعات 4×4 */
export function formatMembershipNumber(num: string): string {
  const digits = num.replace(/\D/g, "");
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** صيغة MM/YY من تاريخ ISO (YYYY-MM-DD) */
export function formatExpiry(iso: string): string {
  const [y, m] = iso.split("-");
  if (!y || !m) return "";
  return `${m}/${y.slice(2)}`;
}
