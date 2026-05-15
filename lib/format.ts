export function formatDate(date?: Date | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Utkast",
    planned: "Planerad",
    active: "Aktiv",
    completed: "Avslutad",
  };

  return labels[status] ?? status;
}
