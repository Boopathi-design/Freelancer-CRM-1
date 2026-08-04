"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import {
  Building2,
  Receipt,
  CreditCard,
  Bell,
  Globe,
  Calculator,
  MessageSquare,
  Package,
  Save,
  CheckCircle2,
  Upload
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business");
  const [toast, setToast] = useState<string | null>(null);

  const tabs = [
    { id: "business", label: "Business Profile", icon: Building2 },
    { id: "invoice", label: "Invoice Preferences", icon: Receipt },
    { id: "payment", label: "Payment Methods", icon: CreditCard },
    { id: "reminders", label: "Reminder Automation", icon: Bell },
    { id: "portal", label: "Client Portal", icon: Globe },
    { id: "taxes", label: "Taxes & GST", icon: Calculator },
    { id: "notifications", label: "Notifications", icon: MessageSquare },
    { id: "billing", label: "Plan & Billing", icon: Package },
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ProtectedRoute>
      <WorkspaceLayout title="Settings" subtitle="Manage your workspace preferences">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
            <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={18} />
              {toast}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1 bg-surface-card p-2 rounded-2xl border border-border-divider shadow-sm sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-brand-primary-light text-brand-primary"
                        : "text-text-muted hover:text-text-main hover:bg-surface-elevated"
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 animate-in fade-in duration-300">
            {activeTab === "business" && <BusinessProfile onSave={() => showToast("Business profile updated!")} />}
            {activeTab === "invoice" && <InvoicePreferences onSave={() => showToast("Invoice preferences saved!")} />}
            {activeTab === "payment" && <PaymentMethods onSave={() => showToast("Payment methods updated!")} />}
            {activeTab === "reminders" && <ReminderAutomation onSave={() => showToast("Automation rules saved!")} />}
            {activeTab === "portal" && <ClientPortal onSave={() => showToast("Portal settings updated!")} />}
            {activeTab === "taxes" && <TaxesGST onSave={() => showToast("Tax configuration saved!")} />}
            {activeTab === "notifications" && <Notifications onSave={() => showToast("Notification preferences updated!")} />}
            {activeTab === "billing" && <PlanBilling />}
          </div>
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}

// ----------------------------------------------------
// Sub-components
// ----------------------------------------------------

function BusinessProfile({ onSave }: { onSave: () => void }) {
  return (
    <div className="bg-surface-card border border-border-divider rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Business Profile</h2>
          <p className="text-sm text-text-muted mt-1">Manage your company information and contact details.</p>
        </div>
        <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-xl text-sm font-medium hover:bg-brand-primary/90 transition-all">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-surface-elevated border-2 border-dashed border-border-divider flex flex-col items-center justify-center text-text-muted cursor-pointer hover:border-brand-primary hover:text-brand-primary transition-colors">
            <Upload size={24} className="mb-1" />
            <span className="text-xs font-medium">Logo</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-text-main mb-1">Company Logo</h4>
            <p className="text-xs text-text-muted mb-3">Recommended size: 512x512px (PNG, JPG).</p>
            <button className="text-sm font-medium text-brand-primary bg-brand-primary-light px-3 py-1.5 rounded-lg hover:bg-brand-primary/20 transition-colors">Upload Image</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="Business Name" defaultValue="ARK Design Studio" />
          <InputGroup label="Owner Name" defaultValue="Arjun Kumar" />
          <InputGroup label="Email Address" defaultValue="hello@arkdesign.in" />
          <InputGroup label="Phone Number" defaultValue="+91 98765 43210" />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-main mb-1.5">Registered Address</label>
            <textarea className="w-full bg-surface-elevated border border-border-divider rounded-xl px-4 py-2 text-sm focus:border-brand-primary outline-none transition-colors h-24 resize-none">123, Creative Enclave, Andheri West, Mumbai, Maharashtra 400053</textarea>
          </div>
          <InputGroup label="GSTIN (Optional)" defaultValue="27AAARK1234B1ZP" />
          <InputGroup label="PAN (Optional)" defaultValue="AAARK1234B" />
        </div>
      </div>
    </div>
  );
}

function InvoicePreferences({ onSave }: { onSave: () => void }) {
  return (
    <div className="bg-surface-card border border-border-divider rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Invoice Preferences</h2>
          <p className="text-sm text-text-muted mt-1">Configure default settings for new invoices.</p>
        </div>
        <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-xl text-sm font-medium hover:bg-brand-primary/90 transition-all">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Invoice Number Format</label>
            <div className="flex gap-2">
              <input type="text" defaultValue="INV-2024-" className="w-1/2 bg-surface-elevated border border-border-divider rounded-xl px-4 py-2 text-sm focus:border-brand-primary outline-none" placeholder="Prefix" />
              <input type="text" defaultValue="001" disabled className="w-1/2 bg-surface-bg border border-border-divider rounded-xl px-4 py-2 text-sm opacity-60" />
            </div>
            <p className="text-xs text-text-muted mt-1.5">Preview: INV-2024-001</p>
          </div>
          
          <SelectGroup label="Default Currency" options={["INR (₹)", "USD ($)", "EUR (€)", "GBP (£)"]} />
          <SelectGroup label="Default Payment Terms" options={["Due on Receipt", "Net 7", "Net 14", "Net 30"]} />
          <InputGroup label="Default Due Date Offset (Days)" type="number" defaultValue="14" />
          <InputGroup label="Late Fee Percentage (%)" type="number" defaultValue="2" />
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-main mb-1.5">Default Notes / Footer Text</label>
            <textarea className="w-full bg-surface-elevated border border-border-divider rounded-xl px-4 py-2 text-sm focus:border-brand-primary outline-none transition-colors h-24 resize-none">Payment is due within 14 days. A late fee of 2% per month will be applied to overdue balances. Thank you for your business!</textarea>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMethods({ onSave }: { onSave: () => void }) {
  return (
    <div className="bg-surface-card border border-border-divider rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Payment Methods</h2>
          <p className="text-sm text-text-muted mt-1">Set up how clients can pay your invoices.</p>
        </div>
        <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-xl text-sm font-medium hover:bg-brand-primary/90 transition-all">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-base font-semibold text-text-main flex items-center justify-between mb-4">
            UPI / QR Code
            <Toggle defaultChecked={true} label="Show UPI QR on Invoice" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="UPI ID" defaultValue="arkdesign@okicici" />
            <InputGroup label="Merchant Name" defaultValue="ARK Design Studio" />
          </div>
        </div>

        <hr className="border-border-divider" />

        <div>
          <h3 className="text-base font-semibold text-text-main mb-4">Bank Transfer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="Account Name" defaultValue="ARK Design Solutions Pvt Ltd" />
            <InputGroup label="Bank Name" defaultValue="HDFC Bank" />
            <InputGroup label="Account Number" defaultValue="50200012345678" />
            <InputGroup label="IFSC Code" defaultValue="HDFC0001234" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReminderAutomation({ onSave }: { onSave: () => void }) {
  return (
    <div className="bg-surface-card border border-border-divider rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main flex items-center gap-3">
            Reminder Automation
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary uppercase">Pro Feature</span>
          </h2>
          <p className="text-sm text-text-muted mt-1">Automatically chase unpaid invoices so you don't have to.</p>
        </div>
        <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-xl text-sm font-medium hover:bg-brand-primary/90 transition-all">
          <Save size={16} /> Save Rules
        </button>
      </div>

      <div className="p-4 bg-brand-primary-light border border-brand-primary/20 rounded-xl mb-8 flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-brand-primary text-sm">Master Toggle</h4>
          <p className="text-xs text-text-muted mt-0.5">Enable or disable all automated reminders.</p>
        </div>
        <Toggle defaultChecked={true} />
      </div>

      <div className="space-y-6">
        {/* Rule 1 */}
        <div className="border border-border-divider rounded-xl p-4 bg-surface-elevated">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-sm text-text-main">1. Friendly Reminder</h4>
            <Toggle defaultChecked={true} />
          </div>
          <div className="flex items-center gap-2 mb-3 text-sm">
            <span>Send</span>
            <input type="number" defaultValue="3" className="w-16 bg-surface-bg border border-border-divider rounded-lg px-2 py-1 text-center focus:border-brand-primary outline-none" />
            <span>days</span>
            <select className="bg-surface-bg border border-border-divider rounded-lg px-2 py-1 focus:border-brand-primary outline-none">
              <option>Before Due Date</option>
              <option>After Due Date</option>
            </select>
          </div>
          <textarea className="w-full bg-surface-bg border border-border-divider rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none resize-none h-20">Hi [Client Name], just a friendly reminder that invoice [Invoice No] for [Amount] is due on [Due Date]. Thank you!</textarea>
        </div>

        {/* Rule 2 */}
        <div className="border border-border-divider rounded-xl p-4 bg-surface-elevated">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-sm text-text-main">2. Firm Reminder</h4>
            <Toggle defaultChecked={true} />
          </div>
          <div className="flex items-center gap-2 mb-3 text-sm">
            <span>Send</span>
            <input type="number" defaultValue="5" className="w-16 bg-surface-bg border border-border-divider rounded-lg px-2 py-1 text-center focus:border-brand-primary outline-none" />
            <span>days</span>
            <select className="bg-surface-bg border border-border-divider rounded-lg px-2 py-1 focus:border-brand-primary outline-none">
              <option>After Due Date</option>
            </select>
          </div>
          <textarea className="w-full bg-surface-bg border border-border-divider rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none resize-none h-20">Dear [Client Name], invoice [Invoice No] is now 5 days overdue. Please process the payment of [Amount] at your earliest convenience to avoid late fees.</textarea>
        </div>
      </div>
    </div>
  );
}

function ClientPortal({ onSave }: { onSave: () => void }) {
  return (
    <div className="bg-surface-card border border-border-divider rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Client Portal</h2>
          <p className="text-sm text-text-muted mt-1">Customize the portal where your clients view and pay invoices.</p>
        </div>
        <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-xl text-sm font-medium hover:bg-brand-primary/90 transition-all">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="space-y-6">
        <InputGroup label="Custom Subdomain" defaultValue="arkdesign" suffix=".invoicehq.in" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="Portal Brand Color (Hex)" defaultValue="#10B981" />
          <SelectGroup label="Portal Font" options={["Inter", "Roboto", "Outfit", "Plus Jakarta Sans"]} />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1.5">Welcome Message</label>
          <textarea className="w-full bg-surface-elevated border border-border-divider rounded-xl px-4 py-2 text-sm focus:border-brand-primary outline-none transition-colors h-20 resize-none">Welcome to your billing portal! Here you can view, download, and pay your invoices.</textarea>
        </div>

        <div className="space-y-4 pt-4 border-t border-border-divider">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Enable Online Payments (Stripe/Razorpay)</h4>
              <p className="text-xs text-text-muted">Allow clients to pay directly via the portal.</p>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Show Tax Breakdown</h4>
              <p className="text-xs text-text-muted">Display a detailed breakdown of taxes on the public invoice.</p>
            </div>
            <Toggle defaultChecked={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TaxesGST({ onSave }: { onSave: () => void }) {
  return (
    <div className="bg-surface-card border border-border-divider rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Taxes & GST</h2>
          <p className="text-sm text-text-muted mt-1">Configure your local tax rules.</p>
        </div>
        <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-xl text-sm font-medium hover:bg-brand-primary/90 transition-all">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-surface-elevated border border-border-divider rounded-xl">
          <div>
            <h4 className="font-medium text-sm">GST Registered?</h4>
            <p className="text-xs text-text-muted">Toggle off if you are an unregistered freelancer.</p>
          </div>
          <Toggle defaultChecked={true} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectGroup label="Default GST Rate (%)" options={["0", "5", "12", "18", "28"]} defaultValue="18" />
          <SelectGroup label="Place of Supply (Home State)" options={["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu"]} defaultValue="Maharashtra" />
          <InputGroup label="Default SAC / HSN Code" defaultValue="998311" />
        </div>

        <div className="p-4 bg-brand-primary-light/50 border border-brand-primary/20 rounded-xl mt-4">
          <h4 className="font-medium text-sm text-brand-primary mb-1">Smart Tax Routing</h4>
          <p className="text-xs text-text-main opacity-80">
            InvoiceHQ will automatically calculate CGST + SGST for clients in your home state, and IGST for inter-state clients based on their GSTIN/Address.
          </p>
        </div>
      </div>
    </div>
  );
}

function Notifications({ onSave }: { onSave: () => void }) {
  return (
    <div className="bg-surface-card border border-border-divider rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Notifications</h2>
          <p className="text-sm text-text-muted mt-1">Control how you want to be alerted.</p>
        </div>
        <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-xl text-sm font-medium hover:bg-brand-primary/90 transition-all">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-base font-semibold mb-4 border-b border-border-divider pb-2">Email Notifications</h3>
          <div className="space-y-4">
            <NotificationToggle label="Invoice Viewed by Client" defaultChecked={true} />
            <NotificationToggle label="Payment Received" defaultChecked={true} />
            <NotificationToggle label="Invoice Overdue" defaultChecked={true} />
            <NotificationToggle label="Proposal Accepted/Declined" defaultChecked={true} />
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-4 border-b border-border-divider pb-2">Digest Frequency</h3>
          <div className="flex gap-4">
             <label className="flex items-center gap-2 text-sm cursor-pointer">
               <input type="radio" name="digest" className="accent-brand-primary" /> Instant
             </label>
             <label className="flex items-center gap-2 text-sm cursor-pointer">
               <input type="radio" name="digest" className="accent-brand-primary" defaultChecked /> Daily Summary
             </label>
             <label className="flex items-center gap-2 text-sm cursor-pointer">
               <input type="radio" name="digest" className="accent-brand-primary" /> Weekly Summary
             </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanBilling() {
  return (
    <div className="bg-surface-card border border-border-divider rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Plan & Billing</h2>
          <p className="text-sm text-text-muted mt-1">Manage your InvoiceHQ subscription.</p>
        </div>
      </div>

      <div className="bg-surface-bg border-2 border-brand-primary rounded-xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-bl-full -z-10"></div>
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand-primary text-brand-dark uppercase tracking-wider mb-3">Current Plan</div>
            <h3 className="text-2xl font-bold mb-1">Pro Tier</h3>
            <p className="text-sm text-text-muted">₹999 / month • Renews on Aug 24, 2026</p>
          </div>
          <button className="px-4 py-2 border border-border-divider bg-surface-elevated rounded-lg text-sm font-medium hover:bg-surface-bg transition-colors">
            Manage Billing
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border-divider/50 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-text-muted mb-1">Invoices</div>
            <div className="font-semibold text-sm text-text-main">Unlimited</div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">Clients</div>
            <div className="font-semibold text-sm text-text-main">Unlimited</div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">Team Members</div>
            <div className="font-semibold text-sm text-text-main">3 of 5</div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">Automations</div>
            <div className="font-semibold text-sm text-text-main">Active</div>
          </div>
        </div>
      </div>

      <h3 className="text-base font-semibold mb-4">Billing History</h3>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-border-divider">
            <th className="py-2 font-medium text-text-muted">Date</th>
            <th className="py-2 font-medium text-text-muted">Amount</th>
            <th className="py-2 font-medium text-text-muted">Status</th>
            <th className="py-2 font-medium text-text-muted">Receipt</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border-divider/50">
            <td className="py-3">Jul 24, 2026</td>
            <td className="py-3">₹999</td>
            <td className="py-3"><span className="text-emerald-500 font-medium">Paid</span></td>
            <td className="py-3"><a href="#" className="text-brand-primary hover:underline">Download</a></td>
          </tr>
          <tr className="border-b border-border-divider/50">
            <td className="py-3">Jun 24, 2026</td>
            <td className="py-3">₹999</td>
            <td className="py-3"><span className="text-emerald-500 font-medium">Paid</span></td>
            <td className="py-3"><a href="#" className="text-brand-primary hover:underline">Download</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ----------------------------------------------------
// UI Helpers
// ----------------------------------------------------

function InputGroup({ label, defaultValue, placeholder, type = "text", suffix }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-main mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`w-full bg-surface-elevated border border-border-divider rounded-xl py-2 text-sm focus:border-brand-primary outline-none transition-colors ${suffix ? 'pl-4 pr-24' : 'px-4'}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-muted pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

function SelectGroup({ label, options, defaultValue }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-main mb-1.5">{label}</label>
      <select defaultValue={defaultValue} className="w-full bg-surface-elevated border border-border-divider rounded-xl px-4 py-2 text-sm focus:border-brand-primary outline-none transition-colors appearance-none">
        {options.map((opt: string) => <option key={opt} value={opt.split(' ')[0]}>{opt}</option>)}
      </select>
    </div>
  );
}

function Toggle({ defaultChecked, label }: { defaultChecked?: boolean, label?: string }) {
  const [checked, setChecked] = useState(defaultChecked || false);
  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setChecked(!checked)}>
      {label && <span className="text-sm font-medium select-none">{label}</span>}
      <div className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-brand-primary' : 'bg-surface-elevated border border-border-divider'}`}>
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4 bg-brand-dark' : 'translate-x-0 bg-text-muted'}`}></div>
      </div>
    </div>
  );
}

function NotificationToggle({ label, defaultChecked }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-text-main">{label}</span>
      <Toggle defaultChecked={defaultChecked} />
    </div>
  );
}
