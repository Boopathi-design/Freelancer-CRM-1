"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl border border-border-line bg-surface-card p-8 text-center shadow-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-text-muted">
          InvoiceHQ
        </p>
        <h1 className="mt-4 text-2xl font-bold text-text-main">
          Preparing your workspace
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Checking your session and redirecting you to the right place.
        </p>
      </div>
    </div>
  );
}
