# CarbonSphere Architecture & Domain Reference

CarbonSphere is a carbon-aware waste pathway optimization platform. It couples thermodynamic feedstock characterization with multi-criteria spatial decision analysis to determine the highest-value circular destination for industrial and municipal waste streams.

---

## Repository Layout

```text
CarbonSphere/
├── apps/
│   ├── web/            # Next.js 16 frontend application (App Router, Tailwind CSS)
│   └── api/            # FastAPI Python 3.13 optimization & calculation engine
├── docs/               # Technical documentation & domain specifications
├── .env.example        # Consolidated environment variable configuration template
├── .gitignore
└── README.md           # Project overview and quick start guide
```

---

## Core Decision Pipeline

The optimization workflow follows a five-stage pipeline:

```text
Waste Input ──> Pathway Feasibility ──> Carbon & Economic Ledger ──> Spatial Logistics ──> MCDA Ranking
```

1. **Feedstock Profiling (`apps/web/app/platform/waste`)**:
   Captures quantitative characteristics: moisture content (%), ash fraction (%), contamination rate (%), C:N ratio, and coordinates.

2. **Feasibility Filtering (`apps/api/app/engine/feasibility.py`)**:
   Evaluates conversion thresholds:
   - **Biochar (Pyrolysis)**: Dry biomass (<25% moisture), low ash (<10%), low contamination (<8%).
   - **Biogas (Anaerobic Digestion)**: High moisture (60–95%), balanced C:N (15–35:1).
   - **Carbon-Negative Materials**: Clean cellulosic fiber (<15% moisture, <3% ash).

3. **Carbon Accounting (`apps/api/app/engine/carbon.py`)**:
   - Baseline Avoidance: IPCC Vol 5 First-Order Decay methane avoidance.
   - Fossil Fuel Displacement: CBG replacement of compressed fossil natural gas (2.2 kg CO₂e / kg CBG).
   - Permanent Storage: Stable recalcitrant biocarbon retention (European Biochar Certificate standard).
   - Freight & Process Emissions: GLEC Framework v3.0 (0.096 kg CO₂e / t·km).

4. **Circular Economics (`apps/api/app/engine/economics.py`)**:
   - Feedstock gate transactions (purchase credits or tipping fees).
   - End-product marketable yield and commercial byproduct revenue.
   - Highway freight transport rates (loading handling base + ton-km freight).

5. **Multi-Criteria Decision Analysis (`apps/api/app/engine/mcda.py`)**:
   Vector-normalized linear scoring across 5 weighted dimensions (Carbon Abatement, Economic Value, Logistics Distance, Feedstock Compatibility, Capacity Headroom).

---

## Map & Routing Infrastructure

CarbonSphere incorporates a zero-cost demo/development spatial visualization and routing stack using public CARTO and OSRM services subject to provider usage limits:

- **Map Rendering**: Powered by **MapLibre GL JS** (`maplibre-gl`), rendering vector tile styles client-side without proprietary map service locks or usage fees.
- **Tile & Style Provider**: Default vector tile style provided by **CARTO Dark Matter GL** (`https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`), based on **OpenStreetMap** geographic data. Configurable via `NEXT_PUBLIC_MAP_STYLE_URL`.
- **Road Network Routing**: Driven by **OSRM (Open Source Routing Machine)** for actual road network routing (distance, duration, turn-by-turn geometry). Configurable via `OSRM_ENDPOINT` (defaults to `https://router.project-osrm.org`).
- **Geodesic Fallback**: Automatic offline fallback to Haversine geodesic calculation with a $1.25\times$ highway tortuosity engineering assumption if OSRM service is unreachable or encounters an unroutable path. Geodesic fallback provides estimated distance and straight-line geometry for decision scoring; it is NOT turn-by-turn road navigation.
- **Attribution**: Explicit, legally compliant visual attribution credited to OpenStreetMap contributors, CARTO, and OSRM.

