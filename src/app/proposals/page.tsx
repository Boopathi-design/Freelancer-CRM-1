"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb, Proposal } from "@/lib/mockDb";
import { useRouter as useNextRouter } from "next/navigation";
import {
  Plus,
  Search,
  FileText,
  ArrowRight,
  CheckCircle2,
  Eye,
  Send,
  XCircle,
  FileBadge,
  Clock,
  X,
} from "lucide-react";

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  "Draft": { bg: "bg-slate-100 text-slate-500", text: "text-slate-500", icon: <FileText size={11} /> },
  "Sent": { bg: "bg-blue-50 text-blue-600", text: "text-blue-600", icon: <Send size={11} /> },
  "Viewed": { bg: "bg-purple-50 text-purple-600", text: "text-purple-600", icon: <Eye size={11} /> },
  "Accepted": { bg: "bg-state-success/10 text-state-success", text: "text-state-success", icon: <CheckCircle2 size={11} /> },
  "Declined": { bg: "bg-state-danger/10 text-state-danger", text: "text-state-danger", icon: <XCircle size={11} /> },
  "Converted": { bg: "bg-emerald-50 text-emerald-600", text: "text-emerald-600", icon: <FileBadge size={11} /> },
};

const getStatusStyle = (status: string) =>
  statusConfig[status] ?? { bg: "bg-slate-100 text-slate-500", text: "text-slate-500", icon: null };

const getSuggestedAction = (status: string) => {
  switch (status) {
    case "Draft": return "Send";
    case "Sent":
    case "Viewed": return "Follow Up";
    case "Accepted": return "Convert to Invoice";
    default: return "View";
  }
};

const getActionStyle = (status: string) => {
  switch (status) {
    case "Draft": return "bg-brand-primary text-white hover:bg-brand-primary-hover";
    case "Sent":
    case "Viewed": return "bg-state-warning/10 text-state-warning hover:bg-state-warning/20";
    case "Accepted": return "bg-state-success/10 text-state-success hover:bg-state-success/20";
    default: return "bg-surface-bg text-text-muted hover:bg-border-line";
  }
};

export default function ProposalList() {
  const router = useNextRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setProposals(mockDb.getProposals());
  }, []);

  const filteredProposals = proposals.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total", value: proposals.length, color: "text-brand-primary" },
    { label: "Draft", value: proposals.filter(p => p.status === "Draft").length, color: "text-slate-500" },
    { label: "Sent / Viewed", value: proposals.filter(p => p.status === "Sent" || p.status === "Viewed").length, color: "text-state-warning" },
    { label: "Accepted", value: proposals.filter(p => p.status === "Accepted").length, color: "text-state-success" },
  ];

  return (
    <ProtectedRoute>
      <WorkspaceLayout
        title="Proposals"
        subtitle="Manage and track your project pitches"
      >
        <div className="space-y-6 max-w-7xl mx-auto">

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(stat => (
              <div key={stat.label} className="bg-white border border-border-line rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-text-muted font-medium mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border-line bg-white shadow-sm focus-within:border-brand-primary transition-all w-full md:max-w-md">
              <Search size={16} className="text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search Proposal Title, Client Name .."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none border-none text-sm text-text-main placeholder:text-text-muted w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-text-muted hover:text-text-main">
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => router.push("/proposals/new")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold transition-all shadow-md shadow-brand-primary/20 cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} />
              New Proposal
            </button>
          </div>

          {/* Proposals Table (CoStudio Style) */}
          <div className="bg-white border border-border-line rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-brand-primary-light text-[13px] font-semibold text-brand-primary/90 tracking-wide border-b border-border-line">
                    <th className="py-4 px-6 rounded-tl-2xl">Proposal Title</th>
                    <th className="py-4 px-6">Client</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Budget</th>
                    <th className="py-4 px-6">Created</th>
                    <th className="py-4 px-6 rounded-tr-2xl text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-line/50 text-[14px] font-medium text-text-main">
                  {filteredProposals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-text-muted text-sm">
                        No proposals found. Click &ldquo;New Proposal&rdquo; to get started!
                      </td>
                    </tr>
                  ) : (
                    filteredProposals.map((proposal) => {
                      const sConfig = getStatusStyle(proposal.status);
                      const action = getSuggestedAction(proposal.status);
                      const actionStyle = getActionStyle(proposal.status);

                      return (
                        <tr
                          key={proposal.id}
                          onClick={() => router.push(`/proposals/${proposal.id}`)}
                          className="hover:bg-surface-bg/60 transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-6">
                            <p className="font-semibold text-text-main group-hover:text-brand-primary transition-colors">{proposal.title}</p>
                            <p className="text-[12px] text-text-muted mt-0.5 font-normal">{proposal.id}</p>
                          </td>
                          <td className="py-4 px-6 text-text-main font-medium">{proposal.clientName}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${sConfig.bg}`}>
                              {sConfig.icon}
                              {proposal.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-semibold text-text-main tabular-nums">
                            ₹{proposal.budget.toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-6 text-text-muted font-normal">
                            {new Date(proposal.createdAt).toLocaleDateString("en-IN", {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (action === "Convert to Invoice") {
                                    router.push("/invoices?new=true");
                                  } else {
                                    router.push(`/proposals/${proposal.id}`);
                                  }
                                }}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${actionStyle}`}
                              >
                                {action}
                                <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-white border-t border-border-line text-sm text-text-muted font-medium flex items-center justify-between">
              <span>Showing {filteredProposals.length} of {proposals.length} proposals</span>
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}
