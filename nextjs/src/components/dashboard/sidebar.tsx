"use client";

import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/constants";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  RiHome4Line,
  RiBankCardLine,
  RiSettings4Line,
  RiLogoutBoxLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
} from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const links: SidebarLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <RiHome4Line className="h-5 w-5" />,
  },
  {
    href: "/dashboard/billing",
    label: "Billing",
    icon: <RiBankCardLine className="h-5 w-5" />,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <RiSettings4Line className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="font-bold">
            {SITE_NAME}
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <RiMenuUnfoldLine className="h-5 w-5" />
          ) : (
            <RiMenuFoldLine className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent",
              )}
            >
              {link.icon}
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        {!collapsed && user && (
          <div className="mb-2 truncate px-3 py-2 text-sm text-muted-foreground">
            {user.email}
          </div>
        )}
        <Button
          variant="ghost"
          className={cn("w-full justify-start", collapsed && "justify-center")}
          onClick={logout}
        >
          <RiLogoutBoxLine className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Sign out</span>}
        </Button>
      </div>
    </aside>
  );
}
