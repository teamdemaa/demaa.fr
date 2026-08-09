export function formatLiveSessionDate(startsAt: string) {
  const date = new Date(startsAt);
  const day = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Paris",
  })
    .format(date)
    .replace(":", "h");

  return `${day} à ${time}`;
}
