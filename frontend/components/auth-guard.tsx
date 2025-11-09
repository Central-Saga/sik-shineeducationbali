"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Component to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Memuat...</div>
          <div className="text-sm text-muted-foreground mt-2">Memeriksa autentikasi...</div>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

