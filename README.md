# SCANS web prototype

Responsive prototype of the Sabah Contribution Administration Network System (SCANS): the public page, sign-in and five portals (worker app, employer, State Government, merchant and Microtek operator), built with React and Vite.

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

| Route | Screen |
|---|---|
| `/` | Public page |
| `/login` | Sign in, with a tab for each portal |
| `/worker/start` | Worker sign-up: language, rules, passport, face check, record |
| `/worker` … | Home, pay, receipt, receipts, perks, notices, help, SCANS card, privacy |
| `/employer` … | Overview, workers, pay for workers, monthly auto-pay, statements, company |
| `/state` … | Collection, districts, employers and workers, notices, complaints, reports |
| `/merchant` … | Overview, offers, outlets |
| `/admin` … | Operations, waiting for review, worker records, audit log |

## Where things live

- `src/styles/app.css` holds the design tokens (colours from the SCANS mark, one typeface, one radius) and every shared style.
- `src/components/ui.jsx` holds the app shell, tables, tabs, drawer, charts and the Sabah district tile map.
- `public/` holds the logo files. Put generated photographs, partner logos and illustrations here.
