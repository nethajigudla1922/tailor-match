"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handlePageView = async () => {
      try {
        const analytics = await initAnalytics();
        if (analytics) {
          // Log standard page view event in Google/Firebase Analytics
          logEvent(analytics, "page_view", {
            page_path: pathname,
            page_title: document.title,
            page_location: window.location.href,
            page_search: searchParams?.toString() || "",
          });
          console.log(`[Firebase Analytics] Page view logged: ${pathname}`);
        }
      } catch (error) {
        console.error("[Firebase Analytics] Error logging page view:", error);
      }
    };

    handlePageView();
  }, [pathname, searchParams]);

  return null;
}

/**
 * Root component that initializes Firebase Analytics tracking for page transitions.
 * Wrapped in React Suspense to prevent Next.js static build pre-rendering failures.
 */
export default function FirebaseAnalytics() {
  // Gracefully bypass tracking on server-side rendering
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <AnalyticsTracker />
    </Suspense>
  );
}
