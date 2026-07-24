"use client";

import React, { useEffect, useState, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb, Client } from "@/lib/mockDb";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  X,
  Mail,
  Receipt,
  Clock,
  Sparkles,
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  MoreHorizontal,
  FileText,
  Phone,
} from "lucide-react";

function ClientsIndexContent() {
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New client form fields
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    const data = mockDb.getClients();
    setClients(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener("invoicehq_db_update", handleDbUpdate);
    return () =>
      window.removeEventListener("invoicehq_db_update", handleDbUpdate);
  }, []);

  // Handle URL-driven client selection (from CommandSearch navigation)
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setSelectedClientId(id);
    }
  }, [searchParams]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !contact || !email || !gstin) {
      alert("Please fill in all fields.");
      return;
    }

    mockDb.addClient({ company, contact, email, gstin });
    triggerToast(`Client "${company}" registered successfully!`);
    setIsAddOpen(false);
    setCompany("");
    setContact("");
    setEmail("");
    setGstin("");
    window.dispatchEvent(new Event("invoicehq_db_update"));
  };

  const filteredClients = clients.filter(
    (c) =>
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gstin.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Safe lookup — only after clients are loaded
  const activeClient = selectedClientId
    ? (clients.find((c) => c.id === selectedClientId) ?? null)
    : null;

  // Health score derived from outstanding and delay
  const getHealthScore = (client: Client) => {
    let score = 100;
    if (client.outstanding > 100000) score -= 30;
    else if (client.outstanding > 50000) score -= 20;
    else if (client.outstanding > 0) score -= 10;
    if (client.avgDelay > 30) score -= 30;
    else if (client.avgDelay > 14) score -= 15;
    else if (client.avgDelay > 7) score -= 5;
    return Math.max(score, 0);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-state-success";
    if (score >= 50) return "text-state-warning";
    return "text-state-danger";
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 50) return "Fair";
    return "At Risk";
  };

  return (
    <ProtectedRoute>
      <WorkspaceLayout
        title="Clients"
        subtitle="Manage billing relationships and customer details"
      >
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-brand-primary/30 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
            <Sparkles
              size={14}
              className="text-brand-primary animate-pulse shrink-0"
            />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Clients",
                value: clients.length,
                icon: Users,
                color: "text-brand-primary",
                bg: "bg-brand-primary/10",
              },
              {
                label: "Outstanding",
                value: `₹${clients.reduce((a, c) => a + c.outstanding, 0).toLocaleString("en-IN")}`,
                icon: AlertCircle,
                color: "text-state-danger",
                bg: "bg-state-danger/10",
              },
              {
                label: "Avg Pay Delay",
                value: clients.length
                  ? `${Math.round(clients.reduce((a, c) => a + c.avgDelay, 0) / clients.length)}d`
                  : "—",
                icon: Clock,
                color: "text-state-warning",
                bg: "bg-state-warning/10",
              },
              {
                label: "Total Invoices",
                value: clients.reduce((a, c) => a + c.invoiceCount, 0),
                icon: Receipt,
                color: "text-state-success",
                bg: "bg-state-success/10",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-surface-card border border-border-line rounded-2xl p-4 shadow-sm flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon size={16} className={stat.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-sm font-black text-text-main tabular-nums truncate">
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card border border-border-line p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs font-semibold text-text-muted w-full md:max-w-xs">
              <Search size={13} />
              <input
                type="text"
                placeholder="Search clients by name, contact, GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none border-none text-text-main placeholder:text-text-muted w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-text-muted hover:text-text-main transition-colors"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all focus-ring-indigo shadow-md shadow-brand-primary/15 self-start md:self-auto cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Client</span>
            </button>
          </div>

          {/* Client Index Table */}
          <div className="bg-surface-card border border-border-line rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-bg border-b border-border-line text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <th className="py-4 px-6 font-bold w-1/4">Company</th>
                    <th className="py-4 px-6 font-bold">Contact</th>
                    <th className="py-4 px-6 font-bold">GSTIN</th>
                    <th className="py-4 px-6 font-bold text-right">
                      Outstanding
                    </th>
                    <th className="py-4 px-6 font-bold">Health</th>
                    <th className="py-4 px-6 font-bold">Last Invoice</th>
                    <th className="py-4 px-6 font-bold text-center">
                      Invoices
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-line text-xs font-medium">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-text-muted animate-pulse"
                      >
                        Loading client directory...
                      </td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Users
                          size={32}
                          className="text-text-muted/30 mx-auto mb-3"
                        />
                        <p className="text-text-muted font-semibold">
                          No clients found
                        </p>
                        <p className="text-[10px] text-text-muted/70 mt-1">
                          {searchQuery
                            ? "Try a different search term"
                            : "Click “Add Client” to get started"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const score = getHealthScore(client);
                      const isSelected = selectedClientId === client.id;
                      return (
                        <tr
                          key={client.id}
                          onClick={() =>
                            setSelectedClientId(isSelected ? null : client.id)
                          }
                          className={`cursor-pointer transition-colors group ${
                            isSelected
                              ? "bg-brand-primary-light"
                              : "hover:bg-surface-bg/40"
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                                {client.company.substring(0, 2)}
                              </div>
                              <span
                                className={`font-bold transition-colors ${isSelected ? "text-brand-primary" : "text-text-main group-hover:text-brand-primary"}`}
                              >
                                {client.company}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-text-main">
                              {client.contact}
                            </div>
                            <div className="text-[10px] text-text-muted font-normal mt-0.5">
                              {client.email}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-text-muted font-semibold tabular-nums">
                            {client.gstin}
                          </td>
                          <td className="py-4 px-6 text-right font-extrabold tabular-nums">
                            {client.outstanding > 0 ? (
                              <span className="text-state-danger">
                                ₹{client.outstanding.toLocaleString("en-IN")}
                              </span>
                            ) : (
                              <span className="text-state-success">Nil</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`text-xs font-bold ${getHealthColor(score)}`}
                            >
                              {score}
                              <span className="text-[9px] font-normal text-text-muted ml-1">
                                {getHealthLabel(score)}
                              </span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-text-muted font-semibold tabular-nums">
                            {client.lastInvoiceDate === "—"
                              ? "—"
                              : new Date(
                                  client.lastInvoiceDate,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                          </td>
                          <td className="py-4 px-6 text-center text-text-main font-bold tabular-nums">
                            {client.invoiceCount}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 bg-surface-bg border-t border-border-line text-[11px] text-text-muted font-medium flex items-center justify-between">
              <span>
                Showing {filteredClients.length} of {clients.length} registered
                clients
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-brand-primary hover:underline text-[10px] font-bold"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* MODAL: ADD CLIENT */}
          {isAddOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-surface-card border border-border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-border-line flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                      <Users size={14} className="text-brand-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-text-main">
                      New Client Profile
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddOpen(false)}
                    className="p-1 rounded-lg hover:bg-surface-bg text-text-muted hover:text-text-main transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddClient} className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                      />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Webcraft Solutions Pvt. Ltd."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Mehta"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Billing Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                      />
                      <input
                        type="email"
                        required
                        placeholder="billing@webcraft.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Client GSTIN
                    </label>
                    <div className="relative">
                      <Shield
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                      />
                      <input
                        type="text"
                        required
                        maxLength={15}
                        placeholder="e.g. 27AAPFW0939F1ZV"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary uppercase tabular-nums transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-border-line">
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="px-4 py-2 rounded-xl border border-border-line hover:bg-surface-bg text-text-muted hover:text-text-main text-xs font-semibold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-brand-primary/20 cursor-pointer"
                    >
                      Save Client
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SIDE PANEL: CLIENT 360° PROFILE */}
          {activeClient && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-40"
                onClick={() => setSelectedClientId(null)}
              />

              <div className="fixed top-0 right-0 h-full w-full max-w-md bg-surface-card border-l border-border-line z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none">
                {/* Panel Header */}
                <div className="p-5 border-b border-border-line">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm uppercase shadow-lg shadow-brand-primary/25">
                        {activeClient.company.substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-main leading-tight line-clamp-1">
                          {activeClient.company}
                        </h3>
                        <span className="text-[10px] text-text-muted">
                          360° Client Profile
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedClientId(null)}
                      className="p-1.5 rounded-xl hover:bg-surface-bg text-text-muted hover:text-text-main transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Health Score Bar */}
                  {(() => {
                    const score = getHealthScore(activeClient);
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            Client Health Score
                          </span>
                          <span
                            className={`text-xs font-black ${getHealthColor(score)}`}
                          >
                            {score}/100 · {getHealthLabel(score)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-bg overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              score >= 80
                                ? "bg-state-success"
                                : score >= 50
                                  ? "bg-state-warning"
                                  : "bg-state-danger"
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-surface-bg border border-border-line">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Outstanding Balance
                      </span>
                      <span
                        className={`text-base font-black tabular-nums ${
                          activeClient.outstanding > 0
                            ? "text-state-danger"
                            : "text-state-success"
                        }`}
                      >
                        {activeClient.outstanding > 0
                          ? `₹${activeClient.outstanding.toLocaleString("en-IN")}`
                          : "Nil"}
                      </span>
                      {activeClient.outstanding > 0 ? (
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp size={9} className="text-state-danger" />
                          <span className="text-[9px] text-state-danger">
                            Requires follow-up
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle
                            size={9}
                            className="text-state-success"
                          />
                          <span className="text-[9px] text-state-success">
                            Fully cleared
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-surface-bg border border-border-line">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Avg Payment Delay
                      </span>
                      <span className="text-base font-black text-text-main tabular-nums">
                        {activeClient.avgDelay}
                        <span className="text-xs font-medium text-text-muted ml-1">
                          days
                        </span>
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        {activeClient.avgDelay <= 7 ? (
                          <>
                            <TrendingDown
                              size={9}
                              className="text-state-success"
                            />
                            <span className="text-[9px] text-state-success">
                              Prompt payer
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock size={9} className="text-state-warning" />
                            <span className="text-[9px] text-state-warning">
                              Moderate delay
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={11} />
                      Contact Information
                    </h4>
                    <div className="space-y-2.5">
                      {[
                        {
                          icon: Building2,
                          label: "Company",
                          value: activeClient.company,
                        },
                        {
                          icon: Phone,
                          label: "Contact Person",
                          value: activeClient.contact,
                        },
                        {
                          icon: Mail,
                          label: "Email",
                          value: activeClient.email,
                        },
                        {
                          icon: Shield,
                          label: "GSTIN",
                          value: activeClient.gstin,
                          mono: true,
                        },
                      ].map((row) => {
                        const Icon = row.icon;
                        return (
                          <div
                            key={row.label}
                            className="flex items-center gap-3 p-3 rounded-xl bg-surface-bg border border-border-line"
                          >
                            <Icon
                              size={13}
                              className="text-text-muted shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                                {row.label}
                              </p>
                              <p
                                className={`text-xs text-text-main font-semibold truncate ${row.mono ? "font-mono tabular-nums" : ""}`}
                              >
                                {row.value}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Invoice Summary */}
                  <div>
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Receipt size={11} />
                      Invoice Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        {
                          label: "Total Invoices",
                          value: `${activeClient.invoiceCount} generated`,
                        },
                        {
                          label: "Last Invoice",
                          value:
                            activeClient.lastInvoiceDate === "—"
                              ? "None yet"
                              : new Date(
                                  activeClient.lastInvoiceDate,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }),
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="p-3 rounded-xl bg-surface-bg border border-border-line"
                        >
                          <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider mb-0.5">
                            {item.label}
                          </p>
                          <p className="text-xs font-bold text-text-main">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Communication Log */}
                  <div>
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <FileText size={11} />
                      Recent Communication
                    </h4>
                    <div className="space-y-2.5">
                      <div className="p-3.5 bg-surface-bg border border-border-line rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-text-main">
                            Invoice Dispatched
                          </span>
                          <span className="text-[9px] text-text-muted">
                            3 days ago
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted leading-relaxed">
                          Payment link and invoice statement INV-2024-041 sent
                          to {activeClient.email}.
                        </p>
                      </div>
                      <div className="p-3.5 bg-surface-bg border border-border-line rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-text-main">
                            Invoice Viewed
                          </span>
                          <span className="text-[9px] text-text-muted">
                            5 days ago
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted leading-relaxed">
                          {activeClient.contact} viewed INV-2024-037. Flagged
                          for finance reconciliation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-border-line bg-surface-bg/60 space-y-2.5">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-brand-primary/20 cursor-pointer">
                    <ExternalLink size={13} />
                    View All Invoices
                  </button>
                  <button
                    onClick={() => setSelectedClientId(null)}
                    className="w-full py-2.5 rounded-xl border border-border-line hover:bg-surface-card text-text-muted hover:text-text-main text-xs font-semibold transition-all cursor-pointer"
                  >
                    Close Panel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}

export default function ClientsIndex() {
  return (
    <Suspense
      fallback={
        <WorkspaceLayout
          title="Clients"
          subtitle="Manage billing relationships and customer details"
        >
          <div className="py-12 text-center text-text-muted animate-pulse">
            Loading Client Directory...
          </div>
        </WorkspaceLayout>
      }
    >
      <ClientsIndexContent />
    </Suspense>
  );
}
