"use client";

import React, { useEffect, useState, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb, Client } from "@/lib/mockDb";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  X,
  Sparkles,
} from "lucide-react";

function ClientsIndexContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New client form fields
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    const data = mockDb.getClients();
    setClients(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener("invoicehq_db_update", handleDbUpdate);
    return () =>
      window.removeEventListener("invoicehq_db_update", handleDbUpdate);
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setSelectedClientId(id);
    }
  }, [searchParams]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !contact || !email || !gstin) {
      alert("Please fill in all fields.");
      return;
    }

    mockDb.addClient({ company, contact, email, gstin });
    triggerToast(`Client "${company}" registered successfully!`);
    setIsAddOpen(false);
    setCompany("");
    setContact("");
    setEmail("");
    setGstin("");
    window.dispatchEvent(new Event("invoicehq_db_update"));
  };

  const filteredClients = clients.filter(
    (c) =>
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gstin.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ProtectedRoute>
      <WorkspaceLayout
        title="Clients"
        subtitle="Manage Billing relationships & Customer Details"
      >
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-brand-primary/30 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
            <Sparkles
              size={14}
              className="text-brand-primary animate-pulse shrink-0"
            />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="space-y-6 max-w-7xl mx-auto mt-2">
          
          {/* Controls Toolbar (CoStudio Style) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border-line text-sm font-medium text-text-muted w-full md:max-w-md bg-white shadow-sm focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary-light transition-all">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search Client Name, GST, Conta .."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none border-none text-text-main placeholder:text-text-muted w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-text-muted hover:text-text-main transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold transition-all shadow-md shadow-brand-primary/20 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Client</span>
            </button>
          </div>

          {/* Client Index Table (CoStudio Style) */}
          <div className="bg-white border border-border-line rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-brand-primary-light text-[13px] font-semibold text-brand-primary/90 tracking-wide border-b border-border-line">
                    <th className="py-4 px-6 rounded-tl-2xl w-16">S.No</th>
                    <th className="py-4 px-6">Company</th>
                    <th className="py-4 px-6">Contact</th>
                    <th className="py-4 px-6">GST In</th>
                    <th className="py-4 px-6 text-right">Outstanding</th>
                    <th className="py-4 px-6">Avg payment delay</th>
                    <th className="py-4 px-6">Last Invoice</th>
                    <th className="py-4 px-6 text-center rounded-tr-2xl">Invoices</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-line/50 text-[14px] font-medium text-text-main">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-text-muted text-sm">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-text-muted text-sm">
                        No clients found.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client, index) => (
                      <tr
                        key={client.id}
                        className="hover:bg-surface-bg/60 transition-colors cursor-pointer"
                        onClick={() => router.push(`/clients/${client.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            router.push(`/clients/${client.id}`);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                      >
                        <td className="py-4 px-6 text-text-muted font-normal">
                          {(index + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="py-4 px-6 text-text-main font-semibold">
                          {client.company}
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-text-main font-medium">{client.contact}</p>
                          <p className="text-[12px] text-text-muted font-normal mt-0.5">{client.email}</p>
                        </td>
                        <td className="py-4 px-6 text-text-main font-medium tracking-wide">
                          {client.gstin || '-'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`font-semibold ${client.outstanding > 0 ? 'text-state-danger' : 'text-state-success'}`}>
                            {client.outstanding > 0 ? `₹ ${(client.outstanding).toLocaleString("en-IN")}` : 'Nil'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-text-main">
                          {client.avgDelay > 0 ? `${client.avgDelay} Days` : '-'}
                        </td>
                        <td className="py-4 px-6 text-text-main">
                          {new Date(client.lastInvoiceDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-6 text-center font-bold tabular-nums">
                          {(client.invoiceCount).toString().padStart(2, '0')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-white border-t border-border-line text-sm text-text-muted font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                Showing {(filteredClients.length).toString().padStart(2, '0')} of {clients.length} Clients
                <select className="ml-2 bg-surface-bg border border-border-line rounded-lg px-2 py-1 text-sm outline-none focus:border-brand-primary">
                  <option>08</option>
                  <option>15</option>
                  <option>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* MODAL: ADD CLIENT */}
          {isAddOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white border border-border-line rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
                <div className="px-6 py-5 border-b border-border-line flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-main">
                    New Client
                  </h3>
                  <button
                    onClick={() => setIsAddOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-surface-bg text-text-muted hover:text-text-main transition-colors border border-transparent hover:border-border-line"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddClient} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-main mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Webcraft Solutions"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-border-line text-sm text-text-main outline-none focus:border-brand-primary transition-colors shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-main mb-1.5">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Mehta"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-border-line text-sm text-text-main outline-none focus:border-brand-primary transition-colors shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-main mb-1.5">
                      Billing Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="billing@webcraft.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-border-line text-sm text-text-main outline-none focus:border-brand-primary transition-colors shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-main mb-1.5">
                      Client GSTIN
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-border-line text-sm text-text-main outline-none focus:border-brand-primary transition-colors shadow-sm uppercase placeholder:normal-case font-mono"
                    />
                  </div>

                  <div className="pt-4 mt-6 border-t border-border-line flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-border-line text-text-muted hover:text-text-main font-semibold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-sm transition-colors shadow-md shadow-brand-primary/20"
                    >
                      Save Client
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}

export default function ClientsIndex() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading clients...</div>}>
      <ClientsIndexContent />
    </Suspense>
  );
}
