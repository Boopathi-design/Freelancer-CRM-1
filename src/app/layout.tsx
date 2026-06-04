import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "InvoiceHQ | Freelancer CRM & Automated Invoicing Studio",
  description: "Modern, B2B SaaS Freelancer CRM platform featuring dynamic sales pipelines, Kanban board deals, localized invoice builder, automated GST calculations, and frictionless UPI billing reconciliation.",
  keywords: "Freelancer CRM, Invoice Generator, GST Invoicing, Sales Pipeline Kanban, UPI payment QR, Razorpay Webhook, B2B SaaS CRM",
  authors: [{ name: "ARK Design Studio" }],
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-surface-bg text-text-main flex flex-col font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
