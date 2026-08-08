"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb, Client, Invoice, Proposal } from "@/lib/mockDb";
import {
  ArrowLeft,
  Building2,
  CalendarRange,
  Clock3,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ReceiptText,
  Wallet,
} from "lucide-react";

const formatMoney = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id ?? "");

  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (!clientId) return;

    const clients = mockDb.getClients();
    const foundClient = clients.find((item) => item.id === clientId);
    setClient(foundClient ?? null);

    const allInvoices = mockDb
      .getInvoices()
      .filter((item) => item.clientId === clientId);
    setInvoices(allInvoices);

    const allProposals = mockDb
      .getProposals()
      .filter((item) => item.clientId === clientId);
    setProposals(allProposals);
  }, [clientId]);

  const clientSince = useMemo(() => {
    if (!invoices.length) return "2024-01-01";
    return invoices.reduce(
      (earliest, invoice) =>
        invoice.issueDate < earliest ? invoice.issueDate : earliest,
      invoices[0].issueDate,
    );
  }, [invoices]);

  const totalBilled = invoices.reduce((sum, item) => sum + item.amount, 0);
  const currentOutstanding = invoices
    .filter((item) => item.status !== "paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const averageDelay = client?.avgDelay ?? 0;

  const handleNewInvoice = () => {
    if (typeof window !== "undefined" && client) {
      localStorage.setItem("invoicehq_prefill_client", client.company);
    }
    router.push("/invoices?new=true");
  };

  const handleNewProposal = () => {
    if (typeof window !== "undefined" && client) {
      localStorage.setItem("invoicehq_proposal_draft_client", client.company);
    }
    router.push("/proposals/new");
  };

  if (!client) {
    return (
      <ProtectedRoute>
        <WorkspaceLayout title="Client detail" subtitle="View customer profile">
          <div className="rounded-2xl border border-border-line bg-white p-8 text-center text-sm text-text-muted">
            Client not found.
          </div>
        </WorkspaceLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <WorkspaceLayout
        title="Client Detail"
        subtitle="Customer profile and engagement history"
      >
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-border-line bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/clients")}
                className="inline-flex items-center gap-2 rounded-xl border border-border-line px-3 py-2 text-xs font-semibold text-text-muted"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary font-black">
                {client.company.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-black text-text-main">
                  {client.company}
                </h1>
                <p className="text-sm text-text-muted">Relationship partner</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl border border-border-line px-4 py-2 text-sm font-medium text-text-main">
                <Pencil size={15} />
                Edit Client
              </button>
              <button
                onClick={handleNewInvoice}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus size={15} />
                New Invoice
              </button>
              <button
                onClick={handleNewProposal}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                <FileText size={15} />
                New Proposal
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.45fr]">
            <div className="rounded-2xl border border-border-line bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-brand-primary">
                <Building2 size={16} />
                <h2 className="text-sm font-bold uppercase tracking-[0.16em]">
                  Company info
                </h2>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Building2 size={14} className="mt-0.5 text-text-muted" />
                  <div>
                    <p className="text-text-muted">Name</p>
                    <p className="font-semibold text-text-main">
                      {client.company}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ReceiptText size={14} className="mt-0.5 text-text-muted" />
                  <div>
                    <p className="text-text-muted">GSTIN</p>
                    <p className="font-semibold text-text-main">
                      {client.gstin}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={14} className="mt-0.5 text-text-muted" />
                  <div>
                    <p className="text-text-muted">Address</p>
                    <p className="font-semibold text-text-main">
                      Maharashtra, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={14} className="mt-0.5 text-text-muted" />
                  <div>
                    <p className="text-text-muted">Email</p>
                    <p className="font-semibold text-text-main">
                      {client.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={14} className="mt-0.5 text-text-muted" />
                  <div>
                    <p className="text-text-muted">Phone</p>
                    <p className="font-semibold text-text-main">
                      +91 98765 4321
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border-line bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <Wallet size={15} />{" "}
                  <span className="text-xs font-bold uppercase tracking-[0.14em]">
                    Total billed
                  </span>
                </div>
                <p className="mt-4 text-2xl font-black text-text-main tabular-nums">
                  {formatMoney(totalBilled)}
                </p>
              </div>
              <div className="rounded-2xl border border-border-line bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock3 size={15} />{" "}
                  <span className="text-xs font-bold uppercase tracking-[0.14em]">
                    Outstanding
                  </span>
                </div>
                <p className="mt-4 text-2xl font-black text-state-danger tabular-nums">
                  {formatMoney(currentOutstanding)}
                </p>
              </div>
              <div className="rounded-2xl border border-border-line bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <CalendarRange size={15} />{" "}
                  <span className="text-xs font-bold uppercase tracking-[0.14em]">
                    Avg payment delay
                  </span>
                </div>
                <p className="mt-4 text-2xl font-black text-text-main">
                  {averageDelay} days
                </p>
              </div>
              <div className="rounded-2xl border border-border-line bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <CalendarRange size={15} />{" "}
                  <span className="text-xs font-bold uppercase tracking-[0.14em]">
                    Client since
                  </span>
                </div>
                <p className="mt-4 text-lg font-black text-text-main">
                  {new Date(clientSince).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-line bg-white shadow-sm overflow-hidden">
            <div className="border-b border-border-line bg-surface-bg px-5 py-4">
              <h2 className="text-lg font-bold text-text-main">
                Invoice history
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-surface-bg text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">
                  <tr>
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Issue</th>
                    <th className="px-5 py-3">Due</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-line text-sm text-text-main">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-surface-bg/60">
                      <td className="px-5 py-3 font-semibold">{invoice.id}</td>
                      <td className="px-5 py-3">
                        {new Date(invoice.issueDate).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3 font-semibold tabular-nums">
                        {formatMoney(invoice.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${invoice.status === "paid" ? "bg-emerald-100 text-emerald-700" : invoice.status === "overdue" ? "bg-red-100 text-red-700" : invoice.status === "viewed" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-border-line bg-white shadow-sm overflow-hidden">
            <div className="border-b border-border-line bg-surface-bg px-5 py-4">
              <h2 className="text-lg font-bold text-text-main">
                Proposal history
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-surface-bg text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">
                  <tr>
                    <th className="px-5 py-3">Proposal</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3">Budget</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-line text-sm text-text-main">
                  {proposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-surface-bg/60">
                      <td className="px-5 py-3 font-semibold">
                        {proposal.title}
                      </td>
                      <td className="px-5 py-3">
                        {new Date(proposal.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td className="px-5 py-3 font-semibold tabular-nums">
                        {formatMoney(proposal.budget)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-brand-primary-light px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
                          {proposal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}
