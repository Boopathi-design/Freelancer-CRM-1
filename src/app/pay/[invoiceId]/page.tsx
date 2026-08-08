"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download, ShieldCheck, Sparkles } from "lucide-react";
import { mockDb, Invoice, WorkspaceSettings } from "@/lib/mockDb";

const formatMoney = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export default function PayInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = Array.isArray(params?.invoiceId) ? params.invoiceId[0] : (params?.invoiceId ?? "");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldShowSuccess, setShouldShowSuccess] = useState(false);

  useEffect(() => {
    setSettings(mockDb.getSettings());
    if (!invoiceId) return;

    const found = mockDb.getInvoices().find((item) => item.id.toLowerCase() === invoiceId.toLowerCase());
    if (found) {
      setInvoice(found);
      setShouldShowSuccess(found.status === "paid");
    }
  }, [invoiceId]);

  const handlePay = () => {
    if (!invoice) return;

    setIsProcessing(true);
    setTimeout(() => {
      const result = mockDb.triggerPaymentWebhook(invoice.id, "UPI", `pay_${Date.now().toString(36).toUpperCase()}`);
      setIsProcessing(false);

      if (result.success && result.invoice) {
        setInvoice(result.invoice);
        setShouldShowSuccess(true);
      }
    }, 1400);
  };

  const handleDownload = () => {
    if (!invoice) return;

    const receipt = [
      `Invoice: ${invoice.id}`,
      `Client: ${invoice.clientName}`,
      `Paid To: ${settings?.companyName ?? "ARK Design Studio"}`,
      `Amount: ${formatMoney(invoice.amount)}`,
      `Reference: ${invoice.paymentReference ?? "pay_UPI"}`,
      `Date: ${new Date(invoice.paymentReceivedAt ?? Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
      `Status: Paid`
    ].join("\n");

    const blob = new Blob([receipt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${invoice.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const subtotal = invoice?.items.reduce((sum, item) => sum + item.qty * item.rate, 0) ?? 0;
  const gst = invoice?.gstApplicable ? subtotal * 0.18 : 0;

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-border-line bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-state-danger">
            <Sparkles size={20} />
          </div>
          <h1 className="text-xl font-bold text-text-main">Invoice not found</h1>
          <p className="mt-2 text-sm text-text-muted">The payment link you opened is invalid or has expired.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft size={16} />
            Back home
          </button>
        </div>
      </div>
    );
  }

  const brandColor = settings?.portalBrandColor ?? "#6366F1";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <header className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-base font-black text-white shadow-sm"
                style={{ backgroundColor: brandColor }}
              >
                {(settings?.companyName ?? "ARK").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-main">{settings?.companyName ?? "ARK Design Studio"}</h1>
                <p className="text-xs text-text-muted">{settings?.portalSubdomain ?? "arkdesign"}.invoicehq.in</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 md:self-auto">
              <ShieldCheck size={14} />
              Secure · SSL Encrypted
            </div>
          </header>

          <div className="grid gap-8 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-8">
            <section className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">Invoice</p>
                  <h2 className="mt-2 text-2xl font-black text-text-main">{invoice.id}</h2>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Due date</p>
                  <p className="mt-1 text-sm font-bold text-text-main">
                    {new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Welcome</p>
                <p className="mt-2 text-sm text-text-main">
                  {settings?.portalWelcomeMessage ?? "Welcome to your billing portal! Here you can view, download, and pay your invoices."}
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Invoice total</span>
                  <span className="text-xl font-black text-text-main tabular-nums">{formatMoney(invoice.amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-semibold tabular-nums">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">GST</span>
                  <span className="font-semibold tabular-nums">{formatMoney(gst)}</span>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-text-main">{item.description}</p>
                      <p className="text-xs text-text-muted">{item.qty} × {formatMoney(item.rate)}</p>
                    </div>
                    <span className="font-bold text-text-main tabular-nums">{formatMoney(item.qty * item.rate)}</span>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-5">
              {!shouldShowSuccess ? (
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">Payment method</p>
                  <h3 className="mt-3 text-xl font-bold text-text-main">Pay via UPI / Net Banking</h3>

                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-text-main">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Bill to</span>
                      <span className="font-semibold">{invoice.clientName}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-text-muted">Amount due</span>
                      <span className="text-lg font-black tabular-nums">{formatMoney(invoice.amount)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={isProcessing}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition"
                    style={{ backgroundColor: brandColor }}
                  >
                    {isProcessing ? "Processing payment..." : "Pay via UPI / Net Banking"}
                  </button>

                  <div className="mt-4 text-center text-[11px] text-text-muted">No hidden fees • Secure gateway • Instant confirmation</div>
                </div>
              ) : (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-bold uppercase tracking-[0.16em]">Payment success</span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-emerald-900">
                    <div className="flex items-center justify-between">
                      <span>Amount paid</span>
                      <span className="font-black tabular-nums">{formatMoney(invoice.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Invoice</span>
                      <span className="font-semibold">{invoice.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Paid to</span>
                      <span className="font-semibold">{settings?.companyName ?? "ARK Design Studio"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Date</span>
                      <span className="font-semibold">
                        {new Date(invoice.paymentReceivedAt ?? Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reference</span>
                      <span className="font-semibold">{invoice.paymentReference ?? "pay_UPI"}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
                  >
                    <Download size={16} />
                    Receipt download
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
