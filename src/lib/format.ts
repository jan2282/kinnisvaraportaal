// Vormindusfunktsioonid (eesti lokaat)

const eurFormatter = new Intl.NumberFormat("et-EE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("et-EE", {
  maximumFractionDigits: 0,
});

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return "Hind kokkuleppel";
  return eurFormatter.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return numberFormatter.format(value);
}

export function formatArea(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${numberFormatter.format(value)} m²`;
}

export function formatPricePerM2(
  price: number | null | undefined,
  sizeM2: number | null | undefined
): string | null {
  if (!price || !sizeM2 || sizeM2 <= 0) return null;
  return `${eurFormatter.format(Math.round(price / sizeM2))}/m²`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("et-EE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("et-EE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "3 päeva tagasi" stiilis suhteline aeg
export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "äsja";
  if (diffMin < 60) return `${diffMin} min tagasi`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} t tagasi`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "eile";
  if (diffD < 30) return `${diffD} päeva tagasi`;
  const diffMo = Math.floor(diffD / 30);
  if (diffMo < 12) return `${diffMo} kuu tagasi`;
  return formatDate(d);
}

// Mitu päeva turul olnud
export function daysListed(value: string | Date | null | undefined): number {
  if (!value) return 0;
  const d = typeof value === "string" ? new Date(value) : value;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

export function formatDaysListed(value: string | Date | null | undefined): string {
  const days = daysListed(value);
  if (days === 0) return "Täna lisatud";
  if (days === 1) return "1 päev turul";
  return `${days} päeva turul`;
}
