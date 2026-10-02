import type { AuthConfig } from "convex/server";

// Trusts JWTs issued by this app's Clerk instance. CLERK_JWT_ISSUER_DOMAIN is
// the Clerk "Frontend API URL" (https://<name>.clerk.accounts.dev in dev) and
// must be set on the Convex deployment: npx convex env set CLERK_JWT_ISSUER_DOMAIN <url>
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
