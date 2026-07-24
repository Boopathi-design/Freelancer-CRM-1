"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb, Deal, Client } from "@/lib/mockDb";
import { useRouter } from "next/router";
import { useRouter as useNextRouter } from "next/navigation";
import {
  Kanban,
  Table,
  Plus,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  Calendar,
  X,
  User,
  ArrowLeftRight,
  ChevronRight,
  Check,
} from "lucide-react";

export default function Pipeline() {
  const router = useNextRouter();
  const [activeTab, setActiveTab] = useState<"kanban" | "grid">("kanban");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [minConfidence, setMinConfidence] = useState(0);

  // Modal / Flyout state
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states for new deal
  const [newDealTitle, setNewDealTitle] = useState("");
  const [newDealClient, setNewDealClient] = useState("");
  const [newDealValue, setNewDealValue] = useState("");
  const [newDealStage, setNewDealStage] = useState<Deal["stage"]>("lead");
  const [newDealConfidence, setNewDealConfidence] = useState("50");
  const [newDealTargetDate, setNewDealTargetDate] = useState("");
  const [newDealNotes, setNewDealNotes] = useState("");

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    setDeals(mockDb.getDeals());
    setClients(mockDb.getClients());
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => {
      loadData();
    };
    window.addEventListener("invoicehq_db_update", handleDbUpdate);
    return () =>
      window.removeEventListener("invoicehq_db_update", handleDbUpdate);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Drag and Drop handlers (Standard HTML5)
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("text/plain", dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: Deal["stage"]) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain");
    if (!dealId) return;

    const updated = mockDb.updateDealStage(dealId, targetStage);
    if (updated) {
      triggerToast(`Moved "${updated.title}" to ${targetStage.toUpperCase()}`);
      window.dispatchEvent(new Event("invoicehq_db_update"));
    }
  };

  // Quick Action: Add Deal
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealTitle || !newDealClient || !newDealValue) {
      alert("Please fill in Title, Client and Value");
      return;
    }

    const clientObj =
      clients.find((c) => c.company === newDealClient) || clients[0];

    mockDb.addDeal({
      clientName: newDealClient,
      contact: clientObj ? clientObj.contact : "Direct Lead",
      title: newDealTitle,
      value: parseFloat(newDealValue),
      stage: newDealStage,
      confidence: parseInt(newDealConfidence, 10),
      targetDate:
        newDealTargetDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      notes: newDealNotes,
    });

    triggerToast(`Added deal opportunity "${newDealTitle}"`);
    setIsAddOpen(false);

    // Reset Form
    setNewDealTitle("");
    setNewDealClient("");
    setNewDealValue("");
    setNewDealStage("lead");
    setNewDealConfidence("50");
    setNewDealTargetDate("");
    setNewDealNotes("");

    window.dispatchEvent(new Event("invoicehq_db_update"));
  };

  // Transition stage inside flyout
  const handleMoveStage = (dealId: string, stage: Deal["stage"]) => {
    const updated = mockDb.updateDealStage(dealId, stage);
    if (updated) {
      setSelectedDeal(updated);
      triggerToast(`Stage updated to ${stage.toUpperCase()}`);
      window.dispatchEvent(new Event("invoicehq_db_update"));
    }
  };

  // End-to-end Flow trigger
  const handleTriggerAIDraftScope = (deal: Deal) => {
    // Generate AI Proposal contents and store in localStorage to seed the Proposal builder page
    const aiScope = `Complete scope of work for "${deal.title}" with client ${deal.clientName}.
Deliverables include:
- Interactive user flows and wireframes.
- High-fidelity visual mockups using Figma design system assets.
- Production-grade responsive front-end template compiled in React/Next.js.
- Database relational design and UPI checkouts hooks integration.`;

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "invoicehq_proposal_draft_title",
        `${deal.title} Proposal`,
      );
      localStorage.setItem("invoicehq_proposal_draft_client", deal.clientName);
      localStorage.setItem("invoicehq_proposal_draft_scope", aiScope);
      localStorage.setItem(
        "invoicehq_proposal_draft_budget",
        String(deal.value),
      );
    }

    triggerToast(
      "AI Proposal draft compiled! Redirecting to Proposals generator...",
    );

    // Redirect to Proposals screen
    router.push("/proposals");
  };

  // Filter deals
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = stageFilter === "all" || deal.stage === stageFilter;
    const matchesConfidence = deal.confidence >= minConfidence;

    return matchesSearch && matchesStage && matchesConfidence;
  });

  const columns: { key: Deal["stage"]; label: string; color: string }[] = [
    {
      key: "lead",
      label: "Leads",
      color:
        "border-t-2 border-t-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400",
    },
    {
      key: "proposal",
      label: "Proposal",
      color:
        "border-t-2 border-t-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400",
    },
    {
      key: "negotiation",
      label: "Negotiation",
      color:
        "border-t-2 border-t-purple-500 bg-purple-500/5 text-purple-600 dark:text-purple-400",
    },
    {
      key: "won",
      label: "Won (Closed)",
      color:
        "border-t-2 border-t-state-success bg-state-success/5 text-state-success",
    },
    {
      key: "lost",
      label: "Lost",
      color:
        "border-t-2 border-t-state-danger bg-state-danger/5 text-state-danger",
    },
  ];

  return (
    <ProtectedRoute>
      <WorkspaceLayout
        title="Sales Pipeline"
        subtitle="Manage deals and track client conversions"
      >
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
            <Sparkles size={14} className="text-brand-primary animate-pulse" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Controls Toolbar Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card border border-border-line p-4 rounded-2xl shadow-sm">
            {/* View Toggles */}
            <div className="flex items-center gap-2 bg-surface-bg p-1 rounded-xl border border-border-line self-start">
              <button
                onClick={() => setActiveTab("kanban")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all focus-ring-indigo cursor-pointer ${
                  activeTab === "kanban"
                    ? "bg-surface-card text-text-main shadow-sm"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                <Kanban size={14} />
                <span>Kanban Board</span>
              </button>
              <button
                onClick={() => setActiveTab("grid")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all focus-ring-indigo cursor-pointer ${
                  activeTab === "grid"
                    ? "bg-surface-card text-text-main shadow-sm"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                <Table size={14} />
                <span>Data Grid Master</span>
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs font-semibold text-text-muted">
                <Search size={13} />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none border-none text-text-main placeholder:text-text-muted w-36"
                />
              </div>

              {activeTab === "grid" && (
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs font-semibold text-text-main outline-none"
                >
                  <option value="all">All Stages</option>
                  <option value="lead">Leads</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              )}

              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted border border-border-line px-3 py-2 rounded-xl bg-surface-bg">
                <Percent size={12} />
                <span>Conf &ge; {minConfidence}%</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="10"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                  className="w-16 accent-brand-primary cursor-pointer"
                />
              </div>

              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all focus-ring-indigo shadow-md shadow-brand-primary/15 cursor-pointer"
              >
                <Plus size={14} />
                <span>Log Opportunity</span>
              </button>
            </div>
          </div>

          {/* View Main Content */}
          {activeTab === "kanban" ? (
            /* KANBAN BOARD CONTAINER */
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
              {columns.map((col) => {
                const colDeals = filteredDeals.filter(
                  (d) => d.stage === col.key,
                );
                const colSum = colDeals.reduce((sum, d) => sum + d.value, 0);

                return (
                  <div
                    key={col.key}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.key)}
                    className={`border border-border-line bg-surface-card/65 rounded-2xl flex flex-col p-4 min-h-[550px] transition-colors`}
                  >
                    {/* Column Header */}
                    <div
                      className={`p-3 rounded-xl mb-4 flex items-center justify-between ${col.color}`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {col.label}
                      </span>
                      <span className="text-[10px] font-extrabold bg-surface-card px-2 py-0.5 rounded-full border border-border-line shadow-sm tabular-nums">
                        ₹{colSum.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Column Cards List */}
                    <div className="flex-1 space-y-3">
                      {colDeals.length === 0 ? (
                        <div className="h-full border border-dashed border-border-line rounded-xl py-12 flex items-center justify-center text-center text-[10px] text-text-muted font-medium">
                          Drag deals here
                        </div>
                      ) : (
                        colDeals.map((deal) => (
                          <div
                            key={deal.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, deal.id)}
                            onClick={() => setSelectedDeal(deal)}
                            className="bg-surface-card border border-border-line rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing hover:border-brand-primary/50 transition-all focus-ring-indigo focus:ring-2 select-none group relative"
                          >
                            <h4 className="text-xs font-bold text-text-main group-hover:text-brand-primary transition-colors line-clamp-1">
                              {deal.title}
                            </h4>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-[10px] text-text-muted font-medium truncate max-w-[100px]">
                                {deal.clientName}
                              </span>
                              <span className="text-xs font-extrabold text-text-main tabular-nums">
                                ₹{deal.value.toLocaleString("en-IN")}
                              </span>
                            </div>

                            {/* Confidence level meter */}
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <div className="flex-1 h-1 bg-surface-bg border border-border-line rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${deal.confidence}%` }}
                                  className={`h-full ${
                                    deal.stage === "won"
                                      ? "bg-state-success"
                                      : deal.stage === "lost"
                                        ? "bg-state-danger"
                                        : "bg-brand-primary"
                                  }`}
                                />
                              </div>
                              <span className="text-[9px] text-text-muted font-semibold tabular-nums">
                                {deal.confidence}%
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DATA-GRID MASTER INDEX TABLE */
            <div className="bg-surface-card border border-border-line rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-bg border-b border-border-line text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      <th className="py-4 px-6 font-bold w-1/4">
                        Client Identity
                      </th>
                      <th className="py-4 px-6 font-bold">Deal Opportunity</th>
                      <th className="py-4 px-6 font-bold">Phase Placement</th>
                      <th className="py-4 px-6 font-bold text-right">
                        Deal Value
                      </th>
                      <th className="py-4 px-6 font-bold">Confidence Rating</th>
                      <th className="py-4 px-6 font-bold">Target Date</th>
                      <th className="py-4 px-6 font-bold w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-line text-xs font-medium">
                    {filteredDeals.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-12 text-center text-text-muted"
                        >
                          No deals match the filtering query.
                        </td>
                      </tr>
                    ) : (
                      filteredDeals.map((deal) => (
                        <tr
                          key={deal.id}
                          onClick={() => setSelectedDeal(deal)}
                          className="hover:bg-surface-bg/40 cursor-pointer transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="font-bold text-text-main">
                              {deal.clientName}
                            </div>
                            <div className="text-[10px] text-text-muted font-normal mt-0.5">
                              {deal.contact}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-text-main group-hover:text-brand-primary transition-colors">
                            {deal.title}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                deal.stage === "won"
                                  ? "bg-state-success/10 text-state-success"
                                  : deal.stage === "lost"
                                    ? "bg-state-danger/10 text-state-danger"
                                    : "bg-brand-primary/10 text-brand-primary"
                              }`}
                            >
                              {deal.stage}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-extrabold text-text-main tabular-nums">
                            ₹{deal.value.toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2.5">
                              <span className="tabular-nums font-semibold w-8">
                                {deal.confidence}%
                              </span>
                              <div className="w-16 h-1.5 bg-surface-bg border border-border-line rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${deal.confidence}%` }}
                                  className={`h-full ${
                                    deal.stage === "won"
                                      ? "bg-state-success"
                                      : "bg-brand-primary"
                                  }`}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-text-muted font-semibold tabular-nums">
                            {new Date(deal.targetDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <ChevronRight
                              size={15}
                              className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-surface-bg border-t border-border-line flex items-center justify-between text-[11px] text-text-muted font-medium">
                <span>
                  Showing {filteredDeals.length} of {deals.length} deals
                </span>
                <span className="font-bold">
                  Total pipeline: ₹
                  {filteredDeals
                    .reduce((sum, d) => sum + d.value, 0)
                    .toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          {/* MODAL: ADD OPPORTUNITY */}
          {isAddOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-surface-card border border-border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-border-line flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-main">
                    Log New Opportunity
                  </h3>
                  <button
                    onClick={() => setIsAddOpen(false)}
                    className="p-1 rounded-lg hover:bg-surface-bg text-text-muted hover:text-text-main transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Project Opportunity Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Website Redesign"
                      value={newDealTitle}
                      onChange={(e) => setNewDealTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Associated Client
                    </label>
                    <select
                      value={newDealClient}
                      onChange={(e) => setNewDealClient(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary"
                    >
                      <option value="">Select client...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.company}>
                          {c.company}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Value (₹)
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 50000"
                        value={newDealValue}
                        onChange={(e) => setNewDealValue(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Stage Placement
                      </label>
                      <select
                        value={newDealStage}
                        onChange={(e) =>
                          setNewDealStage(e.target.value as Deal["stage"])
                        }
                        className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary"
                      >
                        <option value="lead">Lead</option>
                        <option value="proposal">Proposal</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Confidence ({newDealConfidence}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={newDealConfidence}
                        onChange={(e) => setNewDealConfidence(e.target.value)}
                        className="w-full accent-brand-primary cursor-pointer mt-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Target Closed Date
                      </label>
                      <input
                        type="date"
                        value={newDealTargetDate}
                        onChange={(e) => setNewDealTargetDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Activity Notes
                    </label>
                    <textarea
                      placeholder="Provide details about initial outreach..."
                      value={newDealNotes}
                      onChange={(e) => setNewDealNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary resize-none"
                    />
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
                      className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Save Deal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* FLYOUT: DEAL DETAILS SIDE PANEL */}
          {selectedDeal && (
            <>
              {/* Backdrop cover layer */}
              <div
                className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-40"
                onClick={() => setSelectedDeal(null)}
              />

              <div className="fixed top-0 right-0 h-full w-full max-w-md bg-surface-card border-l border-border-line z-50 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 select-none">
                {/* Flyout Header */}
                <div className="p-6 border-b border-border-line flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest leading-none block mb-1">
                      Opportunity Context
                    </span>
                    <h3 className="text-sm font-bold text-text-main line-clamp-1">
                      {selectedDeal.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedDeal(null)}
                    className="p-1 rounded-lg hover:bg-surface-bg text-text-muted hover:text-text-main transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Flyout Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Visual Status Stages Swapper */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2.5">
                      Pipeline Stage Placement
                    </label>
                    <div className="grid grid-cols-5 gap-1 bg-surface-bg p-1 rounded-xl border border-border-line">
                      {(
                        [
                          "lead",
                          "proposal",
                          "negotiation",
                          "won",
                          "lost",
                        ] as Deal["stage"][]
                      ).map((stg) => {
                        const active = selectedDeal.stage === stg;
                        return (
                          <button
                            key={stg}
                            onClick={() =>
                              handleMoveStage(selectedDeal.id, stg)
                            }
                            className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                              active
                                ? stg === "won"
                                  ? "bg-state-success text-white"
                                  : stg === "lost"
                                    ? "bg-state-danger text-white"
                                    : "bg-brand-primary text-white"
                                : "text-text-muted hover:text-text-main hover:bg-surface-card"
                            }`}
                          >
                            {stg}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial KPI Core Context */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-surface-bg border border-border-line shadow-inner">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Est. Value (₹)
                      </span>
                      <span className="text-sm font-black text-text-main tabular-nums">
                        ₹{selectedDeal.value.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-bg border border-border-line shadow-inner">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Confidence Level
                      </span>
                      <span className="text-sm font-black text-text-main tabular-nums flex items-center gap-1">
                        {selectedDeal.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* General metadata details */}
                  <div className="space-y-4 pt-4 border-t border-border-line">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-text-muted">
                        <User size={14} />
                        <span>Associated client:</span>
                      </div>
                      <span className="font-bold text-text-main">
                        {selectedDeal.clientName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-text-muted">
                        <Calendar size={14} />
                        <span>Target Close Date:</span>
                      </div>
                      <span className="font-semibold text-text-main tabular-nums">
                        {new Date(selectedDeal.targetDate).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-text-muted">
                        <ArrowLeftRight size={14} />
                        <span>Lead Date Created:</span>
                      </div>
                      <span className="font-semibold text-text-muted tabular-nums">
                        {new Date(selectedDeal.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Log Notes Section */}
                  <div className="pt-4 border-t border-border-line space-y-2">
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Deal Activity &amp; Status Logs
                    </h4>
                    <div className="p-3.5 rounded-xl bg-surface-bg/60 border border-border-line text-xs leading-relaxed text-text-main italic font-medium">
                      &ldquo;
                      {selectedDeal.notes || "No additional logs entered."}
                      &rdquo;
                    </div>
                  </div>

                  {/* End-to-End Deal Conversion Hook Trigger */}
                  {selectedDeal.stage === "won" && (
                    <div className="pt-2">
                      <div className="p-4 bg-state-success/5 border border-state-success/15 rounded-xl space-y-3 animate-in fade-in duration-200">
                        <div className="flex gap-2">
                          <Sparkles
                            size={15}
                            className="text-state-success shrink-0 mt-0.5 animate-pulse"
                          />
                          <p className="text-[11px] text-state-success font-semibold leading-normal">
                            Success! This deal is WON. Now you can draft the
                            scope and structure a project proposal template
                            automatically using AI.
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleTriggerAIDraftScope(selectedDeal)
                          }
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-state-success hover:bg-state-success/90 text-white text-xs font-bold transition-all focus-ring-indigo shadow-md shadow-state-success/10 cursor-pointer"
                        >
                          <span>Trigger AI Draft Scope</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Flyout Actions Footer */}
                <div className="p-6 border-t border-border-line bg-surface-bg/50">
                  <button
                    onClick={() => setSelectedDeal(null)}
                    className="w-full py-2.5 rounded-xl border border-border-line hover:bg-surface-card text-text-muted hover:text-text-main text-xs font-bold transition-all cursor-pointer"
                  >
                    Close panel
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
