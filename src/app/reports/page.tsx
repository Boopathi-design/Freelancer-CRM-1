"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { 
  BarChart, 
  LineChart, 
  PieChart,
  Users, 
  FileText,
  GitBranch,
  TrendingUp,
  Download,
  Filter
} from "lucide-react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("revenue");

  const tabs = [
    { id: "revenue", label: "Revenue", icon: TrendingUp },
    { id: "pipeline", label: "Pipeline", icon: GitBranch },
    { id: "clients", label: "Clients", icon: Users },
    { id: "invoices", label: "Invoices", icon: FileText }
  ];

  return (
    <ProtectedRoute>
      <WorkspaceLayout title="Reports" subtitle="Analyze your business performance">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex overflow-x-auto p-1 bg-surface-elevated rounded-xl border border-border-divider no-scrollbar w-full md:w-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-surface-card text-brand-primary shadow-sm"
                      : "text-text-muted hover:text-text-main hover:bg-surface-bg/50"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-surface-elevated border border-border-divider rounded-lg text-sm font-medium hover:bg-surface-elevated/80 transition-colors flex">
              <Filter size={16} />
              This Year
            </button>
            <button className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors flex">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === "revenue" && <RevenueReport />}
          {activeTab === "pipeline" && <PipelineReport />}
          {activeTab === "clients" && <ClientsReport />}
          {activeTab === "invoices" && <InvoicesReport />}
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}

function RevenueReport() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value="₹1,88,500" trend="+12.5%" />
        <KPICard title="Collected" value="₹1,52,000" subtext="80.6% of total" />
        <KPICard title="Outstanding" value="₹36,500" subtext="19.4% of total" />
        <KPICard title="Total GST Collected" value="₹33,930" trend="+8.2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-card border border-border-divider rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend (Monthly)</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border-divider rounded-xl bg-surface-bg/50">
            <span className="text-text-muted flex items-center gap-2"><BarChart size={18}/> Chart Visualization Placeholder</span>
          </div>
        </div>
        <div className="bg-surface-card border border-border-divider rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Revenue by Client</h3>
          <div className="space-y-4 flex-1">
            <ClientRow name="Nexus Dynamics" amount="₹85,000" percent="45%" />
            <ClientRow name="Webcraft Solutions" amount="₹65,000" percent="35%" />
            <ClientRow name="Brand Alchemy" amount="₹38,500" percent="20%" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Pipeline Value" value="₹4,25,000" subtext="From 8 active proposals" />
        <KPICard title="Conversion Rate" value="68%" trend="+5%" />
        <KPICard title="Average Deal Size" value="₹53,125" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-card border border-border-divider rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Proposals by Stage</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border-divider rounded-xl bg-surface-bg/50">
            <span className="text-text-muted flex items-center gap-2"><PieChart size={18}/> Funnel Chart Placeholder</span>
          </div>
        </div>
        <div className="bg-surface-card border border-border-divider rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Expected Revenue (Next 30 Days)</h3>
          <div className="text-4xl font-bold text-emerald-500 mb-2">₹1,45,000</div>
          <p className="text-sm text-text-muted mb-6">Based on proposals in 'Accepted' and 'Sent' stages weighted by probability.</p>
          <div className="space-y-3">
             <div className="flex justify-between items-center p-3 bg-surface-elevated rounded-lg">
                <span className="font-medium text-sm">Mobile App UI/UX (Nexus)</span>
                <span className="text-sm font-semibold text-emerald-400">₹85,000</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-surface-elevated rounded-lg">
                <span className="font-medium text-sm">Brand Redesign (Webcraft)</span>
                <span className="text-sm font-semibold text-emerald-400">₹60,000</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientsReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Clients" value="24" trend="+3" />
        <KPICard title="New Clients (Period)" value="3" />
        <KPICard title="Repeat Business Rate" value="42%" subtext="10 clients with >1 invoice" />
        <KPICard title="Avg Payment Delay" value="11 Days" trend="-2 Days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-card border border-border-divider rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Payment Delay by Client</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border-divider rounded-xl bg-surface-bg/50">
            <span className="text-text-muted flex items-center gap-2"><BarChart size={18}/> Delay Chart Placeholder</span>
          </div>
        </div>
        <div className="bg-surface-card border border-border-divider rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-state-danger flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-state-danger"></span>
            At-Risk Clients
          </h3>
          <div className="space-y-3">
             <div className="flex flex-col p-3 bg-surface-elevated rounded-lg border border-state-danger/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm text-text-main">Global Tech Ltd</span>
                  <span className="text-sm font-semibold text-state-danger">₹45,000 Overdue</span>
                </div>
                <span className="text-xs text-text-muted">Avg Delay: 24 days • Longest Delay: 42 days</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoicesReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Invoices Sent" value="42" />
        <KPICard title="Paid Volume" value="₹3,45,000" />
        <KPICard title="Overdue Volume" value="₹84,000" />
        <KPICard title="Avg Time-to-Payment" value="18 Days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-card border border-border-divider rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Invoice Value Trend</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border-divider rounded-xl bg-surface-bg/50">
            <span className="text-text-muted flex items-center gap-2"><LineChart size={18}/> Area Chart Placeholder</span>
          </div>
        </div>
        <div className="bg-surface-card border border-border-divider rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Overdue Aging</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">1-7 Days</span>
                <span className="font-medium text-text-main">₹24,000</span>
              </div>
              <div className="w-full bg-surface-elevated rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">8-15 Days</span>
                <span className="font-medium text-text-main">₹15,000</span>
              </div>
              <div className="w-full bg-surface-elevated rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">15+ Days</span>
                <span className="font-medium text-text-main">₹45,000</span>
              </div>
              <div className="w-full bg-surface-elevated rounded-full h-2">
                <div className="bg-state-danger h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function KPICard({ title, value, trend, subtext }: { title: string, value: string, trend?: string, subtext?: string }) {
  return (
    <div className="bg-surface-card border border-border-divider rounded-2xl p-5 shadow-sm">
      <div className="text-sm text-text-muted mb-2">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-text-main">{value}</div>
        {trend && (
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            {trend}
          </div>
        )}
      </div>
      {subtext && <div className="text-xs text-text-muted mt-2">{subtext}</div>}
    </div>
  );
}

function ClientRow({ name, amount, percent }: { name: string, amount: string, percent: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-text-main">{name}</span>
        <span className="font-bold text-text-main">{amount}</span>
      </div>
      <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
        <div className="bg-brand-primary h-full rounded-full" style={{ width: percent }}></div>
      </div>
    </div>
  );
}
