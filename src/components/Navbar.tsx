"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Moon,
  User,
  LogOut,
  ChevronRight,
  Sun
} from "lucide-react";
import { mockDb, ActivityLog } from "@/lib/mockDb";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";

interface NavbarProps {
  title: string;
  subtitle?: string;
  onOpenSearch?: () => void;
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const router = useRouter();
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
    <header className="w-full bg-white px-8 py-6 flex items-center justify-between select-none border-b border-border-line">
      {/* Title / Subtitle */}
      <div>
        <h2 className="text-[22px] font-bold text-text-main leading-tight mb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[13px] text-text-muted font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Placeholder (matches CoStudio) */}
        <button className="w-10 h-10 rounded-full border border-border-line flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-bg transition-colors">
          <Moon size={18} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="w-10 h-10 rounded-full border border-border-line flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-bg transition-colors relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-primary border-2 border-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-border-line rounded-2xl shadow-xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-border-line flex justify-between items-center">
                <h3 className="font-semibold text-text-main text-sm">Notifications</h3>
                <span className="text-[10px] bg-brand-primary-light text-brand-primary font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="p-6 text-center text-text-muted text-sm">No new notifications</div>
                ) : (
                  logs.map(log => (
                    <div 
                      key={log.id}
                      onClick={() => handleNotificationClick(log)}
                      className="px-4 py-3 hover:bg-surface-bg cursor-pointer border-b border-border-line/50 last:border-0"
                    >
                      <p className="text-[13px] text-text-main line-clamp-2 leading-tight">{log.description}</p>
                      <p className="text-[10px] text-text-muted mt-1">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-border-line hover:bg-surface-bg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary">
              <User size={15} />
            </div>
            <span className="text-[13px] font-medium text-text-main">Profile</span>
            <ChevronRight size={14} className="text-text-muted" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-border-line rounded-xl shadow-xl py-1 z-50">
              <div className="px-4 py-3 border-b border-border-line mb-1">
                <p className="text-sm font-semibold text-text-main truncate">{user?.name || "User"}</p>
                <p className="text-[11px] text-text-muted truncate">{user?.email || "hello@arkdesign.in"}</p>
              </div>
              <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-text-main hover:bg-surface-bg">
                <User size={14} /> My Profile
              </Link>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-state-danger hover:bg-state-danger/10 text-left"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
