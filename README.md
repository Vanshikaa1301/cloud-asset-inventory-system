# Cloud Asset Inventory

A multi-cloud asset management dashboard built with React, Vite, and Tailwind CSS. View, search, filter, and monitor cloud resources across AWS, Azure, and GCP.

## Features

- **Dashboard** — overview of cloud accounts, assets, and cost breakdowns
- **Asset Inventory** — searchable, sortable, filterable table of all cloud resources
- **Asset Details** — tabbed view with overview, security, relationships, activity, and cost
- **Cloud Accounts** — card grid for connected AWS, Azure, and GCP accounts
- **Resource Explorer** — tree-based browser for cloud resource hierarchy
- **Security** — findings, compliance scores, and risk assessment
- **Alerts** — filterable alert list with resolve workflow
- **Activity Log** — audit trail of all cloud operations
- **Reports** — generate and download inventory and compliance reports
- **Settings** — org profile, inventory rules, notification preferences, theme toggle
- **Dark mode** — full light/dark theme support
- **Auth** — mock login/register flow with protected routes

## Tech Stack

- React 19 + React Router
- Vite 8
- Tailwind CSS 4
- Recharts (charts)
- Lucide React (icons)
- oxlint (linting)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173].

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint |
