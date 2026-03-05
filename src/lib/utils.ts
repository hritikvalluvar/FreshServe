export const AREA_LABELS: Record<string, string> = {
  NT: "New Township",
  OT: "Old Township",
  KK: "Khora Kheri",
};

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
