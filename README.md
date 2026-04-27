# TAQA Anomaly Management Platform

A full-stack industrial anomaly management system built for the **TAQA Morocco Taqathon** hackathon. The platform enables operations and maintenance teams to detect, track, prioritize, and resolve equipment anomalies using AI-powered criticality predictions.

## Overview

Industrial facilities generate hundreds of anomalies daily. This platform provides a structured workflow to:

- **Ingest** anomalies manually or via Excel batch upload
- **Predict** criticality scores (integrity, availability, process safety) using a machine learning model
- **Prioritize** anomalies automatically based on AI-scored criticality
- **Schedule** maintenance windows and auto-assign eligible anomalies to them
- **Track** resolution through status workflows, action plans, comments, and REX (Return of Experience) documents

## Architecture

```
taqa-product/
├── taqathon-front/         # React + TypeScript frontend (Vite)
├── taqathon-back/          # NestJS REST API backend
├── taqathon-model-service/ # Python FastAPI ML inference service
├── taqathon-model/         # Jupyter notebooks for model training
└── docker-compose.yaml     # Full-stack orchestration
```

### Frontend — React + TypeScript

Built with **React 18**, **Vite**, **TailwindCSS**, and **shadcn/ui** components.

| Page | Description |
|------|-------------|
| Dashboard | KPI overview — open anomalies, critical alerts, monthly trend chart |
| Anomaly List | Searchable, filterable, paginated anomaly table with criticality badges |
| Anomaly Details | Full anomaly view with action plans, maintenance window card, REX section |
| Create Anomaly | Form to submit a new anomaly with optional ML prediction |
| Maintenance | Drag-and-drop maintenance window calendar with anomaly assignment |
| REX | Return of Experience document management per anomaly |
| Settings | User profile management |

State management via **Zustand**. Multilingual UI (English, French, Arabic) via a custom i18n system.

### Backend — NestJS

A modular REST API backed by **SQLite** (via Prisma ORM), secured with **JWT authentication**.

| Module | Responsibility |
|--------|---------------|
| `auth` | Local login with bcrypt password hashing, JWT issuance |
| `user` | User CRUD |
| `anomaly` | Full anomaly lifecycle — CRUD, search/filter, pagination, dashboard aggregation, file upload, ML prediction proxy |
| `maintenance-windows` | Scheduling, overlap validation, automatic anomaly assignment algorithm |
| `attachements` | File storage for anomaly attachments and REX documents |
| `comments` | Per-anomaly comment threads |
| `change-history` | Audit trail for anomaly field changes |

### ML Service — Python FastAPI

A **FastAPI** service that wraps an **XGBoost multi-output pipeline** trained on historical anomaly data.

- Accepts `.xlsx` or `.csv` files via `POST /predict`
- Preprocesses French-language text fields (tokenization, stopword removal, accent stripping)
- Returns predicted scores for: **Disponibilité**, **Process Safety**, **Fiabilité Intégrité**, and **Criticité**

## Key Features

### AI-Powered Criticality Scoring
Anomalies can be submitted to the ML service at creation time. The model returns predicted criticality dimensions which are stored alongside the anomaly and surfaced in the UI.

### Smart Maintenance Window Scheduling
When a maintenance window is created or updated, the backend automatically runs an assignment algorithm that:
1. Filters eligible anomalies (shutdown required, not yet assigned, not closed)
2. Ranks them by criticality and estimated repair time
3. Fills each window greedily without exceeding its time budget

### Batch Excel Import
Upload a spreadsheet of anomalies and the system will run ML predictions on each row and bulk-insert them into the database.

### REX (Return of Experience)
For resolved anomalies, engineers can attach a REX file (lessons learned document). REX documents are indexed and browsable from the REX page.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Zustand, React Query |
| Backend | NestJS, Prisma ORM, SQLite, Passport.js (JWT), Swagger |
| ML Service | Python, FastAPI, XGBoost, scikit-learn, pandas, NLTK |
| Infra | Docker, Docker Compose |

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- Docker (for full-stack deployment)

### With Docker Compose

```bash
docker compose up --build
```

This starts all three services:
- Frontend → `http://localhost:8080`
- Backend API → `http://localhost:3001`
- ML Service → `http://localhost:3000`

### Manual Setup

**Backend**
```bash
cd taqathon-back
cp .example.env .env        # fill in DB_URLSQLITE and SECRET
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

**Frontend**
```bash
cd taqathon-front
npm install
npm run dev
```

**ML Service**
```bash
cd taqathon-model-service
pip install -r requirements.txt
uvicorn server:app --port 3000
```

## API Documentation

Swagger UI is available at `http://localhost:3001/api` when the backend is running.

## Environment Variables

**Backend** (`.env`):
```
DB_URLSQLITE=file:./dev.db
SECRET=your_jwt_secret
FRONT_URL=http://localhost:8080
```

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:3001
```

## Project Context

This project was built for the **TAQA Morocco Taqathon** — an internal hackathon challenging teams to solve real operational problems with technology. The platform addresses the challenge of managing hundreds of equipment anomalies across a large power generation facility, providing a data-driven approach to maintenance prioritization.
