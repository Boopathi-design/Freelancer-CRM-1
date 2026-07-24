"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Clock,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { mockDb, ActivityLog } from "@/lib/mockDb";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";

interface NavbarProps {
  title: string;
  subtitle?: string;
  onOpenSearch: () => void;
}

export default function Navbar({ title, subtitle, onOpenSearch }: NavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load activity logs
    setLogs(mockDb.getLogs().slice(0, 5));

    // Simulate checking for overdue items or new events
    const invoices = mockDb.getInvoices();
    const overdueCount = invoices.filter((i) => i.status === "overdue").length;
    setUnreadCount(overdueCount);

    const handleDbUpdate = () => {
      setLogs(mockDb.getLogs().slice(0, 5));
      const updated = mockDb.getInvoices();
      setUnreadCount(updated.filter((i) => i.status === "overdue").length);
    };

    window.addEventListener("invoicehq_db_update", handleDbUpdate);
    return () =>
      window.removeEventListener("invoicehq_db_update", handleDbUpdate);
  }, []);

  const handleNotificationClick = (log: ActivityLog) => {
    setShowNotifications(false);
    if (
      log.type === "invoice_created" ||
      log.type === "payment" ||
      log.type === "webhook_reconciliation"
    ) {
      router.push("/invoices");
    } else if (log.type === "deal_moved") {
      router.push("/pipeline");
    } else if (log.type === "client_added") {
      router.push("/clients");
    }
  };

  return (
    <header className="sticky top-0 right-0 z-30 w-full bg-surface-card/85 backdrop-blur-md border-b border-border-line px-8 py-4 flex items-center justify-between select-none">
      {/* Title / Breadcrumbs */}
      <div>
        <h2 className="text-lg font-bold text-text-main leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-text-muted font-medium mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Center/Right Toolbar */}
      <div className="flex items-center gap-4">
        {/* Search Bar Input Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 w-64 px-3.5 py-2 rounded-xl bg-surface-bg border border-border-line text-text-muted hover:text-text-main hover:border-brand-primary/40 text-xs text-left cursor-pointer transition-all duration-200 focus-ring-indigo shadow-sm"
        >
          <Search size={15} />
          <span className="flex-1">Search invoices, clients...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-line font-mono text-[9px] shadow-sm select-none">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-border-line hover:border-brand-primary/40 hover:text-brand-primary text-text-muted bg-surface-card transition-all focus-ring-indigo shadow-sm"
          title={
            theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
          }
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* View Sample Invoice Client Portal Link */}
        <Link
          href="/portal/INV-2024-041"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-line hover:border-brand-primary/45 hover:text-brand-primary text-xs font-semibold text-text-main transition-all focus-ring-indigo shadow-sm bg-surface-card"
        >
          <span>Portal</span>
          <ExternalLink size={13} />
        </Link>

        {/* Notification Bell Dropdown wrapper */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-border-line hover:border-brand-primary/45 text-text-muted hover:text-text-main bg-surface-card transition-all focus-ring-indigo relative shadow-sm"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-state-danger animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <>
              {/* Backdrop layer to click out */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />

              <div className="absolute right-0 mt-2 w-80 bg-surface-card border border-border-line rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-border-line flex items-center justify-between">
                  <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                    System Alerts
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-state-danger/10 text-state-danger font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} Actions Pending
                    </span>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-border-line">
                  {logs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-text-muted">
                      No recent notifications
                    </div>
                  ) : (
                    logs.map((log) => {
                      const isPayment =
                        log.type === "payment" ||
                        log.type === "webhook_reconciliation";
                      const isAlert =
                        log.description.toLowerCase().includes("overdue") ||
                        log.type === "webhook_reconciliation";

                      return (
                        <div
                          key={log.id}
                          onClick={() => handleNotificationClick(log)}
                          className="px-4 py-3 hover:bg-surface-bg cursor-pointer transition-colors flex gap-3 text-left"
                        >
                          <div className="mt-0.5 shrink-0">
                            {isPayment ? (
                              <CheckCircle
                                size={15}
                                className="text-state-success"
                              />
                            ) : isAlert ? (
                              <ShieldAlert
                                size={15}
                                className="text-state-danger"
                              />
                            ) : (
                              <Clock size={15} className="text-brand-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-text-main font-medium leading-normal line-clamp-2">
                              {log.description}
                            </p>
                            <span className="text-[9px] text-text-muted mt-1 block">
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="px-4 py-2 border-t border-border-line text-center bg-surface-bg/50">
                  <Link
                    href="/dashboard"
                    onClick={() => setShowNotifications(false)}
                    className="text-[10px] text-brand-primary font-bold hover:underline"
                  >
                    View All Logs
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {user && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-xl border border-border-line bg-surface-card px-3 py-2 text-text-main hover:border-brand-primary/45 focus-ring-indigo transition-all shadow-sm"
            >
              <User size={16} />
              <span className="text-xs font-semibold">
                {user.name.split(" ")[0]}
              </span>
              <ChevronDown size={14} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-3xl border border-border-line bg-surface-card shadow-xl z-20 py-2 animate-in fade-in duration-150">
                <Link
                  href="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-4 py-3 text-sm text-text-main hover:bg-surface-bg"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                    router.push("/login");
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-text-muted hover:bg-surface-bg"
                >
                  <span className="inline-flex items-center gap-2">
                    <LogOut size={14} />
                    Logout
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
