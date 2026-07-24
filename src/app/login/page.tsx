"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ShieldCheck, ArrowRight, UserPlus } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [next, setNext] = useState("/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setNext(params.get("next") || "/dashboard");
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email.trim(), password);
    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(next);
  };

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border-line bg-surface-card p-10 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-text-muted">
              Freelancer CRM
            </p>
            <h1 className="mt-4 text-3xl font-extrabold text-text-main">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Login to access your InvoiceHQ workspace and client pipeline.
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-primary/10 text-brand-primary">
            <ShieldCheck size={24} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-[0.2em]">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@company.com"
              className="mt-2 w-full rounded-3xl border border-border-line bg-surface-bg px-4 py-3 text-sm text-text-main outline-none transition focus:border-brand-primary focus:ring focus:ring-brand-primary/10"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-[0.2em]">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-3xl border border-border-line bg-surface-bg px-4 py-3 text-sm text-text-main outline-none transition focus:border-brand-primary focus:ring focus:ring-brand-primary/10"
              required
            />
          </div>

          {error && <p className="text-xs text-state-danger">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-3xl bg-brand-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in to Dashboard"}
          </button>
        </form>

        <div className="mt-8 border-t border-border-line pt-5 text-center text-sm text-text-muted">
          <p>
            New to InvoiceHQ?{" "}
            <Link
              href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-semibold text-brand-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
