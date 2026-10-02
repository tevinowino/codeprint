/**
 * Points Clerk's prebuilt components at the app's own CSS variables, so the
 * sign-in/sign-up UI follows the light/dark toggle and the lime accent
 * instead of carrying a second, drifting palette.
 */
export const clerkThemeVariables = {
  colorPrimary: "var(--primary)",
  colorPrimaryForeground: "var(--primary-foreground)",
  colorBackground: "var(--card)",
  colorForeground: "var(--foreground)",
  colorMutedForeground: "var(--muted-foreground)",
  colorMuted: "var(--muted)",
  colorInput: "var(--background)",
  colorInputForeground: "var(--foreground)",
  colorNeutral: "var(--foreground)",
  colorDanger: "var(--destructive)",
  colorRing: "var(--ring)",
  colorBorder: "var(--border)",
  borderRadius: "var(--radius)",
  fontFamily: "var(--font-geist-sans)",
} as const;
