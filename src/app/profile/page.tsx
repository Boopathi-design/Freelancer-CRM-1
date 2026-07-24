"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { User, LogOut, Pencil, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [company, setCompany] = useState(user?.company ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const result = await updateProfile({
      name: displayName.trim(),
      company: company.trim(),
      email: email.trim(),
      ...(password ? { password } : {}),
    });
    setIsSaving(false);
    setToast(result.message);
    if (result.success) {
      setPassword("");
    }
    setTimeout(() => setToast(null), 3000);
  };

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <WorkspaceLayout
      title="My Profile"
      subtitle="Manage your account details and workspace access"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <div className="rounded-3xl border border-border-line bg-surface-card p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-primary text-white text-2xl font-bold">
              {initials}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
                Signed in as
              </p>
              <h2 className="mt-2 text-xl font-bold text-text-main">
                {user.name}
              </h2>
              <p className="text-sm text-text-muted mt-1">{user.company}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm text-text-muted">
            <div>
              <p className="font-semibold text-text-main">Email</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="font-semibold text-text-main">Member since</p>
              <p>
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-3xl bg-state-danger px-4 py-3 text-sm font-bold text-white transition hover:bg-state-danger/90"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-3xl border border-border-line bg-surface-card p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 text-text-main">
            <Pencil size={18} />
            <div>
              <h3 className="font-bold">Profile settings</h3>
              <p className="text-xs text-text-muted">
                Update your account information and secure credentials.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-text-muted">
              <span>Full name</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-3xl border border-border-line bg-surface-bg px-4 py-3 text-sm text-text-main outline-none focus:border-brand-primary focus:ring focus:ring-brand-primary/10"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-text-muted">
              <span>Company</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="w-full rounded-3xl border border-border-line bg-surface-bg px-4 py-3 text-sm text-text-main outline-none focus:border-brand-primary focus:ring focus:ring-brand-primary/10"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-text-muted">
              <span>Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full rounded-3xl border border-border-line bg-surface-bg px-4 py-3 text-sm text-text-main outline-none focus:border-brand-primary focus:ring focus:ring-brand-primary/10"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-text-muted">
              <span>New password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Leave blank to keep current password"
                className="w-full rounded-3xl border border-border-line bg-surface-bg px-4 py-3 text-sm text-text-main outline-none focus:border-brand-primary focus:ring focus:ring-brand-primary/10"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-brand-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck size={16} /> Save changes
          </button>

          {toast && (
            <div className="rounded-3xl bg-surface-bg border border-border-line px-4 py-3 text-sm text-text-main">
              {toast}
            </div>
          )}
        </form>
      </div>
    </WorkspaceLayout>
  );
}
