import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Next.js 16 renamed middleware to proxy. Everything under the (app) route
// group needs a signed-in user; the landing, sign-in and sign-up pages stay public.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/project(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|cur|heic|heif|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
