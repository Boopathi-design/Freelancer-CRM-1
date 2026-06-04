"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CommandSearch from "./CommandSearch";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function WorkspaceLayout({ children, title, subtitle }: WorkspaceLayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-bg text-text-main">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar title={title} subtitle={subtitle} onOpenSearch={() => setIsSearchOpen(true)} />

        {/* Content Body — NOTE: no transform/overflow on this element so fixed children (modals, panels) escape correctly */}
        <main className="flex-grow p-8">
          <div className="animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>

      {/* Global Command Search Overlay */}
      <CommandSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
