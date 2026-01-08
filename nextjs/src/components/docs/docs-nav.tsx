"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quick Start", href: "/docs/quick-start" },
      { title: "Project Structure", href: "/docs/project-structure" },
    ],
  },
  {
    title: "Core Features",
    items: [
      { title: "Authentication", href: "/docs/authentication" },
      { title: "Database", href: "/docs/database" },
      { title: "API Routes", href: "/docs/api-routes" },
      { title: "Background Jobs", href: "/docs/background-jobs" },
    ],
  },
  {
    title: "Payments",
    items: [
      { title: "Stripe Setup", href: "/docs/stripe-setup" },
      { title: "Subscriptions", href: "/docs/subscriptions" },
      { title: "Webhooks", href: "/docs/webhooks" },
    ],
  },
  {
    title: "Deployment",
    items: [
      { title: "Environment Variables", href: "/docs/environment-variables" },
      { title: "Docker", href: "/docs/docker" },
      { title: "Production", href: "/docs/production" },
    ],
  },
];

export function DocsNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-24 space-y-8">
      {navigation.map((section) => (
        <div key={section.title}>
          <h4 className="font-semibold text-sm mb-3">{section.title}</h4>
          <ul className="space-y-2">
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block text-sm py-1 transition-colors",
                    pathname === item.href
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
