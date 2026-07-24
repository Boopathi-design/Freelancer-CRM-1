"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full rounded-3xl border border-border-line bg-surface-card p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl font-bold">
            •
          </div>
          <h1 className="text-sm font-bold text-text-main">
            Authenticating...
          </h1>
          <p className="text-xs text-text-muted mt-2">
            Checking your session and preparing your workspace.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
