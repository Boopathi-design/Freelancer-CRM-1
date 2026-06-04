"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockDb, Invoice } from "@/lib/mockDb";
import {
  TrendingUp,
  Printer,
  CreditCard,
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  Sparkles,
  QrCode,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Loader2,
  DollarSign
} from "lucide-react";

export default function ClientPortal() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadInvoice = () => {
    if (!invoiceId) return;
    const invoices = mockDb.getInvoices();
    const found = invoices.find((inv) => inv.id.toLowerCase() === invoiceId.toLowerCase());
    setInvoice(found || null);
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleProcessUPIPayment = () => {
    if (!invoice) return;
    setIsProcessingPayment(true);
    triggerToast("Contacting Razorpay Gateway Engine...");

    setTimeout(() => {
      // Execute local webhook callback
      const result = mockDb.triggerPaymentWebhook(invoice.id, "UPI", "pay_UPI" + Math.random().toString(36).substr(2, 9).toUpperCase());

      setIsProcessingPayment(false);
      setIsCheckoutOpen(false);

      if (result.success) {
        setInvoice(result.invoice);
        triggerToast("UPI reconciliation complete! Balances adjusted.");

        // Notify other windows/components
        window.dispatchEvent(new Event("invoicehq_db_update"));
      } else {
        triggerToast("Failed to process payment.");
      }
    }, 2000);
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none font-sans text-xs">
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-state-danger mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-sm font-bold text-text-main">Invoice Not Found</h3>
        <p className="text-text-muted mt-1 max-w-xs">
          The invoice link is invalid or expired. Contact support if this persists.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary-hover transition-colors"
        >
          Go to Control Room
        </button>
      </div>
    );
  }

  // Calculate totals
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const cgst = invoice.gstApplicable ? subtotal * 0.09 : 0;
  const sgst = invoice.gstApplicable ? subtotal * 0.09 : 0;
  const totalAmount = subtotal + cgst + sgst;

  const isPaid = invoice.status === "paid";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-12 px-4 font-sans select-none print:p-0 print:bg-white text-xs">

      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-800 text-[11px] font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <ShieldCheck size={14} className="text-state-success animate-bounce" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-stretch gap-8 print:block print:max-w-none">

        {/* LEFT COLUMN: PDF INVOICE RECEIPT */}
        <div className="flex-1 bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-xl p-8 md:p-12 print:border-none print:shadow-none print:p-0 flex flex-col justify-between min-h-[680px]">
          <div>
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-8 mb-8">
              <div>
                <div className="flex items-center gap-2 text-slate-950">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                    T
                  </div>
                  <h1 className="text-sm font-black tracking-tight uppercase">ARK Design Studio</h1>
                </div>
                <p className="text-[8px] text-slate-400 font-medium mt-2 leading-relaxed">
                  GSTIN: 27AAARK1234B1ZP &bull; Place of Supply: Maharashtra<br />
                  Email: billing@arkdesign.in &bull; Contact: +91 9988776655
                </p>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase inline-block mb-3 ${isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800 animate-pulse"
                  }`}>
                  {invoice.status}
                </span>
                <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider">INVOICE RECEIPT</h2>
                <p className="text-[9px] font-extrabold text-slate-500 mt-1 tabular-nums">{invoice.id}</p>
              </div>
            </div>

            {/* Billing addresses split */}
            <div className="grid grid-cols-2 gap-8 pb-8 border-b border-slate-100">
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Billed To</span>
                <h3 className="text-xs font-black text-slate-900">{invoice.clientName}</h3>
                <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                  GSTIN: {invoice.clientGstin}<br />
                  Client Contact: {invoice.clientContact}<br />
                  Email: {invoice.clientEmail}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">Payment Details</span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-slate-500 text-right">
                  <span className="font-semibold text-slate-400">Issue Date:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {new Date(invoice.issueDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>

                  <span className="font-semibold text-slate-400">Due Date:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>

                  {isPaid && (
                    <>
                      <span className="font-semibold text-slate-400">Paid Date:</span>
                      <span className="font-bold text-emerald-600 tabular-nums">
                        {new Date(invoice.paymentReceivedAt!).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="mt-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[8px] font-bold text-slate-400 text-left">
                    <th className="py-2.5">Description of Services</th>
                    <th className="py-2.5 w-16 text-center">SAC Code</th>
                    <th className="py-2.5 w-12 text-center">Quantity</th>
                    <th className="py-2.5 w-20 text-right">Unit Rate</th>
                    <th className="py-2.5 w-20 text-right">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 max-w-[250px] leading-normal">{item.description}</td>
                      <td className="py-3.5 text-center tabular-nums">{item.sac}</td>
                      <td className="py-3.5 text-center tabular-nums">{item.qty}</td>
                      <td className="py-3.5 text-right tabular-nums">₹{item.rate.toLocaleString("en-IN")}</td>
                      <td className="py-3.5 text-right font-bold text-slate-900 tabular-nums">
                        ₹{(item.qty * item.rate).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals panel */}
          <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col justify-end items-end space-y-2">
            <div className="flex justify-between w-48 text-[9px] text-slate-500 font-medium">
              <span>Subtotal:</span>
              <span className="tabular-nums">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            {invoice.gstApplicable && (
              <>
                <div className="flex justify-between w-48 text-[9px] text-slate-500 font-medium">
                  <span>Central GST (9%):</span>
                  <span className="tabular-nums">₹{cgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between w-48 text-[9px] text-slate-500 font-medium">
                  <span>State GST (9%):</span>
                  <span className="tabular-nums">₹{sgst.toLocaleString("en-IN")}</span>
                </div>
              </>
            )}

            <div className="flex justify-between w-48 text-sm font-black text-slate-950 border-t border-slate-200 pt-2.5">
              <span>Total Amount Due:</span>
              <span className="tabular-nums">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>

            <div className="pt-8 w-full text-[8px] text-slate-400 font-medium border-t border-slate-100 mt-8 leading-relaxed text-left">
              <span className="font-bold text-slate-500 uppercase block mb-1">Invoice Notes &amp; Payment terms</span>
              {invoice.notes}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE CHECKOUT GATEWAY PANEL */}
        <div className="w-full lg:w-80 space-y-6 shrink-0 print:hidden flex flex-col justify-start">

          {/* Card A: Quick Actions */}
          <div className="bg-surface-card border border-border-line rounded-3xl p-6 shadow-xl space-y-4">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-line hover:bg-surface-bg text-text-main text-xs font-bold transition-all focus-ring-indigo cursor-pointer bg-surface-card shadow-sm"
            >
              <Printer size={14} />
              <span>Export PDF / Print</span>
            </button>

            {/* Back indicator link if logged in */}
            <button
              onClick={() => router.push("/invoices")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border-line hover:border-brand-primary text-text-muted hover:text-brand-primary text-xs font-semibold transition-all focus-ring-indigo cursor-pointer bg-transparent"
            >
              <ChevronLeft size={14} />
              <span>Back to Invoice Console</span>
            </button>
          </div>

          {/* Card B: Payment Status Gate Card */}
          <div className="bg-surface-card border border-border-line rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center">
            {isPaid ? (
              <div className="space-y-4 py-4 w-full">
                <div className="w-12 h-12 rounded-full bg-state-success/10 text-state-success flex items-center justify-center mx-auto">
                  <CheckCircle size={26} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Invoice Reconciled</h3>
                  <p className="text-[10px] text-text-muted mt-1 leading-normal max-w-[200px] mx-auto">
                    UPI Payment verified via Razorpay webhook loop. No action required.
                  </p>
                </div>
                <div className="p-3 bg-surface-bg border border-border-line rounded-xl text-[9px] text-text-muted font-mono leading-relaxed text-left space-y-1">
                  <div><strong>Method:</strong> {invoice.paymentMethod || "UPI API"}</div>
                  <div><strong>Ref:</strong> {invoice.paymentReference || "pay_UPI897XJD"}</div>
                  <div className="truncate"><strong>Cleared:</strong> {new Date(invoice.paymentReceivedAt!).toLocaleString("en-IN")}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4 w-full">
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto animate-pulse">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Frictionless Checkout</h3>
                  <p className="text-[10px] text-text-muted mt-1 leading-normal max-w-[200px] mx-auto">
                    Verify calculations on the left, then scan UPI QR or click pay.
                  </p>
                </div>

                <div className="border-t border-b border-border-line py-3.5 my-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Amount Payable
                  </span>
                  <span className="text-xl font-black text-text-main tabular-nums">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all focus-ring-indigo shadow-lg shadow-brand-primary/15 cursor-pointer"
                >
                  <Smartphone size={14} />
                  <span>Pay via UPI Gateway</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-12 text-center text-[10px] text-text-muted select-none print:hidden">
        Powered by <strong className="text-text-main font-semibold">InvoiceHQ Platform</strong> &bull; Secure Multi-Tenant Freelancer Infrastructure
      </footer>

      {/* CHECKOUT MODAL: UPI PAYMENT QR SCANNER */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface-card border border-border-line rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col justify-between items-stretch">

            {/* Header */}
            <div className="px-6 py-4 border-b border-border-line flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-main">
                <QrCode size={16} className="text-brand-primary" />
                <h3 className="text-xs font-bold">UPI Checkout Gateway</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-bg text-text-muted hover:text-text-main transition-colors"
                disabled={isProcessingPayment}
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none">
                Scan using any UPI App
              </span>

              {/* Styled Mock QR Code */}
              <div className="w-44 h-44 rounded-2xl bg-white border border-slate-200 shadow-inner flex flex-col items-center justify-center relative p-3.5 group">
                <div className="grid grid-cols-6 gap-1 w-full h-full opacity-80 group-hover:scale-95 transition-transform duration-300">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const isCorner = i === 0 || i === 1 || i === 4 || i === 5 || i === 6 || i === 11 || i === 24 || i === 29 || i === 30 || i === 31 || i === 34 || i === 35;
                    return (
                      <div
                        key={i}
                        className={`rounded-xs ${isCorner ? "bg-slate-900" : (i % 3 === 0 || i % 4 === 1) ? "bg-slate-900" : "bg-transparent"
                          }`}
                      />
                    );
                  })}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 border-2 border-white flex items-center justify-center text-white font-extrabold text-[10px] shadow-md">
                    UPI
                  </div>
                </div>
              </div>

              <div className="w-full p-3.5 bg-surface-bg border border-border-line rounded-xl space-y-1.5 text-left text-[10px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">Payer Workspace:</span>
                  <span className="font-semibold text-text-main">ARK Design Studio</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Invoice No:</span>
                  <span className="font-semibold text-text-main tabular-nums">{invoice.id}</span>
                </div>
                <div className="flex justify-between border-t border-border-line pt-1.5 mt-1.5 font-bold">
                  <span className="text-text-muted">Total Charge:</span>
                  <span className="text-brand-primary tabular-nums">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Footer action keys */}
            <div className="p-6 border-t border-border-line bg-surface-bg/50 flex flex-col gap-2">
              <button
                onClick={handleProcessUPIPayment}
                disabled={isProcessingPayment}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all focus-ring-indigo shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Processing Webhook Callback...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={13} />
                    <span>Process Instant UPI Payment</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                disabled={isProcessingPayment}
                className="w-full py-2.5 rounded-xl border border-border-line hover:bg-surface-card text-text-muted hover:text-text-main text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel payment
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
