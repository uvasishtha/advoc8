import { LoadingScreen } from "@/components/loading/LoadingScreen";

/**
 * Route-level loading UI for every page in the app.
 * Next.js renders this automatically while a route is loading.
 */
export default function Loading() {
  return <LoadingScreen />;
}
