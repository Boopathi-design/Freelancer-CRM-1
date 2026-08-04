"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb, Proposal } from "@/lib/mockDb";
import { useParams, useRouter as useNextRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Send,
  FileBadge,
  Download,
  Save,
  Loader2,
  Clock,
  Wallet,
  MessageSquare
} from "lucide-react";

export default function ProposalDetail() {
  const router = useNextRouter();
  const params = useParams();
  const proposalId = params.id as string;
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (proposalId) {
      const p = mockDb.getProposals().find(x => x.id === proposalId);
      if (p) {
        setProposal(p);
        setEditedContent(p.content);
      }
    }
  }, [proposalId]);

  if (!proposal) {
    return (
      <ProtectedRoute>
        <WorkspaceLayout title="Proposal Not Found">
          <div className="p-8">Loading or not found...</div>
        </WorkspaceLayout>
      </ProtectedRoute>
    );
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      mockDb.updateProposal(proposal.id, { content: editedContent });
      setProposal({ ...proposal, content: editedContent });
      setIsEditing(false);
      setIsSaving(false);
    }, 600);
  };

  return (
    <ProtectedRoute>
      <WorkspaceLayout
        title={proposal.title}
        subtitle={`Client: ${proposal.clientName} • ID: ${proposal.id}`}
      >
        <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
          <button 
            onClick={() => router.push("/proposals")}
            className="flex items-center text-text-muted hover:text-text-main transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Proposals
          </button>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border-divider rounded-lg text-sm font-medium hover:bg-surface-elevated/80 transition-colors">
              <Download size={16} />
              PDF
            </button>
            <button 
              onClick={() => {
                mockDb.updateProposalStatus(proposal.id, "Sent");
                setProposal({...proposal, status: "Sent"});
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors"
            >
              <Send size={16} />
              Send to Client
            </button>
            <button 
              onClick={() => {
                // Here we'd convert to invoice
                mockDb.updateProposalStatus(proposal.id, "Converted");
                router.push("/invoices");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <FileBadge size={16} />
              Convert to Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface-card border border-border-divider rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                Project Details
                <span className="text-xs px-2 py-1 bg-surface-elevated rounded-full">{proposal.status}</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={14}/> Duration</div>
                  <div className="font-medium">{proposal.duration}</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><Wallet size={14}/> Budget</div>
                  <div className="font-medium text-emerald-500">₹{proposal.budget.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><MessageSquare size={14}/> Tone</div>
                  <div className="font-medium capitalize">{proposal.tone}</div>
                </div>
              </div>

              <hr className="border-border-divider my-6" />

              <div>
                <h4 className="font-medium mb-2">Scope of Work</h4>
                <p className="text-sm text-text-muted leading-relaxed">
                  {proposal.scopeOfWork}
                </p>
              </div>

              <hr className="border-border-divider my-6" />

              <div>
                <h4 className="font-medium mb-2">Deliverables</h4>
                <ul className="list-disc list-inside text-sm text-text-muted space-y-1">
                  {proposal.deliverables.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: AI Content */}
          <div className="lg:col-span-2">
            <div className="bg-surface-card border border-border-divider rounded-2xl p-6 shadow-sm h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                  Proposal Content
                </h3>
                {isEditing ? (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border-divider rounded-lg text-sm font-medium hover:bg-surface-elevated/80 transition-colors"
                  >
                    <Edit size={16} />
                    Edit Content
                  </button>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="flex-1 w-full bg-surface-elevated border border-border-divider rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary transition-colors resize-none font-mono text-text-main leading-relaxed"
                  style={{ minHeight: "400px" }}
                />
              ) : (
                <div 
                  className="prose prose-invert max-w-none text-text-main text-sm flex-1 bg-surface-bg p-6 rounded-xl border border-border-divider/50 overflow-y-auto"
                  style={{ minHeight: "400px" }}
                >
                  {proposal.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}
