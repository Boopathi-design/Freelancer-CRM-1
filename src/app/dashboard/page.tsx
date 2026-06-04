"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb, Invoice, Deal } from "@/lib/mockDb";
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Link2,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [needsActionInvoices, setNeedsActionInvoices] = useState<Invoice[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    const dashboardMetrics = mockDb.getDashboardMetrics();
    setMetrics(dashboardMetrics);

    const invoices = mockDb.getInvoices();
    // Invoices needing action: overdue, viewed, or sent but unpaid
    const actionList = invoices.filter(inv => inv.status === "overdue" || inv.status === "viewed");
    setNeedsActionInvoices(actionList);

    setDeals(mockDb.getDeals());
  };

  useEffect(() => {
    loadData();

    const handleDbUpdate = () => {
      loadData();
    };

    window.addEventListener("invoicehq_db_update", handleDbUpdate);
    return () => window.removeEventListener("invoicehq_db_update", handleDbUpdate);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSendReminder = (invoice: Invoice) => {
    triggerToast(`Reminder sent successfully to ${invoice.clientContact} (${invoice.clientEmail}) for ${invoice.id}`);
    mockDb.addLog(
      "webhook_reconciliation",
      `Sent payment reminder for ${invoice.id} (${invoice.clientName}) valued at ₹${invoice.amount.toLocaleString("en-IN")}.`
    );
    window.dispatchEvent(new Event("invoicehq_db_update"));
  };

  const handleSendSmartRemindersAll = () => {
    triggerToast("Smart notifications sent to all 2 overdue client accounts!");
    mockDb.addLog(
      "webhook_reconciliation",
      "Automated system: Dispatched firm follow-ups and updated payment links to Webcraft Solutions and Brand Alchemy."
    );
    window.dispatchEvent(new Event("invoicehq_db_update"));
  };

  const handleCopyLink = (invoice: Invoice) => {
    const portalUrl = `${window.location.origin}/portal/${invoice.id}`;
    navigator.clipboard.writeText(portalUrl).then(() => {
      triggerToast(`Payment portal URL for ${invoice.id} copied to clipboard!`);
    }).catch(() => {
      triggerToast(`URL: /portal/${invoice.id}`);
    });
  };

  if (!metrics) {
    return (
      <WorkspaceLayout title="Dashboard" subtitle="Collections overview for today">
        <div className="space-y-6">
          <div className="h-8 w-1/3 bg-border-line rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-32 bg-surface-card border border-border-line rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  // Calculate Pipeline distributions
  const totalDealsValue = deals.reduce((sum, d) => sum + d.value, 0);
  const stages = [
    { key: "lead", name: "Lead", color: "bg-blue-500" },
    { key: "proposal", name: "Proposal", color: "bg-indigo-500" },
    { key: "negotiation", name: "Negotiation", color: "bg-purple-500" },
    { key: "won", name: "Won", color: "bg-state-success" }
  ];

  return (
    <WorkspaceLayout title="Dashboard" subtitle="Collections overview for today">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <Zap size={14} className="text-state-warning animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6">

        {/* Cash-At-Risk Matrix / Overdue Notification Banner */}
        {metrics.cashAtRisk > 0 && (
          <div className="bg-state-danger/5 border border-state-danger/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-state-danger/10 flex items-center justify-center text-state-danger shrink-0 mt-0.5">
                <AlertTriangle size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-main">
                  ₹<span className="tabular-nums">{metrics.cashAtRisk.toLocaleString("en-IN")}</span> cash at risk <span className="text-text-muted font-normal">across 2 overdue invoices</span>
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-normal">
                  Largest exposure: <strong className="text-text-main font-semibold">Webcraft Solutions</strong> &mdash; ₹84,000 overdue by 8 days
                </p>
              </div>
            </div>
            <button
              onClick={handleSendSmartRemindersAll}
              className="px-4 py-2.5 rounded-xl bg-state-danger hover:bg-state-danger/90 text-white text-xs font-bold transition-all focus-ring-indigo shadow-md shadow-state-danger/15 flex items-center gap-2 shrink-0 justify-center cursor-pointer"
            >
              <Send size={13} />
              <span>Send Smart Reminder</span>
            </button>
          </div>
        )}

        {/* Core KPI Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Cash at Risk */}
          <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm hover:border-brand-primary/45 transition-colors group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Cash at Risk</span>
              <span className="p-1.5 rounded-lg bg-state-danger/10 text-state-danger">
                <ArrowUpRight size={14} />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="text-2xl font-extrabold text-text-main tracking-tight">
                ₹<span className="tabular-nums">{metrics.cashAtRisk.toLocaleString("en-IN")}</span>
              </h4>
              <p className="text-xs text-text-muted mt-1 leading-none">
                2 overdue client invoices
              </p>
            </div>
          </div>

          {/* Card 2: Expected This Week */}
          <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm hover:border-brand-primary/45 transition-colors group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Expected This Week</span>
              <span className="p-1.5 rounded-lg bg-state-warning/10 text-state-warning">
                <Calendar size={14} />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="text-2xl font-extrabold text-text-main tracking-tight">
                ₹<span className="tabular-nums">{metrics.expectedThisWeek.toLocaleString("en-IN")}</span>
              </h4>
              <p className="text-xs text-text-muted mt-1 leading-none">
                1 invoice due soon
              </p>
            </div>
          </div>

          {/* Card 3: Collected This Month */}
          <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm hover:border-brand-primary/45 transition-colors group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Collected This Month</span>
              <span className="p-1.5 rounded-lg bg-state-success/10 text-state-success">
                <CheckCircle2 size={14} />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="text-2xl font-extrabold text-text-main tracking-tight">
                ₹<span className="tabular-nums">{metrics.collectedThisMonth.toLocaleString("en-IN")}</span>
              </h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-state-success bg-state-success/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <ArrowUpRight size={10} />
                  <span>+28%</span>
                </span>
                <span className="text-[10px] text-text-muted">vs last month</span>
              </div>
            </div>
          </div>

          {/* Card 4: Avg Payment Delay */}
          <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm hover:border-brand-primary/45 transition-colors group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Avg Payment Delay</span>
              <span className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary">
                <Clock size={14} />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="text-2xl font-extrabold text-text-main tracking-tight">
                <span className="tabular-nums">{metrics.avgPaymentDelay}</span> days
              </h4>
              <p className="text-xs text-text-muted mt-1 leading-none">
                Industry average: 18 days
              </p>
            </div>
          </div>
        </div>

        {/* Central Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Panel (2/3): Needs Action Now */}
          <div className="lg:col-span-2 bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border-line">
                <div>
                  <h3 className="text-sm font-bold text-text-main">Needs Action Now</h3>
                  <p className="text-xs text-text-muted mt-0.5">Sorted by urgency &mdash; act to recover cash faster</p>
                </div>
                <Link href="/invoices" className="text-xs font-bold text-brand-primary hover:underline">
                  All invoices &rarr;
                </Link>
              </div>

              <div className="mt-4 divide-y divide-border-line">
                {needsActionInvoices.length === 0 ? (
                  <div className="py-12 text-center text-xs text-text-muted">
                    No immediate invoice actions pending. Perfect!
                  </div>
                ) : (
                  needsActionInvoices.map((inv) => (
                    <div key={inv.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group">
                      <div className="flex items-start gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${inv.status === "overdue" ? "bg-state-danger" : "bg-state-warning"
                          }`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-main">{inv.clientName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${inv.status === "overdue"
                                ? "bg-state-danger/10 text-state-danger"
                                : "bg-state-warning/10 text-state-warning"
                              }`}>
                              {inv.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-1">
                            {inv.id} &bull; {inv.status === "overdue" ? `${Math.round((Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)) || 8}d overdue` : "Viewed but unpaid"} &bull; Last contact: {inv.lastFollowUp}
                          </p>
                          <div className="mt-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleSendReminder(inv)}
                              className="px-2.5 py-1 rounded bg-brand-primary-light hover:bg-brand-primary/20 text-brand-primary text-[10px] font-bold transition-all focus-ring-indigo cursor-pointer"
                            >
                              Remind
                            </button>
                            <button
                              onClick={() => handleCopyLink(inv)}
                              className="p-1 rounded hover:bg-surface-bg text-text-muted hover:text-text-main transition-all focus-ring-indigo cursor-pointer"
                              title="Copy Public Portal link"
                            >
                              <Link2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-text-main tracking-tight tabular-nums">
                          ₹{inv.amount.toLocaleString("en-IN")}
                        </span>
                        <div className="text-[10px] text-text-muted font-medium mt-1">
                          Due {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel (1/3): Sidebar Widgets */}
          <div className="space-y-6">

            {/* Widget A: Get Paid Faster */}
            <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-text-main pb-3 border-b border-border-line">
                Get Paid Faster
              </h3>
              <div className="mt-4 space-y-3">
                <div
                  onClick={() => {
                    const firstOverdue = needsActionInvoices.find(i => i.status === "overdue");
                    if (firstOverdue) handleSendReminder(firstOverdue);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-bg cursor-pointer transition-colors border border-transparent hover:border-border-line group"
                >
                  <div className="w-8 h-8 rounded-lg bg-state-warning/10 text-state-warning flex items-center justify-center shrink-0">
                    <Send size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                      Send Friendly Reminder
                    </h4>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Webcraft &bull; 8d overdue
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    const secondOverdue = needsActionInvoices.find(i => i.id === "INV-2024-040");
                    if (secondOverdue) handleSendReminder(secondOverdue);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-bg cursor-pointer transition-colors border border-transparent hover:border-border-line group"
                >
                  <div className="w-8 h-8 rounded-lg bg-state-danger/10 text-state-danger flex items-center justify-center shrink-0">
                    <AlertTriangle size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                      Send Firm Reminder
                    </h4>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Brand Alchemy &bull; 2d overdue
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    const viewed = needsActionInvoices.find(i => i.status === "viewed");
                    if (viewed) handleCopyLink(viewed);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-bg cursor-pointer transition-colors border border-transparent hover:border-border-line group"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                    <Link2 size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                      Share Payment Link
                    </h4>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Webcraft &bull; Viewed 5d ago
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget B: Invoice Pipeline Chart */}
            <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-text-main pb-3 border-b border-border-line">
                Invoice Pipeline
              </h3>

              <div className="mt-4">
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-surface-bg border border-border-line">
                  {stages.map((stage) => {
                    const val = deals.filter(d => d.stage === stage.key).reduce((sum, d) => sum + d.value, 0);
                    const percentage = totalDealsValue > 0 ? (val / totalDealsValue) * 100 : 0;
                    if (percentage === 0) return null;
                    return (
                      <div
                        key={stage.key}
                        style={{ width: `${percentage}%` }}
                        className={`${stage.color} h-full transition-all`}
                        title={`${stage.name}: ₹${val.toLocaleString("en-IN")} (${Math.round(percentage)}%)`}
                      />
                    );
                  })}
                </div>

                {/* Pipeline Legend */}
                <div className="mt-4 space-y-2">
                  {stages.map((stage) => {
                    const val = deals.filter(d => d.stage === stage.key).reduce((sum, d) => sum + d.value, 0);
                    const percentage = totalDealsValue > 0 ? Math.round((val / totalDealsValue) * 100) : 0;
                    return (
                      <div key={stage.key} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                          <span className="text-text-muted font-medium">{stage.name}</span>
                        </div>
                        <span className="font-semibold text-text-main tabular-nums">
                          ₹{val.toLocaleString("en-IN")} <span className="text-[10px] text-text-muted font-normal">({percentage}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </WorkspaceLayout>
  );
}
