"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function RouteChangeTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (GA_MEASUREMENT_ID && typeof window.gtag === "function") {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path:
          pathname + (searchParams?.toString() ? `?${searchParams}` : ""),
      });
    }
  }, [pathname, searchParams]);

  return null;
}

function RouteChangeTracker() {
  return (
    <Suspense fallback={null}>
      <RouteChangeTrackerInner />
    </Suspense>
  );
}

export function GoogleAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!GA_MEASUREMENT_ID) {
    return <>{children}</>;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(
            GA_MEASUREMENT_ID,
          )}, { send_page_view: false });
        `}
      </Script>
      <RouteChangeTracker />
      {children}
    </>
  );
}
