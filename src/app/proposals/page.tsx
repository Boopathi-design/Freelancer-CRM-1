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
  MoreVertical,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  XCircle,
  FileBadge
} from "lucide-react";

// Helper for status styling
const getStatusConfig = (status: string) => {
  switch (status) {
    case "Draft": return { bg: "bg-surface-elevated border border-border-divider", text: "text-text-muted", icon: <FileText size={14} className="mr-1" /> };
    case "Sent": return { bg: "bg-blue-500/10 border border-blue-500/30", text: "text-blue-500", icon: <Send size={14} className="mr-1" /> };
    case "Viewed": return { bg: "bg-purple-500/10 border border-purple-500/30", text: "text-purple-500", icon: <Eye size={14} className="mr-1" /> };
    case "Accepted": return { bg: "bg-green-500/10 border border-green-500/30", text: "text-green-500", icon: <CheckCircle2 size={14} className="mr-1" /> };
    case "Declined": return { bg: "bg-red-500/10 border border-red-500/30", text: "text-red-500", icon: <XCircle size={14} className="mr-1" /> };
    case "Converted": return { bg: "bg-emerald-500/10 border border-emerald-500/30", text: "text-emerald-500", icon: <FileBadge size={14} className="mr-1" /> };
    default: return { bg: "bg-surface-elevated", text: "text-text-main", icon: null };
  }
};

const getSuggestedAction = (status: string) => {
  switch (status) {
    case "Draft": return "Send";
    case "Sent":
    case "Viewed": return "Follow Up";
    case "Accepted": return "Convert to Invoice";
    default: return "View";
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

  return (
    <ProtectedRoute>
      <WorkspaceLayout
        title="Proposals"
        subtitle="Manage and track your project pitches"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-elevated border border-border-divider rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors text-text-main"
            />
          </div>
          <button
            onClick={() => router.push("/proposals/new")}
            className="w-full md:w-auto bg-brand-primary text-brand-dark px-6 py-2.5 rounded-xl font-medium hover:bg-brand-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            New Proposal
          </button>
        </div>

        <div className="bg-surface-card border border-border-divider rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated border-b border-border-divider">
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Proposal Title</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Client</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Budget</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Created</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Suggested Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center text-text-muted">
                      No proposals found. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map((proposal) => {
                    const statusConfig = getStatusConfig(proposal.status);
                    const action = getSuggestedAction(proposal.status);
                    
                    return (
                      <tr 
                        key={proposal.id} 
                        onClick={() => router.push(`/proposals/${proposal.id}`)}
                        className="border-b border-border-divider hover:bg-surface-elevated/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-text-main">{proposal.title}</div>
                          <div className="text-xs text-text-muted mt-1">{proposal.id}</div>
                        </td>
                        <td className="py-4 px-6 text-text-main">{proposal.clientName}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.icon}
                            {proposal.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-text-main font-medium">
                          ₹{proposal.budget.toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-6 text-text-muted text-sm">
                          {new Date(proposal.createdAt).toLocaleDateString("en-IN", {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-between">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (action === "Convert to Invoice") {
                                  router.push("/invoices"); // or /invoices/new
                                } else {
                                  router.push(`/proposals/${proposal.id}`);
                                }
                              }}
                              className="text-sm font-medium text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1"
                            >
                              {action} <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </button>
                            <button className="text-text-muted hover:text-text-main p-1 rounded-md hover:bg-surface-elevated transition-colors" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical size={16} />
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
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}
