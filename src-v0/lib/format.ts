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
