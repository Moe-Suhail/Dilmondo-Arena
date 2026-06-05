export function formatNumber(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "البيانات غير متاحة حالياً";
  }

  return new Intl.NumberFormat("ar-EG").format(value);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "لم تتم المزامنة بعد";
  }

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatGap(value: number | null | undefined): string {
  if (typeof value !== "number") {
    return "البيانات غير متاحة حالياً";
  }

  if (value === 0) {
    return "لا يوجد فارق";
  }

  return `${formatNumber(value)} نقطة`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}
