# SCANS — Handoff for Claude Code

You are continuing the build of **SCANS (Sabah Contribution Administration Network System)**, the platform that runs the **Foreign Worker Economic Contribution Fund (FWECF)** for Kerajaan Negeri Sabah. A working React + Vite prototype already exists (`scans-web.zip`). Your job is to build it out into the full UI: keep the structure, design system and wording described here, replace demo data with real data contracts, and fill the gaps listed in "What to build next".

Read this whole file before writing code.

---

## 1. Links

### Figma (SCANS copy of the MyFocus design, rebranded to SCANS, navy palette)
- File: https://www.figma.com/design/EV8JFu5mU29cQPjZNOD7xn/MyFocus--Copy-?node-id=2-5690
- Prototype flows:
  1. Superadmin (Microtek): https://www.figma.com/proto/EV8JFu5mU29cQPjZNOD7xn/MyFocus--Copy-?node-id=1023-177953&page-id=994%3A149418&starting-point-node-id=1023%3A177953&scaling=contain&content-scaling=responsive&show-proto-sidebar=1
  2. State Government (Kerajaan Negeri Sabah): https://www.figma.com/proto/EV8JFu5mU29cQPjZNOD7xn/MyFocus--Copy-?node-id=1023-183286&page-id=994%3A149418&starting-point-node-id=1023%3A183286&scaling=contain&content-scaling=responsive&show-proto-sidebar=1
  3. Employer: https://www.figma.com/proto/EV8JFu5mU29cQPjZNOD7xn/MyFocus--Copy-?node-id=1023-200689&page-id=994%3A149418&starting-point-node-id=1023%3A200689&scaling=contain&content-scaling=responsive&show-proto-sidebar=1
  4. Merchant: https://www.figma.com/proto/EV8JFu5mU29cQPjZNOD7xn/MyFocus--Copy-?node-id=1048-220723&page-id=994%3A149418&starting-point-node-id=1048%3A220723&scaling=contain&content-scaling=responsive&show-proto-sidebar=1
  5. Worker App: https://www.figma.com/proto/EV8JFu5mU29cQPjZNOD7xn/MyFocus--Copy-?node-id=636-159419&page-id=2%3A5690&starting-point-node-id=636%3A159419&scaling=scale-down&content-scaling=fixed&show-proto-sidebar=1

### Documents (Google Drive, SCANS folder)
- PRD (Google Doc): https://docs.google.com/document/d/1Lpm-vRUU9FEfOIXm0my9FsUZZ4Iq2ilTKp9fOBB_Aco/edit
- PRD (Claude doc): https://claude.ai/artifact/EL9SvHCdwZZJxBKKgaTCDM
- Quotation and assumptions (Google Sheet): https://docs.google.com/spreadsheets/d/1pqwNtNlOhwhWpfNbxQOB99Dpy1dFMfIE7AHnB2ai8Hk/edit
- Video storyboard, Malay: https://docs.google.com/document/d/1nrM2QBpFSEzlh2uw7OrrxOikp0qbGFgnxT-Bgic990g/edit
- Video storyboard, English: https://docs.google.com/document/d/17--ry7YCp3QXLQVI5do-9hFK5TxQ-58RfJnfsY1qF88/edit

### Code
- `scans-web.zip` (attached separately). Unzip it as the repo root.

**Source of truth when they disagree:** the coded prototype > the PRD > the Figma file. The Figma file still has MyFocus-era data and some wording the code already fixed (see §9).

---

## 2. The product in one paragraph

Every registered foreign worker in Sabah (130,391 on 31 Dec 2025) pays a contribution of **RM100 a month** (or RM300 a quarter, RM1,200 a year). Money goes through a licensed payment acquirer straight into an **FWECF account held by Jabatan Kewangan Negeri Sabah**; SCANS never holds funds. **70% stays with the State, 30% pays the operator (Microtek)** under a Private Finance Initiative, so the State bears no build or running cost. SCANS also gives the State a direct, multilingual channel to every worker (notices, complaints) and gives each party its own view of one shared record.

---

## 3. Users, portals and routes

| Portal | Who | Base route | Form factor |
|---|---|---|---|
| Public site | Anyone | `/`, `/login` | Responsive marketing page + sign-in |
| Worker app | Registered PLKS holders (mostly plantation and agriculture) | `/worker/*` | Mobile first; bottom tab bar on phones, side rail ≥960px |
| Employer portal | Companies employing foreign workers | `/employer/*` | Web dashboard |
| State dashboard | Kerajaan Negeri Sabah, Kementerian Kewangan Negeri Sabah, Jabatan Kewangan Negeri, auditors | `/state/*` | Web dashboard |
| Merchant portal | Partner shops (e.g. 7-Eleven Sabah) | `/merchant/*` | Web dashboard |
| Operator console | Microtek operations | `/admin/*` | Web dashboard |

### Full screen list (all exist in the prototype)

**Public**
- `/` Landing: folder-stack hero ("RM100 a month"), how it works (one receipt card in four states), stepped figure tiles (130,391 · RM100 · 70%), five-portal index with live preview, FAQ accordion, block-built SCANS footer.
- `/login` Sign-in with a folder tab per portal. Workers: phone + SMS code. State: email/password or MyDigital ID. Microtek: 2-step sign-in required.

**Worker app**
- `/worker/start` Sign-up, 5 steps: language (6 languages) → six plain rules + consent checkbox (unticked by default) → passport scan (MRZ) → face check via KDN → record matched from SWIMS/eNORES ("Something is wrong" goes to manual review, never rejection).
- `/worker` Home: greeting, amount due card, paid-up-to, permit expiry (information only), employer, latest notices, receipts and help tiles.
- `/worker/pay` Choose period (1/3/12 months) and method (Touch ’n Go, DuitNow QR, Cash at 7-Eleven with counter code, Boost, GrabPay, ShopeePay, FPX). Sticky total bar.
- `/worker/receipt/:id` Payment received, receipt slip, save/share.
- `/worker/history` Receipts list (shows when the employer paid).
- `/worker/perks` Offers; "Show code" opens a sheet. A perk counts as used **only after the shop confirms**.
- `/worker/notices`, `/worker/notices/:id` Official notices in the worker's language.
- `/worker/help` Complaint form (topic, free text in any language, "Do not tell my employer my name"), status of earlier requests.
- `/worker/me` SCANS card (QR shows contribution status only, "not an immigration document"), PLKS number, permit expiry, passport, language setting.
- `/worker/privacy` How data is used.

**Employer**
- `/employer` Overview: workers on SCANS, paid, not paid, app use; workers paid per month; permits ending within 60 days; owing from earlier months.
- `/employer/workers` Filterable table (All / Not paid / Permit ends soon) with a profile drawer (contribution status only).
- `/employer/pay` 4-step pay-for-workers: choose workers (only those who gave consent are selectable) → months → check and pay (FPX bank) → done with batch receipt and one receipt per worker. **The same workers and totals carry through every step.**
- `/employer/auto-debit` Monthly auto-pay: FPX mandate, worker consent, JTK s.113(4) deduction permit status.
- `/employer/reports` Statements to download.
- `/employer/settings` Registration (read-only, synced from SSM/eNORES), people who can sign in.

**State Government**
- `/state` Collection this month, % paying, State share year to date, monthly collection chart, 70:30 split bar, paid / 1 month owing / 3+ months owing, **Sabah district tile map** with district detail, sector, payment method and nationality breakdowns.
- `/state/districts` District table with totals row that adds up to 130,391.
- `/state/employers` Employers table + worker lookup (lookup is written to the audit log).
- `/state/notices` Sent notices + "Write a notice" drawer (audience by district, sector or arrears; translated into 6 languages; State approves before sending).
- `/state/complaints` Complaint figures and table by agency.
- `/state/reports` Collection and reconciliation, FWECF account statement, district/sector report, audit log extract, complaints by agency.

**Merchant**
- `/merchant` Uses this month, live offers, outlets, uses per week and per outlet.
- `/merchant/offers` Offers table + "New offer" drawer (goes to Microtek for approval).
- `/merchant/outlets` Outlets and uses.

**Microtek operator**
- `/admin` Uptime, items waiting, paid this month, reconciliation breaks; connected systems (SWIMS, eNORES, KDN, JIM read-only, payment gateway, SMS/WhatsApp).
- `/admin/approvals` Review queue by type (employer sign-up, merchant offer, record mismatch, merchant sign-up). State announcements show "Waiting for State approval" and cannot be approved here.
- `/admin/workers` Worker records with drawer (every view logged).
- `/admin/audit` Audit log.

---

## 4. Rules the UI must enforce (from the proposal, non-negotiable)

1. Arrears **never** trigger permit action, passport holding, travel restriction or detention. SCANS has no function to issue or cancel permits. Never write wording that implies otherwise (the old MyFocus copy said "suspension of work permit" and "deportation"; that is removed).
2. The worker is liable for the contribution. Employers may pay only with the worker's consent, and may deduct from wages only with a JTK Sabah written permit under Labour Ordinance s.113(4). The UI blocks payroll deduction without that permit on file.
3. SCANS registration is not an immigration check and does not decide anyone's status.
4. Mandatory collection switches on only after the State's legal instrument is in place.
5. Data: State owns it, PDPA applies, role-based access, 2FA for all web users, every view/export/change logged, no advertising use.
6. Employers see contribution status only (no wages, complaints or immigration details). Merchants never see worker records.
7. QR/SCANS card shows contribution status only.

---

## 5. Design system

**Idea:** the State keeps a file for each party. The **folder tab (trapezoid)** is the one shape in the system: tabs, the landing hero folder stack, the cut corner on cards, receipts and tiles, tabbed buttons on the public page.

**Colours** (taken from the SCANS logo; defined in `src/styles/app.css`):

| Token | Hex | Use |
|---|---|---|
| `--navy` | `#014078` | Primary, sidebar, buttons, key panels |
| `--navy-deep` | `#012a50` | Landing ground, text on sky fields |
| `--navy-ink` / `--ink` | `#0d2236` | Body text |
| `--sky` | `#4a9bd4` | Accent fields, charts (use navy text on sky, not white) |
| `--sky-soft` | `#dcebf6` | Selected states, callouts |
| `--red` | `#c9282e` | Critical only (3+ months owing, errors) |
| `--amber` / `--amber-soft` | `#8a5800` / `#f7ead0` | Warnings |
| `--green` / `--green-soft` | `#17704a` / `#dcf0e5` | Paid, success |
| `--ground` | `#eef2f6` | Page background |
| `--surface` / `--surface-2` / `--surface-3` | `#fff` / `#e4ebf2` / `#d3dee9` | Tone steps between surfaces |
| `--muted` | `#475b6f` | Secondary text only |

**Type:** one family, **Archivo** (variable, self-hosted via `@fontsource-variable/archivo/wdth.css`). Big figures use `font-variation-settings: 'wdth' 72–80`, weight 800–850, tabular numbers. Body 16px+, min size 13px.

**House rules** (from the anti-slop skill used on this build; keep them):
- No gradients, no glass/backdrop blur, no shadows on things at rest (only drawers, dialogs, toasts, sticky pay bar).
- Surfaces are separated by tone steps, not borders. Real tables and form fields may have lines.
- No tiny uppercase letter-spaced labels, no eyebrow labels above headings, no monospace, no 01/02/03 numbering, no emoji, no icon-topped card grids.
- One radius (`--r: 4px`). Headlines two lines max at every width.
- Sentence case everywhere. Plain verbs. Errors say what happened and what to do.
- Responsive: sidebar becomes an overlay below 960px; tables use `.data.stack` to become stacked records below 720px; district map becomes 2 columns on phones. No horizontal scroll at 390px.
- Respect `prefers-reduced-motion`.

**Shared components** (`src/components/ui.jsx`): `AppShell`, `PageHead`, `Status` (maps status text to ok/warn/bad/info), `Figure`, `Tabs` (folder tabs), `Drawer`, `ToastProvider/useToast`, `Columns` (bar chart), `SplitBar`, `MeterRows`, `DistrictMap` + `DistrictDetail`, `Logo`.

**Logos:** `public/scans-logo.png` (full colour, transparent) and `public/scans-logo-light.png` (white letters for navy backgrounds). The State/agency mark shown in Figma is the **MOF Sabah** logo; confirm whether the Sabah state crest should be used instead.

---

## 6. Data model and demo data

All demo data lives in `src/data/demo.js` and is **derived** so totals agree across portals. Keep this principle when wiring real data: every figure on one screen must reconcile with the same figure on another.

Real figures (from the SCANS proposal paper):
- Registered workers: 130,391 (Plantation 76,726; Agriculture 26,736; Services 7,783; Manufacturing 6,870; Domestic 6,844; Construction 5,345; Mining 87).
- SWIMS records: 122,228 (39,986 valid, 82,242 not valid). Undocumented estimate: 600,000 (unverified, not payers).
- Rate RM100/month; compliance ramp Y1 60%, Y2 75%, Y3 85%, Y4–5 90%; 90% = 117,352 payers = RM140.82m a year; State 70% = RM98.58m.

Demo-only (replace with live data): district split, employers, merchants, offers, notices, complaints, audit log, integrations, payment method shares, nationality shares.

**The one demo worker** (used identically everywhere): Agus Salim, SCANS ID `SCN26W0047218`, passport `C 5539120`, Indonesia, PLKS `PLKS-SBH-2026-0481193`, permit valid to 14 Mar 2028, Harvester at Ladang Segama, Lahad Datu, employer Borneo Palm Plantations Sdn Bhd (412 workers, 371 paid), paid up to May 2027, June due RM100 by 5 Jun 2027. Demo month: June 2027.

**Core entities to model for the real build:** Worker (SCANS ID, identity, PLKS, permit expiry from JIM read-only, employer, district, sector, language, consent flags), Employer (SSM, eNORES code, users, deduction permit status, mandates), Payment (receipt ID, worker, period, amount, method, payer = worker/employer, acquirer ref, settlement status), Batch (employer payments), Notice (audience, languages, approval, delivery stats), Complaint (topic, language, anonymity flag, routed agency, status), Offer/Outlet/Redemption (redemption confirmed by merchant), AuditEvent (who, action, target, time), Integration status.

**Integrations** (read-only except payments and messaging): SWIMS (State), eNORES (JTK Sabah), KDN identity check, JIM permit data (display only), licensed payment acquirer (FPX, DuitNow, e-wallets, cards, 7-Eleven cash), SMS/WhatsApp/push. Nothing written back may change a worker's status.

**Non-functional:** 130,391 workers at launch, design for ~420,000; 99.5% uptime (payments 99.9%); Android 8+/iOS 15+, works on 3G, status/QR/receipts offline; data hosted in Malaysia; pen test before launch.

---

## 7. Languages

Worker-facing UI and notices: Bahasa Melayu, English, Bahasa Indonesia, Filipino, Bengali, Nepali. The prototype only translates the worker home and nav (EN/BM/ID/FIL dictionary in `src/pages/worker/Worker.jsx`). **Officials' dashboards (State, and JTK views) must be in Bahasa Melayu** in the real build; the prototype shows them in English.

---

## 8. Run and deploy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```
Vercel: import the GitHub repo, framework Vite, build `npm run build`, output `dist`. `vercel.json` rewrites all routes to `index.html`.

Project layout: `src/data/demo.js` (data), `src/components/ui.jsx` (shared UI), `src/styles/app.css` (tokens + app styles), `src/styles/landing.css`, `src/pages/Landing.jsx`, `src/pages/Login.jsx`, `src/pages/worker/`, `src/pages/employer/`, `src/pages/state/`, `src/pages/admin/Partners.jsx` (merchant + operator).

---

## 9. Already fixed in the code (MicroPay design review, Sept 2026)

- REV-01 Bulk payment keeps the same workers and totals from selection to receipt.
- REV-02 Payment method matches from choice to receipt.
- REV-04 One consistent demo worker across list, profile and home.
- REV-07 Unique receipt and transaction IDs; no "Pay" at RM0.
- REV-08 Contribution wording, not payroll wording; employer screens no longer titled "Worker Profile".
- REV-09 Dates and totals reconcile (districts sum to 130,391).
- REV-14 Perk is the one picked; counts as used only after the shop confirms.
- REV-15 Consent box unticked by default; support path exists.
- Permit-suspension/deportation wording removed; QR labelled correctly (PLKS number, not "mobile number").

Still open (need decisions, not code): REV-05 rule sources (deadline, fees), REV-06 role and access matrix for State users, REV-10–13 data sources, claims, cash and auto-debit policy, REV-16 failure-case demo.

---

## 10. What to build next

1. **Bahasa Melayu for all official screens**, and full six-language strings for the worker app (extract all copy into i18n files).
2. **Real Sabah district map** (GeoJSON of all districts) to replace the tile map; keep the tile map as the phone fallback.
3. **Replace demo data** with typed API contracts (start with TypeScript types for the entities in §6) and mock services that return the same shapes.
4. **States the prototype lacks:** loading, empty, error and offline for every list and form; failed payment, failed passport scan, face mismatch, no connection; session timeout.
5. **AI features** discussed (not yet approved): multilingual worker assistant, complaint triage and translation, "ask the data" for State officers, arrears forecast, fraud/duplicate detection, document check, report summaries. Rule: AI can suggest, explain or flag, never change a worker's status, permit or payment.
6. **Role and access matrix** once REV-06 is decided (State roles: viewer, approver for notices, finance export, auditor).
7. **Assets** to drop into `public/` (generate or license):
   - Photography (consented, Sabah): plantation harvest, 7-Eleven cash payment, worker using phone, State building, employer office, sector shots; one 10–20 s muted video loop.
   - Marks (SVG): SCANS logo set, app icons (1024/512/192/180, favicon 32/16, maskable), Sabah crest or MOF Sabah logo (with permission), JTK Sabah, KDN, JIM, Microtek, MicroPay, OG image 1200×630.
   - Payment marks: FPX, DuitNow QR, Touch ’n Go, Boost, GrabPay, ShopeePay, 7-Eleven, FPX bank logos (replace the placeholder letter codes).
   - Merchant logos: 7-Eleven Sabah, CelcomDigi, Pasaraya Servay, Klinik Mesra Borneo.
   - Worker app illustrations: passport MRZ guide, face-check guide, empty/success/error states.
   - Avatars (synthetic or consented), SPECIMEN passport and PLKS samples.
   - Templates: receipt PDF (single and batch), monthly statements, SMS/WhatsApp notices in six languages.

The public page currently fails the design inspector only on "few real pictures" because no photographs exist yet; adding the photography above fixes it.
