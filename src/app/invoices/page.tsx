"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb, Invoice, Client, LineItem } from "@/lib/mockDb";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Trash2,
  Sparkles,
  Printer,
  ChevronLeft,
  ArrowRight,
  Send,
  Eye,
  CheckCircle,
  Clock,
  Settings,
  HelpCircle,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";

function InvoicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Mode: "list" or "build"
  const [mode, setMode] = useState<"list" | "build">("list");

  // Data States
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // List Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form State (Invoice Creation)
  const [selectedClientId, setSelectedClientId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("INV-2024-042");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<Omit<LineItem, "id">[]>([
    {
      description: "UI/UX Design — Mobile App",
      sac: "998314",
      qty: 1,
      rate: 45000,
      gst: 18,
    },
  ]);
  const [gstApplicable, setGstApplicable] = useState(true);
  const [notes, setNotes] = useState(
    "Payment due within 14 days. HDFC Bank: Arjun Kumar, A/C 00112233445, IFSC HDFC0001234. Late payment charged at 2% per month.",
  );

  // States
  const [isImproving, setIsImproving] = useState(false);
  const [improvingIndex, setImprovingIndex] = useState<number | null>(null);
  const [undoState, setUndoState] = useState<{
    index: number;
    original: string;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    setInvoices(mockDb.getInvoices());
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

  useEffect(() => {
    // Check search params for new action
    const isNew = searchParams.get("new");
    const editId = searchParams.get("id");

    if (isNew === "true") {
      setMode("build");

      // Seed default dates
      setIssueDate(new Date().toISOString().split("T")[0]);
      setDueDate(
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      );

      // Check for pre-filled proposals data
      if (typeof window !== "undefined") {
        const prefillClient = localStorage.getItem("invoicehq_prefill_client");
        const prefillAmount = localStorage.getItem("invoicehq_prefill_amount");
        const prefillTitle = localStorage.getItem("invoicehq_prefill_title");

        if (prefillClient) {
          const client = mockDb
            .getClients()
            .find((c) => c.company === prefillClient);
          if (client) setSelectedClientId(client.id);
        }

        if (prefillAmount && prefillTitle) {
          setItems([
            {
              description: prefillTitle,
              sac: "998314",
              qty: 1,
              rate: parseFloat(prefillAmount),
              gst: 18,
            },
          ]);
        }

        // Clean up
        localStorage.removeItem("invoicehq_prefill_client");
        localStorage.removeItem("invoicehq_prefill_amount");
        localStorage.removeItem("invoicehq_prefill_title");
      }
    } else if (editId) {
      // In a real app we'd load the invoice to edit
      const inv = mockDb.getInvoices().find((i) => i.id === editId);
      if (inv) {
        setMode("build");
        setSelectedClientId(inv.clientId);
        setInvoiceNo(inv.id);
        setIssueDate(inv.issueDate);
        setDueDate(inv.dueDate);
        setItems(inv.items.map(({ id, ...rest }) => rest));
        setGstApplicable(inv.gstApplicable);
        setNotes(inv.notes);
      }
    } else {
      setMode("list");
    }
  }, [searchParams]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Line Item Management
  const handleAddItem = () => {
    setItems([
      ...items,
      { description: "", sac: "998314", qty: 1, rate: 0, gst: 18 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    key: keyof LineItem | "description" | "sac" | "qty" | "rate" | "gst",
    value: any,
  ) => {
    const newItems = [...items];
    (newItems[index] as any)[key] = value;
    setItems(newItems);
  };

  // AI Description Helper
  const handleAIImprove = async (index: number) => {
    const currentDesc = items[index].description;
    if (!currentDesc.trim()) {
      alert("Please enter a basic description first.");
      return;
    }

    setIsImproving(true);
    setImprovingIndex(index);
    setUndoState(null);
    triggerToast("Optimizing description with AI...");

    try {
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "improve-line-item",
          payload: { description: currentDesc },
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "AI description rewrite failed.");
      }

      const improvedText = result.text || currentDesc;
      handleUpdateItem(index, "description", improvedText);
      setUndoState({ index, original: currentDesc });
      window.setTimeout(() => {
        setUndoState((state) => (state?.index === index ? null : state));
      }, 4000);
      triggerToast("AI Improved description applied!");
    } catch (error) {
      console.error("AI improvement failed:", error);
      triggerToast("AI description update failed. Please try again.");
    } finally {
      setIsImproving(false);
      setImprovingIndex(null);
    }
  };

  // Math Calculations (Strict tabular-nums)
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);

  // Intra-state standard splits: CGST (9%) + SGST (9%) = Total 18%.
  const cgst = gstApplicable ? subtotal * 0.09 : 0;
  const sgst = gstApplicable ? subtotal * 0.09 : 0;
  const totalAmount = subtotal + cgst + sgst;

  const handleSaveDraft = () => {
    saveInvoice("draft");
  };

  const handlePreviewSend = () => {
    saveInvoice("sent");
  };

  const saveInvoice = (status: Invoice["status"]) => {
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) {
      alert("Please select a client.");
      return;
    }

    const payload = {
      clientId: client.id,
      clientName: client.company,
      clientContact: client.contact,
      clientEmail: client.email,
      clientGstin: client.gstin,
      issueDate,
      dueDate,
      amount: totalAmount,
      status,
      items: items.map((it, idx) => ({ ...it, id: `i_${idx}_${Date.now()}` })),
      gstApplicable,
      notes,
    };

    mockDb.addInvoice(payload);
    triggerToast(`Invoice ${invoiceNo} compiled as ${status.toUpperCase()}!`);

    // Clear URL parameters to go back to list
    router.push("/invoices");
    setMode("list");
    window.dispatchEvent(new Event("invoicehq_db_update"));
  };

  // Filters for invoice lists
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.amount.toString().includes(searchQuery);

    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalOutstandingSum = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <ProtectedRoute>
      <WorkspaceLayout
        title={mode === "list" ? "Invoices" : "Invoice Builder"}
        subtitle={
          mode === "list"
            ? "Track status and act on open invoices"
            : "Create or edit invoice documentation"
        }
      >
        {/* Toast popup */}
        {toastMsg && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
            <Sparkles size={14} className="text-brand-primary animate-pulse" />
            <span>{toastMsg}</span>
          </div>
        )}

        {mode === "list" ? (
          /* ================== TABULAR LIST VIEW ================== */
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Invoices",
                  value: invoices.length,
                  color: "text-brand-primary",
                  bg: "bg-brand-primary-light",
                },
                {
                  label: "Paid",
                  value: invoices.filter((i) => i.status === "paid").length,
                  color: "text-state-success",
                  bg: "bg-state-success/10",
                },
                {
                  label: "Overdue",
                  value: invoices.filter((i) => i.status === "overdue").length,
                  color: "text-state-danger",
                  bg: "bg-state-danger/10",
                },
                {
                  label: "Outstanding",
                  value: `₹${totalOutstandingSum.toLocaleString("en-IN")}`,
                  color: "text-state-warning",
                  bg: "bg-state-warning/10",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border border-border-line rounded-2xl p-4 shadow-sm"
                >
                  <p className="text-xs text-text-muted font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-xl font-bold tabular-nums ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* List Controls (CoStudio Style) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {["all", "draft", "sent", "viewed", "paid", "overdue"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer capitalize ${
                        statusFilter === status
                          ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                          : "bg-white text-text-muted border border-border-line hover:text-text-main hover:border-brand-primary/30"
                      }`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>

              {/* Search + New Invoice */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border-line text-sm text-text-muted bg-white shadow-sm focus-within:border-brand-primary transition-all">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none border-none text-text-main placeholder:text-text-muted w-44"
                  />
                </div>
                <button
                  onClick={() => router.push("/invoices?new=true")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold transition-all shadow-md shadow-brand-primary/20 cursor-pointer whitespace-nowrap"
                >
                  <Plus size={16} />
                  <span>New Invoice</span>
                </button>
              </div>
            </div>

            {/* Invoice Table (CoStudio Style) */}
            <div className="bg-white border border-border-line rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[960px]">
                  <thead>
                    <tr className="bg-brand-primary-light text-[13px] font-semibold text-brand-primary/90 tracking-wide border-b border-border-line">
                      <th className="py-4 px-6 rounded-tl-2xl">Invoice #</th>
                      <th className="py-4 px-6">Client</th>
                      <th className="py-4 px-6">Issue Date</th>
                      <th className="py-4 px-6">Due Date</th>
                      <th className="py-4 px-6 text-right">Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 rounded-tr-2xl">Next Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-line/50 text-[14px] font-medium text-text-main">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-16 text-center text-text-muted text-sm"
                        >
                          No invoices found. Click &ldquo;New Invoice&rdquo; to
                          create one.
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => {
                        const isOverdue = inv.status === "overdue";
                        const statusStyle: Record<string, string> = {
                          paid: "bg-state-success/10 text-state-success",
                          overdue: "bg-state-danger/10 text-state-danger",
                          draft: "bg-slate-100 text-slate-500",
                          sent: "bg-state-warning/10 text-state-warning",
                          viewed: "bg-brand-primary-light text-brand-primary",
                        };
                        return (
                          <tr
                            key={inv.id}
                            onClick={() =>
                              router.push(`/invoices?id=${inv.id}`)
                            }
                            className="hover:bg-surface-bg/60 cursor-pointer transition-colors group"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    inv.status === "paid"
                                      ? "bg-state-success"
                                      : inv.status === "overdue"
                                        ? "bg-state-danger"
                                        : inv.status === "draft"
                                          ? "bg-slate-400"
                                          : "bg-state-warning"
                                  }`}
                                />
                                <span className="font-semibold text-brand-primary group-hover:underline">
                                  {inv.id}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <p className="font-semibold text-text-main">
                                {inv.clientName}
                              </p>
                              <p className="text-[12px] text-text-muted mt-0.5">
                                {inv.clientContact}
                              </p>
                            </td>
                            <td className="py-4 px-6 text-text-muted">
                              {new Date(inv.issueDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="py-4 px-6">
                              {isOverdue ? (
                                <span className="text-state-danger font-semibold">
                                  {Math.round(
                                    (Date.now() -
                                      new Date(inv.dueDate).getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  ) || 8}
                                  d overdue
                                </span>
                              ) : (
                                <span className="text-text-main">
                                  {new Date(inv.dueDate).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right font-bold tabular-nums text-text-main">
                              ₹{inv.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${statusStyle[inv.status] || "bg-slate-100 text-slate-500"}`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-brand-primary font-semibold text-sm">
                              {inv.nextAction}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-white border-t border-border-line flex items-center justify-between text-sm text-text-muted font-medium">
                <span>
                  Showing {filteredInvoices.length} of {invoices.length}{" "}
                  invoices
                </span>
                <span className="font-bold text-text-main tabular-nums">
                  Total outstanding: ₹
                  {totalOutstandingSum.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ================== SPLIT PANE CREATOR VIEW ================== */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-[calc(100vh-140px)]">
            {/* LEFT FORM PANE */}
            <div className="bg-surface-card border border-border-line rounded-2xl p-6 shadow-sm overflow-y-auto flex flex-col justify-between">
              <div className="space-y-6">
                {/* Back to list trigger */}
                <button
                  onClick={() => {
                    router.push("/invoices");
                    setMode("list");
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Back to Directory</span>
                </button>

                <div className="border-b border-border-line pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-text-main">
                      Invoice Details
                    </h3>
                    <p className="text-[11px] text-text-muted">
                      Draft client invoice documentation
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-state-warning/10 text-state-warning uppercase">
                    Draft
                  </span>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Select Client
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary"
                    >
                      <option value="">Choose client profile...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company} &mdash; {c.contact}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Invoice Code
                      </label>
                      <input
                        type="text"
                        disabled
                        value={invoiceNo}
                        className="w-full px-3 py-2 rounded-xl bg-surface-bg/55 border border-border-line text-xs text-text-muted outline-none cursor-not-allowed tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        required
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        required
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary tabular-nums"
                      />
                    </div>
                  </div>

                  {/* Line Items Form */}
                  <div className="pt-4 border-t border-border-line">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Line Items
                      </span>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1 text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
                      >
                        <Plus size={11} />
                        <span>Add line item</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 bg-surface-bg border border-border-line rounded-xl space-y-3 relative group"
                        >
                          {/* Remove item button */}
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="absolute top-2 right-2 p-1.5 rounded-lg text-text-muted hover:text-state-danger hover:bg-state-danger/10 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}

                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
                                Description
                              </label>
                              <div className="flex gap-1.5 items-stretch">
                                <input
                                  type="text"
                                  required
                                  placeholder="Describe services..."
                                  value={item.description}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      index,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-card border border-border-line text-[11px] text-text-main outline-none focus:border-brand-primary transition-opacity duration-300"
                                  style={{
                                    opacity: improvingIndex === index ? 0.7 : 1,
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAIImprove(index)}
                                  disabled={improvingIndex === index}
                                  className="px-2 rounded-lg bg-brand-primary-light hover:bg-brand-primary/20 text-brand-primary text-[10px] font-semibold transition-colors flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                  title="Optimize description with AI"
                                >
                                  {improvingIndex === index ? (
                                    <Loader2
                                      size={11}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Sparkles size={11} />
                                  )}
                                </button>
                                {undoState?.index === index && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateItem(
                                        index,
                                        "description",
                                        undoState.original,
                                      );
                                      setUndoState(null);
                                    }}
                                    className="px-2 py-1 rounded-lg border border-border-line bg-white text-[10px] font-bold text-text-muted hover:text-text-main transition-colors cursor-pointer"
                                  >
                                    Undo
                                  </button>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
                                SAC/HSN
                              </label>
                              <input
                                type="text"
                                required
                                value={item.sac}
                                onChange={(e) =>
                                  handleUpdateItem(index, "sac", e.target.value)
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-card border border-border-line text-[11px] text-text-main outline-none focus:border-brand-primary tabular-nums"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
                                Quantity
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={item.qty}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    index,
                                    "qty",
                                    parseInt(e.target.value, 10) || 1,
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-card border border-border-line text-[11px] text-text-main outline-none focus:border-brand-primary tabular-nums"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
                                Rate (₹)
                              </label>
                              <input
                                type="number"
                                required
                                min="0"
                                value={item.rate || ""}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    index,
                                    "rate",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-card border border-border-line text-[11px] text-text-main outline-none focus:border-brand-primary tabular-nums"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
                                GST Rate
                              </label>
                              <select
                                value={item.gst}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    index,
                                    "gst",
                                    parseInt(e.target.value, 10),
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-card border border-border-line text-[11px] text-text-main outline-none focus:border-brand-primary"
                              >
                                <option value={18}>18%</option>
                                <option value={12}>12%</option>
                                <option value={5}>5%</option>
                                <option value={0}>0%</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tax localized settings */}
                  <div className="pt-4 border-t border-border-line flex items-center justify-between bg-surface-bg p-3.5 rounded-xl border border-border-line">
                    <div>
                      <h4 className="text-xs font-bold text-text-main">
                        GST Applicable (CGST + SGST)
                      </h4>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Intra-state &bull; 18%
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGstApplicable(!gstApplicable)}
                      className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${
                        gstApplicable ? "bg-brand-primary" : "bg-border-line"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                          gstApplicable ? "left-5" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Payment terms */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Payment Terms &amp; Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-border-line text-xs text-text-main outline-none focus:border-brand-primary resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="pt-4 border-t border-border-line flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 py-2.5 rounded-xl border border-border-line hover:bg-surface-bg text-text-muted hover:text-text-main text-xs font-bold transition-all cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handlePreviewSend}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-brand-primary/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Preview &amp; Send</span>
                </button>
              </div>
            </div>

            {/* RIGHT LIVE PREVIEW CANVAS */}
            <div className="bg-slate-100 dark:bg-slate-900 border border-border-line rounded-2xl p-6 shadow-sm overflow-y-auto flex flex-col items-center justify-start select-none">
              {/* Invoice Print Sheet */}
              <div className="w-full max-w-[480px] bg-white text-slate-900 border border-slate-200 rounded-xl shadow-xl p-8 flex flex-col justify-between min-h-[640px] text-[10px] font-sans">
                {/* Header */}
                <div>
                  <div className="flex justify-between items-start bg-slate-900 text-white -mx-8 -mt-8 p-6 rounded-t-xl mb-6">
                    <div>
                      <h2 className="text-sm font-bold tracking-tight">
                        ARK Design Studio
                      </h2>
                      <p className="text-[8px] text-slate-400 mt-1">
                        GSTIN: 27AAARK1234B1ZP &bull; Mumbai
                      </p>
                    </div>
                    <div className="text-right">
                      <h1 className="text-sm font-extrabold tracking-wider text-slate-300">
                        INVOICE
                      </h1>
                      <p className="text-[8px] text-slate-400 mt-1 tabular-nums">
                        {invoiceNo}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">
                        Billed To
                      </span>
                      <h3 className="text-xs font-bold text-slate-900">
                        {selectedClient
                          ? selectedClient.company
                          : "Client Company Name"}
                      </h3>
                      <p className="text-[8px] text-slate-500 mt-0.5">
                        {selectedClient
                          ? `GSTIN: ${selectedClient.gstin} \u2022 ${selectedClient.contact}`
                          : "GSTIN: Client Profile Details"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-500">
                        <span className="font-semibold text-slate-400">
                          Issue Date:
                        </span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {issueDate || "—"}
                        </span>

                        <span className="font-semibold text-slate-400">
                          Due Date:
                        </span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {dueDate || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items list table */}
                  <div className="mt-4">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[8px] font-bold text-slate-400 text-left">
                          <th className="py-2">Description</th>
                          <th className="py-2 w-12 text-center">SAC</th>
                          <th className="py-2 w-8 text-center">Qty</th>
                          <th className="py-2 w-16 text-right">Rate</th>
                          <th className="py-2 w-16 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 max-w-[200px] leading-normal">
                              {it.description || "—"}
                            </td>
                            <td className="py-2.5 text-center tabular-nums">
                              {it.sac}
                            </td>
                            <td className="py-2.5 text-center tabular-nums">
                              {it.qty}
                            </td>
                            <td className="py-2.5 text-right tabular-nums">
                              ₹{it.rate.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2.5 text-right font-bold text-slate-900 tabular-nums">
                              ₹{(it.qty * it.rate).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total calculations */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col justify-end items-end space-y-1.5">
                  <div className="flex justify-between w-40 text-[8px] text-slate-500 font-medium">
                    <span>Subtotal:</span>
                    <span className="tabular-nums">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {gstApplicable && (
                    <>
                      <div className="flex justify-between w-40 text-[8px] text-slate-500 font-medium">
                        <span>CGST 9%:</span>
                        <span className="tabular-nums">
                          ₹{cgst.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between w-40 text-[8px] text-slate-500 font-medium">
                        <span>SGST 9%:</span>
                        <span className="tabular-nums">
                          ₹{sgst.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between w-40 text-xs font-black text-slate-900 border-t border-slate-200 pt-2">
                    <span>Total Due:</span>
                    <span className="tabular-nums">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="pt-6 w-full text-[7px] text-slate-400 font-medium border-t border-slate-100 mt-6 leading-relaxed">
                    <span className="font-bold text-slate-500 uppercase block mb-1">
                      Notes &amp; Payment terms
                    </span>
                    {notes || "No payment terms provided."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}

export default function Invoices() {
  return (
    <Suspense
      fallback={
        <WorkspaceLayout
          title="Invoices"
          subtitle="Track status and act on open invoices"
        >
          <div className="py-12 text-center text-text-muted animate-pulse">
            Loading Invoice Registry...
          </div>
        </WorkspaceLayout>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
