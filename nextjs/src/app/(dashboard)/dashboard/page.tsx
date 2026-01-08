"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  RiCheckLine,
  RiErrorWarningLine,
  RiSettings4Line,
  RiBankCardLine,
} from "@remixicon/react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user?.email}</span>
                {user?.email_verified ? (
                  <RiCheckLine className="h-4 w-4 text-green-600" />
                ) : (
                  <RiErrorWarningLine className="h-4 w-4 text-yellow-600" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Member since
              </span>
              <span className="text-sm font-medium">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/settings">
                <RiSettings4Line className="h-4 w-4 mr-2" />
                Account Settings
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/billing">
                <RiBankCardLine className="h-4 w-4 mr-2" />
                Manage Billing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Build Your Dashboard</CardTitle>
          <CardDescription>
            This is your application&apos;s main dashboard. Replace this card
            with your app&apos;s core functionality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Common dashboard elements include: activity feeds, analytics charts,
            recent items, quick actions, or status overviews. Customize this
            page in{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              src/app/(dashboard)/dashboard/page.tsx
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
