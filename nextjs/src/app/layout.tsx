import {
  SITE_BASE_DOMAIN,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/constants";
import { Metadata, Viewport } from "next";
import { inter, robotoMono, spectral } from "./fonts";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: {
    template: `%s • ${SITE_NAME}`,
    default: `${SITE_NAME} • ${SITE_TAGLINE}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  // TODO: update the keywords with relevant keywords for the project
  keywords: [
    "saas template",
    "saas boilerplate",
    "nextjs django",
    "fullstack template",
    "stripe integration",
    "authentication boilerplate",
    "nextjs starter kit",
    "django rest framework",
    "tailwind template",
    "shadcn ui",
    "docker compose",
    "celery redis",
    "subscription billing",
    "aws deployment",
    "typescript react",
    "postgresql",
    "saas starter",
  ],
  authors: [{ name: `${SITE_NAME}` }],
  creator: `${SITE_NAME}`,
  publisher: `${SITE_NAME}`,
  metadataBase: new URL(SITE_BASE_DOMAIN),
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/assets/img/favicon.png",
    shortcut: "/assets/img/favicon.png",
    apple: "/assets/img/apple_touch_icon.png",
  },
  appleWebApp: {
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  manifest: `${SITE_BASE_DOMAIN}/manifest.json`,
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} • ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: {
      url: `${SITE_BASE_DOMAIN}/assets/img/social.png`,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className="antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: SITE_BASE_DOMAIN,
              name: SITE_NAME,
              description: SITE_DESCRIPTION,
              foundingDate: "2024",
              logo: "/public/assets/img/logos/logo.png",
              // TODO: update social media links
              sameAs: ["https://www.linkedin.com/company/nov"],
            }),
          }}
        />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`w-screen bg-background font-sans min-h-screen ${inter.variable} ${robotoMono.variable} ${spectral.variable}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
