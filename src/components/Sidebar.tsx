"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockDb } from "@/lib/mockDb";
import { useAuth } from "@/components/AuthProvider";
import {
  LayoutDashboard,
  FileText,
  Users,
  Sparkles,
  Settings,
  TrendingUp,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const invoices = mockDb.getInvoices();
    setOverdueCount(invoices.filter((inv) => inv.status === "overdue").length);

    const handleDbUpdate = () => {
      const updated = mockDb.getInvoices();
      setOverdueCount(updated.filter((i) => i.status === "overdue").length);
    };

    window.addEventListener("invoicehq_db_update", handleDbUpdate);
    return () =>
      window.removeEventListener("invoicehq_db_update", handleDbUpdate);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      name: "Invoices",
      href: "/invoices",
      icon: FileText,
      badge: overdueCount > 0 ? overdueCount : undefined,
    },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Proposals", href: "/proposals", icon: Sparkles },
    { name: "Reports", href: "/reports", icon: TrendingUp },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-[240px] border-r border-border-line bg-white flex flex-col h-screen sticky top-0 left-0 z-40 select-none">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-border-line">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/30">
            <TrendingUp size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-text-main tracking-tight leading-none">
              CoStudio
            </h1>
            <span className="text-[10px] font-semibold text-brand-primary/80 tracking-widest uppercase leading-none mt-0.5 block">
              Workspace
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-[14px] font-medium ${
                isActive
                  ? "bg-brand-primary-light text-brand-primary"
                  : "text-text-muted hover:text-text-main hover:bg-surface-bg"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-brand-primary"
                      : "text-text-muted group-hover:text-text-main"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="w-5 h-5 rounded-full bg-state-danger/10 text-state-danger text-[11px] font-bold flex items-center justify-center tabular-nums">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user info */}
      <div className="px-4 py-4 border-t border-border-line">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-bg border border-border-line">
          <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-brand-primary/20 shrink-0">
            {user?.name?.split(" ").map((s) => s[0]).slice(0, 2).join("") ?? "AK"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-main truncate">{user?.name ?? "Arjun Kumar"}</p>
            <p className="text-[10px] text-text-muted truncate">{user?.email ?? "hello@arkdesign.in"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
