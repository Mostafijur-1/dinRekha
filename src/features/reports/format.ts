export function minutesLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder.toLocaleString("bn-BD")} মিনিট`;
  if (!remainder) return `${hours.toLocaleString("bn-BD")} ঘণ্টা`;
  return `${hours.toLocaleString("bn-BD")} ঘণ্টা ${remainder.toLocaleString("bn-BD")} মিনিট`;
}

export function reportDateLabel(dateKey: string): string {
  return new Intl.DateTimeFormat("bn-BD", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateKey}T12:00:00Z`));
}
