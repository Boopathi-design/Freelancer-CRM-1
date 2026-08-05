"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { mockDb } from "@/lib/mockDb";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// ─── Dummy Data ─────────────────────────────────────────────
const revenueMonthly = [
  { month: "Jan", revenue: 82000, collected: 72000 },
  { month: "Feb", revenue: 95000, collected: 80000 },
  { month: "Mar", revenue: 110000, collected: 105000 },
  { month: "Apr", revenue: 88000, collected: 78000 },
  { month: "May", revenue: 125000, collected: 115000 },
  { month: "Jun", revenue: 142000, collected: 130000 },
  { month: "Jul", revenue: 165000, collected: 148000 },
  { month: "Aug", revenue: 190000, collected: 175000 },
];

const revenueByClient = [
  { name: "Web Craft Solutions", value: 2850000 },
  { name: "Brand Alchemy", value: 1950000 },
  { name: "Ananya Photography", value: 1200000 },
  { name: "Tech Consult India", value: 980000 },
  { name: "Glow Media", value: 760000 },
];

const pipelineData = [
  { stage: "Lead", count: 12, value: 580000 },
  { stage: "Discovery", count: 8, value: 420000 },
  { stage: "Proposal", count: 5, value: 310000 },
  { stage: "Negotiation", count: 3, value: 240000 },
  { stage: "Closed Won", count: 2, value: 185000 },
];

const proposalsByStatus = [
  { name: "Draft", value: 5, color: "#94A3B8" },
  { name: "Sent", value: 8, color: "#6366F1" },
  { name: "Viewed", value: 6, color: "#8B5CF6" },
  { name: "Accepted", value: 4, color: "#10B981" },
  { name: "Declined", value: 2, color: "#EF4444" },
];

const invoiceAging = [
  { bucket: "0-7 Days", count: 4, amount: 280000 },
  { bucket: "8-15 Days", count: 2, amount: 145000 },
  { bucket: "15-30 Days", count: 3, amount: 210000 },
  { bucket: "30+ Days", count: 1, amount: 95000 },
];

const clientActivity = [
  { month: "Mar", newClients: 2, activeClients: 8 },
  { month: "Apr", newClients: 1, activeClients: 9 },
  { month: "May", newClients: 3, activeClients: 11 },
  { month: "Jun", newClients: 2, activeClients: 12 },
  { month: "Jul", newClients: 1, activeClients: 13 },
  { month: "Aug", newClients: 2, activeClients: 14 },
];

// ─── Custom Tooltip ──────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border-line rounded-xl shadow-lg p-3 text-sm">
        {label && <p className="font-semibold text-text-main mb-1">{label}</p>}
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {typeof entry.value === "number" && entry.value > 1000
              ? `₹${entry.value.toLocaleString("en-IN")}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Page ────────────────────────────────────────────────────
const TABS = ["Revenue", "Pipeline", "Clients", "Invoices"] as const;
type TabType = typeof TABS[number];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Revenue");

  const invoices = mockDb.getInvoices();
  const clients = mockDb.getClients();

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((a, i) => a + i.amount, 0);
  const totalOutstanding = invoices.filter(i => i.status !== "paid").reduce((a, i) => a + i.amount, 0);
  const paidCount = invoices.filter(i => i.status === "paid").length;
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  return (
    <ProtectedRoute>
      <WorkspaceLayout title="Reports" subtitle="Business performance and financial insights">
        <div className="space-y-6 max-w-7xl mx-auto">

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: DollarSign, color: "text-brand-primary", bg: "bg-brand-primary-light", trend: "+18% vs last month" },
              { label: "Outstanding", value: `₹${totalOutstanding.toLocaleString("en-IN")}`, icon: Clock, color: "text-state-warning", bg: "bg-state-warning/10", trend: `${overdueCount} overdue` },
              { label: "Active Clients", value: clients.length, icon: Users, color: "text-state-success", bg: "bg-state-success/10", trend: "+2 this month" },
              { label: "Paid Invoices", value: paidCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", trend: `${invoices.length} total` },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white border border-border-line rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon size={18} className={stat.color} />
                    </div>
                    <span className="text-[11px] font-medium text-state-success bg-state-success/10 px-2 py-0.5 rounded-full">{stat.trend}</span>
                  </div>
                  <p className="text-xs text-text-muted font-medium mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Tab Navigation (pill-style, like WebPulse reference) */}
          <div className="bg-white border border-border-line rounded-2xl p-1.5 shadow-sm flex gap-1.5 w-fit">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/30"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Revenue Tab ── */}
          {activeTab === "Revenue" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend */}
                <div className="lg:col-span-2 bg-white border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-text-main">Revenue Trend</h3>
                    <p className="text-xs text-text-muted mt-0.5">Monthly billed vs collected (INR)</p>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={revenueMonthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="revenue" name="Billed" stroke="#6366F1" fill="url(#colorRevenue)" strokeWidth={2.5} dot={{ r: 4, fill: "#6366F1" }} activeDot={{ r: 6 }} />
                      <Area type="monotone" dataKey="collected" name="Collected" stroke="#10B981" fill="url(#colorCollected)" strokeWidth={2.5} dot={{ r: 4, fill: "#10B981" }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Revenue by Client */}
                <div className="bg-white border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-text-main">Revenue by Client</h3>
                    <p className="text-xs text-text-muted mt-0.5">Top clients ranked</p>
                  </div>
                  <div className="space-y-4">
                    {revenueByClient.map((client, i) => {
                      const max = revenueByClient[0].value;
                      const pct = Math.round((client.value / max) * 100);
                      const colors = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];
                      return (
                        <div key={client.name}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-text-main truncate max-w-[140px]">{client.name}</span>
                            <span className="text-xs font-bold text-text-muted tabular-nums">₹{(client.value/100000).toFixed(1)}L</span>
                          </div>
                          <div className="w-full h-2 bg-surface-bg rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: colors[i] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Collected vs Outstanding donut-like */}
                  <div className="mt-6 pt-5 border-t border-border-line">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Collected vs Outstanding</p>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-state-success/10 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-state-success tabular-nums">₹{(totalRevenue/100000).toFixed(1)}L</p>
                        <p className="text-[10px] text-state-success font-medium uppercase mt-0.5">Collected</p>
                      </div>
                      <div className="flex-1 bg-state-danger/10 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-state-danger tabular-nums">₹{(totalOutstanding/100000).toFixed(1)}L</p>
                        <p className="text-[10px] text-state-danger font-medium uppercase mt-0.5">Outstanding</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Pipeline Tab ── */}
          {activeTab === "Pipeline" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pipeline Funnel */}
                <div className="bg-white border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-text-main">Deal Pipeline by Stage</h3>
                    <p className="text-xs text-text-muted mt-0.5">Number of deals per stage</p>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={pipelineData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: "#0F172A" }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Deals" fill="#6366F1" radius={[0, 6, 6, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Proposals by Status Pie */}
                <div className="bg-white border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-text-main">Proposals by Status</h3>
                    <p className="text-xs text-text-muted mt-0.5">Conversion funnel overview</p>
                  </div>
                  <div className="flex items-center justify-center gap-8">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie data={proposalsByStatus} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                          {proposalsByStatus.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 min-w-[120px]">
                      {proposalsByStatus.map(entry => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                          <span className="text-xs text-text-muted font-medium">{entry.name}</span>
                          <span className="text-xs font-bold text-text-main ml-auto">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border-line text-center">
                    <p className="text-xs text-text-muted">Conversion Rate</p>
                    <p className="text-2xl font-bold text-brand-primary mt-1">
                      {Math.round((proposalsByStatus.find(p => p.name === "Accepted")?.value ?? 0) / proposalsByStatus.reduce((a, p) => a + p.value, 0) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Expected Revenue */}
                <div className="lg:col-span-2 bg-white border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-text-main">Expected Revenue by Stage</h3>
                    <p className="text-xs text-text-muted mt-0.5">Deal value distribution across pipeline stages (₹)</p>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={pipelineData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="stage" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Deal Value" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── Clients Tab ── */}
          {activeTab === "Clients" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Client Activity */}
                <div className="bg-white border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-text-main">Client Activity</h3>
                    <p className="text-xs text-text-muted mt-0.5">New vs active clients per month</p>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={clientActivity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="newClients" name="New Clients" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 5, fill: "#6366F1" }} activeDot={{ r: 7 }} />
                      <Line type="monotone" dataKey="activeClients" name="Active Clients" stroke="#10B981" strokeWidth={2.5} dot={{ r: 5, fill: "#10B981" }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Clients Table */}
                <div className="bg-white border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-text-main">Top Clients by Revenue</h3>
                    <p className="text-xs text-text-muted mt-0.5">Ranked by total invoiced amount</p>
                  </div>
                  <div className="space-y-3">
                    {revenueByClient.map((client, i) => (
                      <div key={client.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-bg transition-colors">
                        <div className="w-8 h-8 rounded-full bg-brand-primary-light text-brand-primary font-bold text-sm flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-main truncate">{client.name}</p>
                          <p className="text-xs text-text-muted">Lifetime value</p>
                        </div>
                        <span className="text-sm font-bold text-text-main tabular-nums">₹{(client.value/100000).toFixed(2)}L</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border-line">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-text-muted font-medium">Repeat Business Rate</p>
                        <p className="text-xl font-bold text-brand-primary mt-0.5">78%</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted font-medium">At-Risk Clients</p>
                        <p className="text-xl font-bold text-state-danger mt-0.5">{clients.filter(c => c.avgDelay > 14).length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Invoices Tab ── */}
          {activeTab === "Invoices" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Invoice Aging Chart */}
                <div className="bg-white border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-text-main">Invoice Aging Analysis</h3>
                    <p className="text-xs text-text-muted mt-0.5">Overdue invoices by time bucket</p>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={invoiceAging} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="amount" name="Amount Overdue" radius={[6, 6, 0, 0]} barSize={44}>
                        {invoiceAging.map((entry, i) => {
                          const colors = ["#F59E0B", "#FB923C", "#EF4444", "#991B1B"];
                          return <Cell key={i} fill={colors[i]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Invoice Status Distribution */}
                <div className="bg-white border border-border-line rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-text-main">Invoice Status Distribution</h3>
                    <p className="text-xs text-text-muted mt-0.5">Breakdown of all invoice statuses</p>
                  </div>

                  {(() => {
                    const statusData = [
                      { name: "Paid", count: invoices.filter(i => i.status === "paid").length, color: "#10B981" },
                      { name: "Overdue", count: invoices.filter(i => i.status === "overdue").length, color: "#EF4444" },
                      { name: "Sent", count: invoices.filter(i => i.status === "sent").length, color: "#F59E0B" },
                      { name: "Draft", count: invoices.filter(i => i.status === "draft").length, color: "#94A3B8" },
                    ];
                    return (
                      <div className="flex items-center justify-center gap-8">
                        <ResponsiveContainer width={180} height={180}>
                          <PieChart>
                            <Pie data={statusData} dataKey="count" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                              {statusData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3 min-w-[120px]">
                          {[
                            { name: "Paid", count: invoices.filter(i => i.status === "paid").length, color: "#10B981" },
                            { name: "Overdue", count: invoices.filter(i => i.status === "overdue").length, color: "#EF4444" },
                            { name: "Sent", count: invoices.filter(i => i.status === "sent").length, color: "#F59E0B" },
                            { name: "Draft", count: invoices.filter(i => i.status === "draft").length, color: "#94A3B8" },
                          ].map(entry => (
                            <div key={entry.name} className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                              <span className="text-xs text-text-muted font-medium">{entry.name}</span>
                              <span className="text-xs font-bold text-text-main ml-auto">{entry.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-4 pt-4 border-t border-border-line grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-text-muted">Avg Time to Payment</p>
                      <p className="text-xl font-bold text-text-main mt-0.5">9 days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-text-muted">Collection Rate</p>
                      <p className="text-xl font-bold text-state-success mt-0.5">
                        {invoices.length > 0 ? Math.round((invoices.filter(i => i.status === "paid").length / invoices.length) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </WorkspaceLayout>
    </ProtectedRoute>
  );
}
