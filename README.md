# 🌍 CarbonSphere

### Carbon-Aware Waste Pathway Optimization Platform

> **Don't optimize waste disposal. Optimize waste utilization.**

CarbonSphere is a decision-support platform that transforms fragmented waste streams into optimized circular-economy pathways.

Instead of simply asking **"Where should this waste go?"**, CarbonSphere asks:

> **"What should this waste become, where should it go, how should it get there, and what carbon and economic value can it create?"**

---

## ♻️ The Problem

Waste value chains are often fragmented.

A waste generator may know:

- What waste they have
- How much they have
- Where it is located

But they may not know:

- Which circular pathway is most suitable
- Which facility can process it
- Whether that facility has sufficient capacity
- Which route is economically practical
- How much carbon impact the pathway could create
- Which option provides the highest overall value

This creates a gap between **waste generation** and **measurable circular value**.

---

## 💡 Our Solution

CarbonSphere connects the entire waste-to-value decision into one intelligent workflow:

```text
WASTE
  ↓
PATHWAY
  ↓
FACILITY
  ↓
ROUTE
  ↓
CARBON + ECONOMIC VALUE
```

---

## 🌟 Core Differentiator: Carbon Pathway Optimization Engine

Traditional platforms focus solely on reverse logistics or static waste matching. **CarbonSphere** provides the intelligence and decision layer that determines **what the waste should become**:

1. **Feedstock Thermodynamic Profiling**: Evaluates moisture, ash, C:N ratio, and contamination against physical conversion thresholds.
2. **Pathway Feasibility Filtering**:
   - **Biochar Pyrolysis**: Low-moisture dry biomass (<25% moisture), yielding recalcitrant biocarbon with 100-year permanence.
   - **Biogas Anaerobic Digestion**: High-moisture organic slurries (65–95% moisture) preventing landfill methane formation.
   - **Carbon-Negative Materials**: Clean fibrous cellulose scraps (<15% moisture, <3% ash) displacing Portland cement clinker and synthetic resins.
3. **Multi-Criteria Optimization (MCDA)**:
   - Configurable objective weighting profiles:
     - **Balanced Optimization** (30% Carbon, 25% Economic, 20% Logistics, 15% Compatibility, 10% Capacity)
     - **Maximum Carbon Reduction** (60% Carbon Abatement Focus)
     - **Maximum Economic Value** (60% Feedstock Revenue & Byproduct Margin)
     - **Minimum Transportation Cost** (60% Local Proximity & Low Miles)
     - **Maximum Waste Diversion** (40% Capacity Headroom, 30% Fit)
4. **Explainable Recommendations**: Explicitly answers *"Why is this pathway, facility, and route recommended?"* with quantitative trade-offs against competing alternatives.
5. **Model-Based Scientific Estimates**: Explicit carbon accounting traceable to **IPCC Guidelines for GHG Inventories** (First-Order Decay methane avoidance) and **GLEC Framework v3.0** freight emission factors.

---

## 🏗️ System Architecture

- **Frontend (`apps/web`)**: Next.js 16 (App Router, TypeScript, Tailwind CSS, Lucide)
- **Mapping**: MapLibre GL JS + CARTO / OpenStreetMap tiles (Zero-cost demo stack using public CARTO/OSRM services subject to provider usage limits)
- **Backend API (`apps/api`)**: Python 3.13 + FastAPI + Pydantic v2
- **Database**: Supabase PostgreSQL 17 + PostGIS spatial indexing (`GEOGRAPHY(POINT, 4326)`)
- **Routing**: OSRM API for road network routing with resilient geodesic distance fallback (estimated distance using 1.25x tortuosity assumption; not turn-by-turn road navigation)



---

## 🧪 Controlled Hackathon Benchmarks

CarbonSphere includes 3 deterministic demo scenarios demonstrating divergent pathway selection:

| Scenario | Feedstock | Optimal Pathway |
|---|---|---|
| 1 | 25 Tonnes Agricultural Biomass (14.5% moisture, 4.2% ash) | **Biochar Pyrolysis** |
| 2 | 40 Tonnes Food-Processing Sludge (82% moisture, 2.1% ash) | **Biogas Anaerobic Digestion** |
| 3 | 15 Tonnes Post-Industrial Cellulosic Fiber (9% moisture, 1.5% ash) | **Carbon-Negative Materials** |

Visit `/demo` or click **"Demo Scenarios"** in the navigation bar to run live comparisons.

---

## ⚖️ Carbon Accounting Rule & Transparency

All emissions reductions in CarbonSphere are **model-based engineering estimates** designed for circular decision intelligence. They are not presented as certified third-party carbon credits. Every metric is traceable to scientific standards detailed in `/platform/impact`.

---

## 📁 Repository Structure

```text
CarbonSphere/
├── apps/
│   ├── web/              # Next.js 16 frontend + Vercel Python API
│   │   ├── app/          # App Router pages
│   │   ├── api/          # FastAPI serverless function (Vercel)
│   │   ├── components/   # Shared UI components
│   │   ├── lib/          # API client, Supabase, types
│   │   └── requirements.txt
│   └── api/              # Standalone FastAPI backend (local dev / Render)
│       ├── app/
│       │   ├── engine/   # Optimization, carbon, economics, routing
│       │   └── schemas/
│       └── tests/
├── docs/
└── README.md
```

---

*Built for HackOut'26 — Waste-to-Carbon Value Chain Tracker*
