const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Formats a past timestamp as "3h ago", "yesterday", etc. */
export function formatRelativeTime(timestamp: number): string {
  const diffMs = timestamp - Date.now();
  for (const [unit, ms] of UNITS) {
    const value = Math.round(diffMs / ms);
    if (Math.abs(value) >= 1) {
      return relativeTimeFormatter.format(value, unit);
    }
  }
  return relativeTimeFormatter.format(Math.round(diffMs / 1000 / 60), "minute");
}
