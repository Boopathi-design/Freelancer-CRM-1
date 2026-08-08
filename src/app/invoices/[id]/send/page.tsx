"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb, Invoice } from "@/lib/mockDb";
import {
  Check,
  Copy,
  Eye,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
} from "lucide-react";

const formatMoney = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export default function InvoiceSendPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id ?? "");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<"client" | "workspace">(
    "client",
  );

  useEffect(() => {
    if (!invoiceId) return;
    const found = mockDb
      .getInvoices()
      .find((item) => item.id.toLowerCase() === invoiceId.toLowerCase());
    setInvoice(found ?? null);
  }, [invoiceId]);

  const publicLink = useMemo(() => {
    if (typeof window === "undefined" || !invoiceId) return "";
    return `${window.location.origin}/pay/${invoiceId}`;
  }, [invoiceId]);

  const handleCopy = async () => {
    if (!publicLink) return;
    await navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleEmail = () => {
    if (!invoice) return;
    const subject = encodeURIComponent(
      `Invoice ${invoice.id} is ready for review`,
    );
    const body = encodeURIComponent(
      `Hello ${invoice.clientName},\n\nPlease review and pay invoice ${invoice.id} for ${formatMoney(invoice.amount)} before ${new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}.\n\nPublic link: ${publicLink}`,
    );
    window.location.href = `mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`;
  };

  const handleWhatsApp = () => {
    if (!invoice) return;
    const phone = invoice.clientEmail.includes("@")
      ? "+919876543210"
      : "+919876543210";
    const message = encodeURIComponent(
      `Hello ${invoice.clientName}, please review invoice ${invoice.id} for ${formatMoney(invoice.amount)}: ${publicLink}`,
    );
    window.open(
      `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`,
      "_blank",
    );
  };

  const handleMarkSent = () => {
    if (!invoice) return;
    const updated = mockDb.updateInvoiceStatus(invoice.id, "sent");
    if (updated) {
      setInvoice(updated);
      router.push("/invoices");
    }
  };

  if (!invoice) {
    return (
      <ProtectedRoute>
        <WorkspaceLayout
          title="Invoice send"
          subtitle="Preview and share invoice"
        >
          <div className="rounded-2xl border border-border-line bg-white p-8 text-center text-sm text-text-muted">
            Invoice not found.
          </div>
        </WorkspaceLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <WorkspaceLayout
        title="Preview & Send"
        subtitle="Share and send invoice to client"
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-border-line bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    Invoice summary
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-text-main">
                    {invoice.id}
                  </h3>
                </div>
                <span className="rounded-full bg-brand-primary-light px-3 py-1 text-xs font-semibold text-brand-primary">
                  {invoice.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border-line bg-surface-bg p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
                    Client
                  </p>
                  <p className="mt-2 text-sm font-bold text-text-main">
                    {invoice.clientName}
                  </p>
                </div>
                <div className="rounded-xl border border-border-line bg-surface-bg p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
                    Amount
                  </p>
                  <p className="mt-2 text-lg font-black text-text-main tabular-nums">
                    {formatMoney(invoice.amount)}
                  </p>
                </div>
                <div className="rounded-xl border border-border-line bg-surface-bg p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
                    Due date
                  </p>
                  <p className="mt-2 text-sm font-bold text-text-main">
                    {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="rounded-xl border border-border-line bg-surface-bg p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-bold text-text-main capitalize">
                    {invoice.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-line bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                Share options
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 rounded-xl border border-border-line bg-surface-bg p-3">
                  <input
                    readOnly
                    value={publicLink}
                    className="w-full bg-transparent text-xs outline-none text-text-main"
                  />
                  <button
                    onClick={handleCopy}
                    className="rounded-lg border border-border-line bg-white p-2 text-text-main"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                <Link
                  href={`/pay/${invoice.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-line bg-white px-4 py-3 text-sm font-semibold text-text-main"
                >
                  <Eye size={15} />
                  Preview Portal · Client view
                </Link>

                <button
                  onClick={handleEmail}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  <Mail size={15} />
                  Send via Email
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white"
                >
                  <MessageCircle size={15} />
                  Send via WhatsApp
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-line bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  Client preview
                </p>
                <h3 className="mt-2 text-lg font-bold text-text-main">
                  {previewMode === "client"
                    ? "Client view"
                    : "Workspace preview"}
                </h3>
              </div>

              <div className="inline-flex rounded-xl border border-border-line bg-surface-bg p-1">
                <button
                  onClick={() => setPreviewMode("client")}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${previewMode === "client" ? "bg-white text-text-main shadow-sm" : "text-text-muted"}`}
                >
                  <Eye size={14} className="mr-1 inline" />
                  Client
                </button>
                <button
                  onClick={() => setPreviewMode("workspace")}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${previewMode === "workspace" ? "bg-white text-text-main shadow-sm" : "text-text-muted"}`}
                >
                  Workspace
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              {previewMode === "client" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                        Public portal
                      </p>
                      <h4 className="mt-2 text-lg font-black text-text-main">
                        {invoice.clientName}
                      </h4>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                      <ShieldCheck size={12} /> Secure
                    </span>
                  </div>
                  <div className="rounded-xl border border-border-line bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-muted">
                        Amount due
                      </span>
                      <span className="text-lg font-black tabular-nums">
                        {formatMoney(invoice.amount)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-text-muted">Due date</span>
                      <span className="text-sm font-semibold">
                        {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Client</span>
                    <span className="font-semibold">{invoice.clientName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Current status</span>
                    <span className="font-semibold capitalize">
                      {invoice.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Total</span>
                    <span className="font-black tabular-nums">
                      {formatMoney(invoice.amount)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleMarkSent}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white"
              >
                <Send size={15} />
                Mark as Sent
              </button>
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}
