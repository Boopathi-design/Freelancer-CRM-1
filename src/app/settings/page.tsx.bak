"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb, WorkspaceSettings } from "@/lib/mockDb";
import {
  Building2,
  Mail,
  Globe,
  CheckCircle,
  Sun,
  Moon,
  Palette,
  Receipt,
  Shield,
  Save,
  Settings2,
  Sparkles,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  Info,
  Copy,
  ChevronRight,
} from "lucide-react";

const TABS = [
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "gst", label: "Tax & GST", icon: Receipt },
  { id: "billing", label: "Billing Plan", icon: CreditCard },
];

const colorTokens = [
  {
    name: "--color-brand-primary",
    desc: "Hero selections, active rings, CTA buttons",
    light: "#6366F1",
    dark: "#818CF8",
    lightLabel: "Indigo 500",
    darkLabel: "Indigo 400",
  },
  {
    name: "--color-surface-bg",
    desc: "Main canvas platform backdrop",
    light: "#F8FAFC",
    dark: "#0F172A",
    lightLabel: "Slate 50",
    darkLabel: "Slate 900",
  },
  {
    name: "--color-surface-card",
    desc: "Bento widgets, data rows, modals",
    light: "#FFFFFF",
    dark: "#1E293B",
    lightLabel: "White",
    darkLabel: "Slate 800",
  },
  {
    name: "--color-border-line",
    desc: "High density data grids and dividers",
    light: "#E2E8F0",
    dark: "#334155",
    lightLabel: "Slate 200",
    darkLabel: "Slate 700",
  },
  {
    name: "--color-text-main",
    desc: "Clear headings, labels, core metrics",
    light: "#0F172A",
    dark: "#F8FAFC",
    lightLabel: "Slate 900",
    darkLabel: "Slate 50",
  },
  {
    name: "--color-text-muted",
    desc: "Supporting descriptions, metadata",
    light: "#64748B",
    dark: "#94A3B8",
    lightLabel: "Slate 500",
    darkLabel: "Slate 400",
  },
  {
    name: "--color-state-success",
    desc: "Paid invoices, approved milestones",
    light: "#10B981",
    dark: "#34D399",
    lightLabel: "Emerald 500",
    darkLabel: "Emerald 400",
  },
  {
    name: "--color-state-danger",
    desc: "Overdue alerts, error flags",
    light: "#EF4444",
    dark: "#F87171",
    lightLabel: "Red 500",
    darkLabel: "Red 400",
  },
  {
    name: "--color-state-warning",
    desc: "Pending states, caution indicators",
    light: "#F59E0B",
    dark: "#FBBF24",
    lightLabel: "Amber 500",
    darkLabel: "Amber 400",
  },
];

const gstSlabs = [
  { rate: "0%", category: "Exempt Services", example: "Healthcare, Education" },
  {
    rate: "5%",
    category: "Essential Services",
    example: "Basic food, transport",
  },
  {
    rate: "12%",
    category: "Standard Services",
    example: "Hospitality, software",
  },
  {
    rate: "18%",
    category: "Professional Services",
    example: "IT/Design consulting, SaaS",
  },
  {
    rate: "28%",
    category: "Luxury / Premium",
    example: "Premium entertainment",
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("workspace");

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [baseCurrency, setBaseCurrency] = useState("INR");
  const [autoGst, setAutoGst] = useState(true);
  const [defaultGstRate, setDefaultGstRate] = useState("18");

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    const settings = mockDb.getSettings();
    setCompanyName(settings.companyName);
    setEmail(settings.email);
    setGstin(settings.gstin);
    setPlaceOfSupply(settings.placeOfSupply);
    setBaseCurrency(settings.baseCurrency);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !gstin || !email) {
      alert("Please fill in company details, email, and GSTIN.");
      return;
    }

    const payload: WorkspaceSettings = {
      companyName,
      email,
      gstin,
      placeOfSupply,
      baseCurrency,
    };

    mockDb.updateSettings(payload);
    triggerToast("Workspace configurations saved successfully!");
    window.dispatchEvent(new Event("invoicehq_db_update"));
  };

  const handleCopyToken = (name: string) => {
    navigator.clipboard.writeText(`var(${name})`).catch(() => {});
    setCopiedToken(name);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  return (
    <ProtectedRoute>
      <WorkspaceLayout
        title="Settings"
        subtitle="Configure workspace variables and regional GST parameters"
      >
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-brand-primary/30 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
            <CheckCircle size={14} className="text-state-success shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-transparent border border-brand-primary/15 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/30 shrink-0">
            <Settings2 size={22} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-main">
              Workspace Preferences
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Manage your company identity, design tokens, GST configuration,
              and billing plan.
            </p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold">
            <Sparkles size={11} />
            Pro Workspace
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Tab Sidebar */}
          <nav className="w-full lg:w-52 shrink-0 bg-surface-card border border-border-line rounded-2xl p-2 shadow-sm">
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest px-3 py-2">
              Configuration
            </p>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left mb-0.5 ${
                    isActive
                      ? "bg-brand-primary-light text-brand-primary border border-brand-primary/15"
                      : "text-text-muted hover:text-text-main hover:bg-surface-bg border border-transparent"
                  }`}
                >
                  <Icon
                    size={15}
                    className={isActive ? "text-brand-primary" : ""}
                  />
                  <span>{tab.label}</span>
                  {isActive && <ChevronRight size={12} className="ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Tab Content Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* ── WORKSPACE TAB ── */}
            {activeTab === "workspace" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border-line mb-6">
                    <Building2 className="text-brand-primary" size={17} />
                    <h3 className="text-sm font-bold text-text-main">
                      Company Identity
                    </h3>
                  </div>

                  <form onSubmit={handleSave} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                          Company Name (Owner)
                        </label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. ARK Design Studio"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary transition-colors"
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="billing@yourstudio.in"
                            className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                          Owner GSTIN
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={15}
                          value={gstin}
                          onChange={(e) =>
                            setGstin(e.target.value.toUpperCase())
                          }
                          placeholder="27AAPFW0939F1ZV"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary uppercase tabular-nums transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                          Place of Supply
                        </label>
                        <div className="relative">
                          <Globe
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                          />
                          <input
                            type="text"
                            value={placeOfSupply}
                            onChange={(e) => setPlaceOfSupply(e.target.value)}
                            placeholder="e.g. Maharashtra"
                            className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                          Base Currency
                        </label>
                        <select
                          value={baseCurrency}
                          onChange={(e) => setBaseCurrency(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary transition-colors"
                        >
                          <option value="INR">₹ INR – Indian Rupee</option>
                          <option value="USD">$ USD – US Dollar</option>
                          <option value="EUR">€ EUR – Euro</option>
                          <option value="GBP">£ GBP – British Pound</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border-line flex items-center justify-between">
                      <p className="text-[10px] text-text-muted flex items-center gap-1">
                        <Info size={11} />
                        Changes reflect on all new invoices and proposals
                      </p>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all focus-ring-indigo shadow-md shadow-brand-primary/20 cursor-pointer"
                      >
                        <Save size={13} />
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Plan",
                      value: "Pro Workspace",
                      icon: Sparkles,
                      color: "text-brand-primary",
                    },
                    {
                      label: "Currency",
                      value: baseCurrency || "INR",
                      icon: CreditCard,
                      color: "text-state-success",
                    },
                    {
                      label: "Supply State",
                      value: placeOfSupply || "—",
                      icon: Globe,
                      color: "text-state-warning",
                    },
                    {
                      label: "GSTIN Status",
                      value: gstin ? "Active" : "Not Set",
                      icon: Shield,
                      color: gstin ? "text-state-success" : "text-state-danger",
                    },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="bg-surface-card border border-border-line rounded-2xl p-4 shadow-sm"
                      >
                        <Icon size={16} className={`${card.color} mb-2`} />
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                          {card.label}
                        </p>
                        <p className="text-xs font-bold text-text-main mt-0.5 truncate">
                          {card.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── APPEARANCE TAB ── */}
            {activeTab === "appearance" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border-line mb-6">
                    <Palette className="text-brand-primary" size={17} />
                    <h3 className="text-sm font-bold text-text-main">
                      Design Token Tree
                    </h3>
                    <span className="ml-auto text-[9px] font-bold bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full uppercase tracking-wider">
                      CSS Variables
                    </span>
                  </div>

                  <p className="text-xs text-text-muted mb-5 leading-relaxed">
                    These CSS custom properties define the entire visual
                    language of InvoiceHQ. They cascade through both light and
                    dark themes automatically.
                  </p>

                  <div className="space-y-3">
                    {colorTokens.map((tok) => (
                      <div
                        key={tok.name}
                        className="p-4 bg-surface-bg border border-border-line rounded-xl group hover:border-brand-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-text-main font-mono">
                                {tok.name}
                              </span>
                              <button
                                onClick={() => handleCopyToken(tok.name)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-text-muted hover:text-brand-primary transition-all"
                                title="Copy CSS variable"
                              >
                                {copiedToken === tok.name ? (
                                  <CheckCircle
                                    size={11}
                                    className="text-state-success"
                                  />
                                ) : (
                                  <Copy size={11} />
                                )}
                              </button>
                            </div>
                            <p className="text-[9px] text-text-muted leading-tight mb-2">
                              {tok.desc}
                            </p>
                            <div className="flex items-center gap-4 text-[9px] font-medium">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-full border border-border-line shadow-sm"
                                  style={{ backgroundColor: tok.light }}
                                />
                                <Sun size={8} className="text-state-warning" />
                                <span className="text-text-main font-mono">
                                  {tok.light}
                                </span>
                                <span className="text-text-muted">
                                  {tok.lightLabel}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-full border border-border-line shadow-sm"
                                  style={{ backgroundColor: tok.dark }}
                                />
                                <Moon size={8} className="text-brand-primary" />
                                <span className="text-text-main font-mono">
                                  {tok.dark}
                                </span>
                                <span className="text-text-muted">
                                  {tok.darkLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Color swatches side by side */}
                          <div className="flex gap-1 shrink-0">
                            <div
                              className="w-8 h-8 rounded-lg border border-border-line shadow-sm"
                              style={{ backgroundColor: tok.light }}
                              title={`Light: ${tok.light}`}
                            />
                            <div
                              className="w-8 h-8 rounded-lg border border-border-line shadow-sm"
                              style={{ backgroundColor: tok.dark }}
                              title={`Dark: ${tok.dark}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── GST TAB ── */}
            {activeTab === "gst" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* GST Configuration Card */}
                <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border-line mb-6">
                    <Receipt className="text-brand-primary" size={17} />
                    <h3 className="text-sm font-bold text-text-main">
                      GST Configuration
                    </h3>
                  </div>

                  <div className="space-y-5">
                    {/* Auto GST toggle */}
                    <div className="flex items-center justify-between p-4 bg-surface-bg rounded-xl border border-border-line">
                      <div>
                        <p className="text-xs font-bold text-text-main">
                          Auto-apply GST on Invoices
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Automatically calculate and append GST breakdown on
                          all new invoices
                        </p>
                      </div>
                      <button
                        onClick={() => setAutoGst(!autoGst)}
                        className="shrink-0 transition-colors"
                      >
                        {autoGst ? (
                          <ToggleRight
                            size={28}
                            className="text-brand-primary"
                          />
                        ) : (
                          <ToggleLeft size={28} className="text-text-muted" />
                        )}
                      </button>
                    </div>

                    {/* Default GST rate */}
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        Default GST Rate
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {["0", "5", "12", "18", "28"].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setDefaultGstRate(rate)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                              defaultGstRate === rate
                                ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20"
                                : "bg-surface-bg text-text-muted border-border-line hover:border-brand-primary/40 hover:text-text-main"
                            }`}
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* GST Slab Reference Table */}
                <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border-line mb-4">
                    <Shield className="text-brand-primary" size={17} />
                    <h3 className="text-sm font-bold text-text-main">
                      GST Slab Reference
                    </h3>
                    <span className="ml-auto text-[9px] font-bold bg-surface-bg text-text-muted px-2 py-1 rounded-full border border-border-line uppercase tracking-wider">
                      India GST Act
                    </span>
                  </div>
                  <div className="space-y-2">
                    {gstSlabs.map((slab) => (
                      <div
                        key={slab.rate}
                        className={`flex items-center gap-4 p-3.5 rounded-xl border transition-colors ${
                          defaultGstRate === slab.rate.replace("%", "")
                            ? "bg-brand-primary-light border-brand-primary/20"
                            : "bg-surface-bg border-border-line"
                        }`}
                      >
                        <span
                          className={`text-sm font-black tabular-nums w-10 shrink-0 ${
                            defaultGstRate === slab.rate.replace("%", "")
                              ? "text-brand-primary"
                              : "text-text-main"
                          }`}
                        >
                          {slab.rate}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-text-main">
                            {slab.category}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {slab.example}
                          </p>
                        </div>
                        {defaultGstRate === slab.rate.replace("%", "") && (
                          <CheckCircle
                            size={14}
                            className="text-brand-primary ml-auto shrink-0"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── BILLING TAB ── */}
            {activeTab === "billing" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* Current Plan Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-brand-primary/25">
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-16 translate-x-16" />
                  <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-10 -translate-x-10" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={16} className="text-white/80" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                        Current Plan
                      </span>
                    </div>
                    <h3 className="text-2xl font-black mb-1">Pro Workspace</h3>
                    <p className="text-sm text-white/70 mb-5">
                      Full access · Unlimited invoices · GST automation
                    </p>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black">₹999</span>
                      <span className="text-sm text-white/70 mb-1">/month</span>
                    </div>
                  </div>
                </div>

                {/* Feature Matrix */}
                <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-text-main mb-5">
                    Plan Features
                  </h3>
                  <div className="space-y-3">
                    {[
                      { feature: "Unlimited Invoices", included: true },
                      { feature: "GST Auto-calculation", included: true },
                      { feature: "AI Proposal Generation", included: true },
                      { feature: "Sales Pipeline (CRM)", included: true },
                      { feature: "Client Portal Links", included: true },
                      { feature: "Multi-currency Support", included: true },
                      { feature: "White-label Branding", included: false },
                      {
                        feature: "Team Collaboration (5 seats)",
                        included: false,
                      },
                      { feature: "API Access & Webhooks", included: false },
                    ].map((item) => (
                      <div
                        key={item.feature}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            item.included
                              ? "bg-state-success/15"
                              : "bg-surface-bg border border-border-line"
                          }`}
                        >
                          {item.included && (
                            <CheckCircle
                              size={10}
                              className="text-state-success"
                            />
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            item.included
                              ? "text-text-main"
                              : "text-text-muted line-through"
                          }`}
                        >
                          {item.feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-border-line">
                    <button className="w-full py-2.5 rounded-xl border border-brand-primary text-brand-primary text-xs font-bold hover:bg-brand-primary hover:text-white transition-all">
                      Upgrade to Enterprise →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}
