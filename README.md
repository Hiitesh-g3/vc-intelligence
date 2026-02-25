# VC Intelligence Interface + Live Enrichment

A lightweight VC discovery tool that helps investors discover startups, enrich company data from public sources, and organize opportunities into lists.

This project implements a thesis-driven sourcing workflow inspired by modern VC intelligence platforms.

---

## ✨ Overview

Venture capital sourcing is repetitive and fragmented across multiple tools.
This application provides a unified workflow:

**Discover → Open profile → Enrich → Analyze → Save**

The system enables fast company discovery while surfacing structured insights extracted from real public websites.

---

## 🚀 Core Features

### 🔎 Company Discovery

* Search and filter companies
* Sortable results table
* Pagination support
* Mock dataset for MVP

### 🧾 Company Profile

* Overview section
* Notes per company
* Signals timeline (basic)
* Save company to lists

### ⭐ Live Enrichment (Core Feature)

* Server-side enrichment via `/api/enrich`
* Fetches public website content
* Extracts:

  * Summary
  * What the company does
  * Keywords
  * Derived signals (careers page, blog, docs, etc.)
  * Sources with timestamps
* Loading, error, and result states
* Cached per company for performance

### 📂 Lists & Saved Searches

* Create and manage lists
* Persist data in localStorage
* Save and re-run searches

---

## 🏗 Architecture

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* Component-driven UI (v0 generated + manual integration)

### Backend (MVP)

* Next.js API Routes
* `/api/enrich` server endpoint
* Public web fetch + structured extraction

### State & Persistence

* localStorage for lists, notes, saved searches
* Client caching for enrichment results

---

## 🔐 Enrichment Design

The enrichment pipeline follows an MVP vertical slice:

1. User clicks **Enrich**
2. Client calls server endpoint (`/api/enrich`)
3. Server fetches public website content
4. Content is parsed into structured fields
5. Results returned with sources and timestamp
6. Data cached per company

API keys are kept server-side only.

---

## 🎯 Design Goals

* Thesis-first discovery workflow
* Explainable insights (sources shown)
* Fast interactions
* Production-like UX with minimal scope
* Safe server-side enrichment

---

## 🧪 Running Locally

```bash
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

---

## ⚙️ Environment Variables

Create `.env.local` if enrichment providers require keys:

```
EXAMPLE_API_KEY=
```

(For MVP, enrichment can run without external providers.)

---

## 📦 Deployment

Recommended: **Vercel**

Steps:

1. Push repo to GitHub
2. Import project in Vercel
3. Add environment variables if needed
4. Deploy

---

## 🧠 Product Thinking

This project focuses on one complete workflow rather than a full platform:

* Real discovery interface
* One working enrichment path end-to-end
* Transparent insights with sources
* Simple persistence layer

This aligns with an MVP approach used in early product development.

---

## 🔮 Future Improvements

* Thesis scoring engine
* Background enrichment queue
* Vector search for similarity
* CRM / Slack integrations
* Multi-source enrichment
* Real database persistence

---
