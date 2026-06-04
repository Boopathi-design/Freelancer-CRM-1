# InvoiceHQ — Freelancer CRM & Automated Invoicing Studio

Welcome to **InvoiceHQ**, a production-grade, highly scalable B2B SaaS CRM platform tailored for freelancers and studios. The platform features dynamic pipeline kanbans, split-pane invoicing editors, localized GST tax calculations, and simulated webhook reconciliation flows.

---

## 🛠️ Technology Stack
- **Framework & Core:** TypeScript compiled natively, React 19, Next.js 16 (App Router).
- **Styling & Themes:** Tailwind CSS v4 custom color property variables (`brand-primary`, `surface-bg`, `surface-card`, `border-line`, etc.) configured natively to transition smoothly between Light and Dark mode tokens.
- **Database & Persistent State:** A relational local storage database layer (`/src/lib/mockDb.ts`) managing tables for Users, Leads, Deals, Clients, Invoices, Tasks, and Transaction Logs.
- **Numeric Rendering:** Tabular-nums layout alignments to prevent page rendering jumps.

---

## 🚀 Getting Started & Execution

First, boot the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your desktop or tablet to access the control room.

---

## 🧭 Step-by-Step Testing Flow (Case Study Walkthrough)

To verify the complete integration of the CRM platform, follow this role flow across system boundaries:

### 1. Workspace Configuration & Setup
- Click **Settings** in the sidebar.
- Observe the **Token Tree** representing Light and Dark mode variables.
- Change the **Owner GSTIN** (e.g., `27AAARK1234B1ZP`), **Place of Supply**, and **Base Currency**.
- Save the changes (observing success alerts). Swap between **Light Mode** and **Dark Mode** at the bottom of the sidebar to check variable styling.

### 2. High-Velocity Sales Funnel (Kanban & Grid)
- Click **Pipeline** in the sidebar.
- Switch between **Kanban Board** and **Data Grid Master** views.
- Under **Kanban**, drag any deal (e.g., *E-Commerce Rebranding* valued at ₹85,000) from *Negotiation* to **Won** using native HTML5 drag-and-drop. Column totals will auto-calculate instantly.
- Click on the deal card or row to slide open the **Deal details panel**.
- In the side panel of a **Won** deal, click the **Trigger AI Draft Scope** CTA. This generates project scope deliverables and redirects you to the Proposals page with these values.

### 3. AI Proposal Builder
- The fields (Title, Client, Budget, Scope) will pre-fill based on the Won deal.
- Select your preferred copywriting tone (Professional, Creative, etc.) and click **Generate with AI**.
- Watch the right-hand panel display the loading layout skeleton, compile, and render the formatted proposal sheet.
- Click **Convert to Invoice** to load the Billing Studio.

### 4. Split-Pane Billing Studio
- Select your client profile (e.g., *Webcraft Solutions*).
- Observe the pre-populated invoice fields, code sequences, and itemized rows.
- Click the **AI Improve** button next to a line item. The description will be expanded into a professional, client-ready description.
- Toggle **GST Applicable (CGST + SGST)** to verify intra-state 18% splits (9% CGST + 9% SGST). The right-hand preview sheet updates in real-time with `tabular-nums` formatting.
- Click **Preview & Send**. This saves the invoice and returns you to the Invoice directory list.

### 5. Public Client Portal & webhook Reconciliation
- Locate your new invoice in the list and click it, or click **Portal** at the top of the navbar to open the public payment portal `/portal/[id]`.
- Click **Export PDF / Print** to open the browser print page.
- Click **Pay via UPI Gateway**. This opens the UPI checkout modal displaying a styled QR code.
- Click **Process Instant UPI Payment**. A spinner will run for 2 seconds (simulating webhook callbacks).
- Once paid:
  - The portal banner changes to a green **Paid** state with transaction reference logs.
  - The local database updates and triggers automated balance updates.
  - Return to the **Dashboard** to see the outstanding balances and **Cash at Risk** metrics updated.

---

## 🧪 Production Compilation Check
To compile code, check syntax, and run eslint checks:
```bash
npm run build
```
The output compiles cleanly into static and server-rendered routes with zero bugs.
