"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockDb } from "@/lib/mockDb";
import {
  LayoutDashboard,
  FileText,
  Users,
  Sparkles,
  GitBranch,
  Settings,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const invoices = mockDb.getInvoices();
    setOverdueCount(invoices.filter((inv) => inv.status === "overdue").length);

    const handleDbUpdate = () => {
      const updated = mockDb.getInvoices();
      setOverdueCount(updated.filter((i) => i.status === "overdue").length);
    };

    window.addEventListener("invoicehq_db_update", handleDbUpdate);
    return () => window.removeEventListener("invoicehq_db_update", handleDbUpdate);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Invoices", href: "/invoices", icon: FileText, badge: overdueCount > 0 ? overdueCount : undefined },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Proposals", href: "/proposals", icon: Sparkles },
    { name: "Pipeline", href: "/pipeline", icon: GitBranch },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border-line bg-surface-card flex flex-col justify-between h-screen sticky top-0 left-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/25">
              <TrendingUp size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-main leading-tight tracking-tight">InvoiceHQ</h1>
              <span className="text-[11px] font-semibold uppercase text-brand-primary tracking-widest">Workspace</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary uppercase">
            Pro
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium focus-ring-indigo ${
                isActive
                  ? "bg-brand-primary-light text-brand-primary border border-brand-primary/10"
                  : "text-text-muted hover:text-text-main hover:bg-surface-bg border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon
                  size={18}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-brand-primary" : "text-text-muted group-hover:text-text-main"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="w-5 h-5 rounded-full bg-state-danger/10 text-state-danger text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User Workspace Switcher */}
      <div className="p-4 border-t border-border-line bg-surface-bg/50">
        <div className="p-2.5 rounded-xl bg-surface-card border border-border-line flex items-center justify-between cursor-pointer hover:border-brand-primary/50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-primary/20">
              AK
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-text-main truncate">Arjun Kumar</h4>
              <p className="text-[10px] text-text-muted truncate leading-none">arkdesign.in</p>
            </div>
          </div>
          <ChevronDown size={14} className="text-text-muted group-hover:text-text-main transition-colors" />
        </div>
      </div>
    </aside>
  );
}
