# SCANS web prototype

Responsive prototype of the Sabah Contribution Administration Network System (SCANS): the public page, sign-in and six portals (worker app, employer, State Government, Immigration (JIM Sabah), merchant and Microtek operator), built with React and Vite.

All data is demo data in `src/data/demo.js`. Figures follow the SCANS proposal paper (130,391 registered workers, RM100 a month, 70:30 split); names, companies and records are samples.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel detects Vite. Keep the defaults: build command `npm run build`, output directory `dist`.
4. Deploy. `vercel.json` sends every route to `index.html`, so links such as `/state` or `/worker/pay` open directly.

## Routes

| Route | Screens |
|---|---|
| `/` | Public page: hero, portal cards, how a contribution moves, commitments, FAQ |
| `/login` | Sign in to any portal (sample accounts filled in, 2-step code for officials) |
| `/worker/start` | Worker sign-up: language, rules and consent, passport scan, face check, record match (with failure paths) |
| `/worker` … | Home, pay (with failed-payment path), receipt, receipts, perks with show-code sheet, notices, help, SCANS card, privacy, offline state, six languages on home and nav |
| `/employer/register` | Employer sign-up: SSM and eNORES check, person in charge, documents, review |
| `/employer` … | Overview with compliance score, workers and profiles, four-step bulk payment (FPX, failure path), monthly auto-pay with the s.113(4) permit gate, statements, settings |
| `/merchant/register` | Merchant sign-up: company, person in charge, outlets, documents, review |
| `/merchant` … | Overview, offer management with a four-step new-offer flow, confirm a redemption at the counter, outlets and staff, reports, settings |
| `/state` … | Overview, districts, FWECF account and settlements, workers and employers (read-only, lookups logged), notice approval, complaints, reports |
| `/jim` … | Immigration (JIM): overview of record matching and permit data, status check by SCANS ID, passport, PLKS or QR, record matching (JIM confirms which value is correct; corrections go to Microtek), workers (read-only, contribution status only), permits ending soon (information only), JIM data link and officer accounts, notices sent to the State for approval, audit log |
| `/admin` … | Microtek command centre, approvals, worker master list and profile tabs, employers, merchant onboarding and offer review, global announcements, reports centre, admin users and roles, audit log, connected systems |

Actions carry across portals within one browser session (for example, a Microtek announcement waits for State approval and the State's decision shows back in the Microtek console). A reload resets the sample data.

## Where things live

- `src/styles/app.css`: design tokens and shared styles in the Sabah GO look (Poppins, light blue ground, white cards with soft shadows, navy to cyan gradient).
- `src/components/ui.jsx`: app shell, cards, tables with paging, tabs, stepper, drawer, modal, charts and the Sabah district map.
- `src/data/demo.js`: all shared sample data, derived so totals agree across portals.
- `src/pages/<portal>/`: one folder per portal; `src/pages/shared/` holds the record screens and session store used by the government consoles (the JIM portal writes its lookups to the same audit log and its notices to the same State approval queue).
- `public/img/`: photographs, the MOF Sabah crest and payment marks (reused from Sabah GO).
