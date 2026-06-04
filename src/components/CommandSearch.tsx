"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { mockDb, Client, Invoice } from "@/lib/mockDb";
import { Search, Users, FileText, Sparkles, X, CornerDownLeft } from "lucide-react";

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandSearch({ isOpen, onClose }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setClients(mockDb.getClients());
      setInvoices(mockDb.getInvoices());
      setQuery("");
      setSelectedIndex(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Keyboard navigation
  const filteredClients = query.trim() === "" ? [] : clients.filter(c =>
    c.company.toLowerCase().includes(query.toLowerCase()) ||
    c.contact.toLowerCase().includes(query.toLowerCase())
  );

  const filteredInvoices = query.trim() === "" ? [] : invoices.filter(i =>
    i.id.toLowerCase().includes(query.toLowerCase()) ||
    i.clientName.toLowerCase().includes(query.toLowerCase()) ||
    i.amount.toString().includes(query)
  );

  const quickActions = [
    { name: "Go to Dashboard", action: () => router.push("/dashboard"), icon: FileText },
    { name: "Create New Invoice", action: () => router.push("/invoices?new=true"), icon: FileText },
    { name: "Open Sales Funnel Pipeline", action: () => router.push("/pipeline"), icon: Sparkles },
    { name: "Draft Proposal with AI", action: () => router.push("/proposals"), icon: Sparkles }
  ].filter(action => query === "" || action.name.toLowerCase().includes(query.toLowerCase()));

  const totalResults = [...filteredClients, ...filteredInvoices, ...quickActions];

  useEffect(() => {
    // Wrap selection
    if (totalResults.length > 0 && selectedIndex >= totalResults.length) {
      setSelectedIndex(totalResults.length - 1);
    }
  }, [totalResults.length, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(totalResults.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalResults.length) % Math.max(totalResults.length, 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (totalResults.length > 0) {
          triggerAction(totalResults[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, totalResults, selectedIndex, onClose]);

  const triggerAction = (item: any) => {
    if (!item) return;
    onClose();
    if ("company" in item) {
      // Client
      router.push(`/clients?id=${item.id}`);
    } else if ("id" in item && "clientName" in item) {
      // Invoice
      router.push(`/invoices?id=${item.id}`);
    } else if ("action" in item) {
      // Quick Action
      item.action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4 select-none transition-all duration-200">
      <div
        ref={modalRef}
        className="w-full max-w-xl bg-surface-card border border-border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3.5 px-4 border-b border-border-line">
          <Search size={20} className="text-text-muted shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search invoices, clients, or type commands..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full py-4 bg-transparent outline-none border-none text-text-main text-sm placeholder:text-text-muted"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-bg text-text-muted hover:text-text-main transition-colors focus-ring-indigo"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-2.5">
          {query.trim() === "" && quickActions.length === 0 && (
            <div className="py-12 text-center text-text-muted text-xs">
              Type to search clients, invoices, or run actions...
            </div>
          )}

          {/* Quick Actions Section */}
          {quickActions.length > 0 && (
            <div className="mb-3">
              <h3 className="px-3.5 py-2 text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                Quick Commands
              </h3>
              <div className="space-y-0.5">
                {quickActions.map((action, index) => {
                  const itemIndex = index;
                  const isSelected = itemIndex === selectedIndex;
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.name}
                      onClick={() => triggerAction(action)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-all ${isSelected
                          ? "bg-brand-primary-light text-brand-primary border border-brand-primary/10"
                          : "text-text-main hover:bg-surface-bg border border-transparent"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isSelected ? "text-brand-primary" : "text-text-muted"} />
                        <span>{action.name}</span>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[10px] text-brand-primary/80 font-normal">
                          <span>Enter</span>
                          <CornerDownLeft size={10} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clients Section */}
          {filteredClients.length > 0 && (
            <div className="mb-3">
              <h3 className="px-3.5 py-2 text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                Clients ({filteredClients.length})
              </h3>
              <div className="space-y-0.5">
                {filteredClients.map((client, index) => {
                  const itemIndex = quickActions.length + index;
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <div
                      key={client.id}
                      onClick={() => triggerAction(client)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-all ${isSelected
                          ? "bg-brand-primary-light text-brand-primary border border-brand-primary/10"
                          : "text-text-main hover:bg-surface-bg border border-transparent"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Users size={16} className={isSelected ? "text-brand-primary" : "text-text-muted"} />
                        <div>
                          <div>{client.company}</div>
                          <div className="text-[10px] text-text-muted font-normal leading-none mt-0.5">
                            Contact: {client.contact} &bull; Outstanding: ₹{client.outstanding.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[10px] text-brand-primary/80 font-normal">
                          <span>Go to client</span>
                          <CornerDownLeft size={10} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Invoices Section */}
          {filteredInvoices.length > 0 && (
            <div className="mb-3">
              <h3 className="px-3.5 py-2 text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                Invoices ({filteredInvoices.length})
              </h3>
              <div className="space-y-0.5">
                {filteredInvoices.map((invoice, index) => {
                  const itemIndex = quickActions.length + filteredClients.length + index;
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <div
                      key={invoice.id}
                      onClick={() => triggerAction(invoice)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-all ${isSelected
                          ? "bg-brand-primary-light text-brand-primary border border-brand-primary/10"
                          : "text-text-main hover:bg-surface-bg border border-transparent"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={16} className={isSelected ? "text-brand-primary" : "text-text-muted"} />
                        <div>
                          <div>{invoice.id} &bull; {invoice.clientName}</div>
                          <div className="text-[10px] text-text-muted font-normal leading-none mt-0.5">
                            Amount: ₹{invoice.amount.toLocaleString("en-IN")} &bull; Status:{" "}
                            <span
                              className={
                                invoice.status === "paid"
                                  ? "text-state-success font-medium"
                                  : invoice.status === "overdue"
                                    ? "text-state-danger font-medium"
                                    : "text-state-warning font-medium"
                              }
                            >
                              {invoice.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[10px] text-brand-primary/80 font-normal">
                          <span>Open invoice</span>
                          <CornerDownLeft size={10} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {query.trim() !== "" && totalResults.length === 0 && (
            <div className="py-12 text-center text-text-muted text-xs">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Hotkeys Footer */}
        <div className="px-4 py-3 bg-surface-bg border-t border-border-line flex items-center justify-between text-[10px] text-text-muted font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-line font-mono text-[9px]">↑↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-line font-mono text-[9px]">Enter</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-line font-mono text-[9px]">Esc</kbd>
              <span>to close</span>
            </span>
          </div>
          <span className="font-semibold text-brand-primary">InvoiceHQ</span>
        </div>
      </div>
    </div>
  );
}
