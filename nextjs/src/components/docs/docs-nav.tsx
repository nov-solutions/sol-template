"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

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

  const isSectionActive = (section: NavSection) => {
    return section.items.some((item) => pathname === item.href);
  };

  return (
    <nav className="sticky top-24 space-y-1">
      {navigation.map((section) => (
        <Collapsible
          key={section.title}
          defaultOpen={isSectionActive(section)}
          className="py-1"
        >
          <CollapsibleTrigger className="text-sm font-medium py-1.5 px-2 rounded-md w-full hover:bg-muted/50 transition-colors text-foreground">
            {section.title}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-1 ml-3 border-l border-border pl-3 space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block text-sm py-1 px-2 rounded-md transition-colors",
                    pathname === item.href
                      ? "text-primary font-medium bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </nav>
  );
}
