"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb, Client } from "@/lib/mockDb";
import { useRouter as useNextRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  FileText,
  Clock,
  Briefcase,
  AlertCircle,
  TrendingUp,
  Download,
  Share2,
} from "lucide-react";

export default function Proposals() {
  const router = useNextRouter();
  const [clients, setClients] = useState<Client[]>([]);

  // Form Fields
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [scope, setScope] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [duration, setDuration] = useState("4 weeks");
  const [budget, setBudget] = useState("");
  const [tone, setTone] = useState("Professional");

  // Output Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const [revealedDoc, setRevealedDoc] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setClients(mockDb.getClients());

    // Check if redirecting from pipeline with preset data
    if (typeof window !== "undefined") {
      const draftTitle = localStorage.getItem("invoicehq_proposal_draft_title");
      const draftClient = localStorage.getItem(
        "invoicehq_proposal_draft_client",
      );
      const draftScope = localStorage.getItem("invoicehq_proposal_draft_scope");
      const draftBudget = localStorage.getItem(
        "invoicehq_proposal_draft_budget",
      );

      if (draftTitle) setTitle(draftTitle);
      if (draftClient) setClientName(draftClient);
      if (draftScope) {
        setScope(draftScope);
        setDeliverables(
          "Figma Files, Web App Prototypes, Responsive CSS Layout, Relational Schemas",
        );
      }
      if (draftBudget) setBudget(draftBudget);

      // Clean up localStorage keys so they don't persist on manual refreshes
      localStorage.removeItem("invoicehq_proposal_draft_title");
      localStorage.removeItem("invoicehq_proposal_draft_client");
      localStorage.removeItem("invoicehq_proposal_draft_scope");
      localStorage.removeItem("invoicehq_proposal_draft_budget");
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const runProposalGeneration = async () => {
    if (!title || !clientName || !budget) {
      alert("Please fill in Title, Client and Budget");
      return;
    }

    setIsGenerating(true);
    setIsRevealing(false);
    setGeneratedDoc(null);
    setRevealedDoc("");

    try {
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "proposal",
          payload: {
            title,
            client: clientName,
            scope:
              scope ||
              "Deliver full-scale design implementation and software architecture.",
            deliverables:
              deliverables ||
              "Figma Design Files, Next.js Prototypes, Relational Schemas, Local Payment Gateway Integration",
            duration,
            budget,
            tone,
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "AI proposal generation failed.");
      }

      const nextDoc = result.text || "Proposal generation produced no content.";
      setGeneratedDoc(nextDoc);
      setRevealedDoc("");
      setIsRevealing(true);

      let charIndex = 0;
      const interval = window.setInterval(() => {
        charIndex += 1;
        setRevealedDoc(nextDoc.slice(0, charIndex));

        if (charIndex >= nextDoc.length) {
          window.clearInterval(interval);
          setIsRevealing(false);
          setIsGenerating(false);
        }
      }, 12);

      triggerToast("AI Proposal generated successfully!");
      mockDb.addLog(
        "proposal_generated",
        `Created AI proposal template '${title}' for client ${clientName} valued at ₹${parseFloat(budget).toLocaleString("en-IN")}.`,
      );
    } catch (error) {
      console.error("Proposal generation failed:", error);
      setIsGenerating(false);
      setIsRevealing(false);
      triggerToast("AI proposal generation failed. Please try again.");
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    runProposalGeneration();
  };

  const handleRegenerate = () => {
    runProposalGeneration();
  };

  const handleConvertToInvoice = () => {
    if (!generatedDoc) return;

    // Save project specs in localStorage to pre-fill the Invoice Builder page
    if (typeof window !== "undefined") {
      localStorage.setItem("invoicehq_prefill_client", clientName);
      localStorage.setItem("invoicehq_prefill_amount", budget);
      localStorage.setItem("invoicehq_prefill_title", title);
    }

    triggerToast("Proposal converted! Initializing Billing Studio...");

    // Redirect to Invoices screen
    router.push("/invoices?new=true");
  };

  return (
    <ProtectedRoute>
      <WorkspaceLayout
        title="Proposals Studio"
        subtitle="Generate project proposals and convert them to active bills"
      >
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
            <Sparkles size={14} className="text-brand-primary animate-pulse" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-[calc(100vh-140px)]">
          {/* Left Side: Form Inputs */}
          <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm overflow-y-auto flex flex-col justify-between">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border-line">
                <Sparkles
                  className="text-brand-primary animate-pulse"
                  size={18}
                />
                <h3 className="text-sm font-bold text-text-main">
                  AI Proposal Generator
                </h3>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign for Webcraft"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  Client Organization
                </label>
                <select
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.company}>
                      {c.company}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  Scope of Work Details
                </label>
                <textarea
                  required
                  placeholder="Complete website redesign including UX audit, wireframes, visual systems, and handoffs..."
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  Core Deliverables
                </label>
                <input
                  type="text"
                  placeholder="Comma separated: Wireframes, UI Designs, Figma System, React Code"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Budget ₹"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Creative">Creative</option>
                    <option value="Direct/Concise">Concise</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all focus-ring-indigo shadow-lg shadow-brand-primary/20 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Analyzing Project Scope...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Side: Preview / Generated Output Document */}
          <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm overflow-y-auto flex flex-col justify-between items-stretch">
            {isGenerating && (
              <div className="flex-1 flex flex-col justify-center items-stretch space-y-4 p-8">
                <div className="h-6 bg-surface-bg rounded animate-pulse w-1/3" />
                <div className="h-4 bg-surface-bg rounded animate-pulse w-1/2" />
                <div className="space-y-2 pt-4">
                  <div className="h-3 bg-surface-bg rounded animate-pulse" />
                  <div className="h-3 bg-surface-bg rounded animate-pulse" />
                  <div className="h-3 bg-surface-bg rounded animate-pulse w-5/6" />
                </div>
                <div className="space-y-2 pt-4">
                  <div className="h-3 bg-surface-bg rounded animate-pulse" />
                  <div className="h-3 bg-surface-bg rounded animate-pulse w-3/4" />
                </div>
              </div>
            )}

            {!isGenerating && !generatedDoc && (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
                <div className="w-12 h-12 rounded-full bg-surface-bg border border-border-line flex items-center justify-center text-text-muted mb-4">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xs font-bold text-text-main">
                  Generated Proposal
                </h3>
                <p className="text-[11px] text-text-muted mt-1 max-w-[200px] leading-normal">
                  Fill in the details and generate your proposal
                </p>
              </div>
            )}

            {!isGenerating && generatedDoc && (
              <div className="flex-grow flex flex-col justify-between h-full space-y-6">
                {/* Document Sheet layout */}
                <div className="flex-1 p-6 bg-surface-bg/50 border border-border-line rounded-xl overflow-y-auto font-mono text-[10px] whitespace-pre-wrap leading-relaxed text-text-main tabular-nums select-text">
                  {revealedDoc}
                </div>

                {/* Action bar for generated document */}
                <div className="flex items-center gap-3 pt-4 border-t border-border-line">
                  <button
                    onClick={handleRegenerate}
                    className="px-3 py-2.5 rounded-xl border border-border-line bg-surface-bg text-[10px] font-bold text-text-main hover:text-text-main transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isGenerating || isRevealing}
                  >
                    Regenerate
                  </button>

                  <button
                    onClick={handleConvertToInvoice}
                    disabled={isGenerating || isRevealing}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all focus-ring-indigo shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText size={13} />
                    <span>Convert to Invoice</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    onClick={() =>
                      triggerToast("Proposal downloaded as PDF (simulation)")
                    }
                    disabled={isGenerating || isRevealing}
                    className="p-2.5 rounded-xl border border-border-line hover:bg-surface-bg text-text-muted hover:text-text-main transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download PDF"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}
