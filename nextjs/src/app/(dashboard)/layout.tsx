"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { VerificationBanner } from "@/components/auth/verification-banner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { RiLoader4Line } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RiLoader4Line className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <VerificationBanner />
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
