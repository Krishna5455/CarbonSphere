from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from .schemas.domain import (
    WasteStreamInput, OptimizationResult,
    OptimizationObjective, DemoScenario
)
from .engine.optimizer import optimize_pathway, fetch_facilities
from .engine.routing import get_route
from .engine.scenarios import DEMO_SCENARIOS
from .db import get_supabase

app = FastAPI(
    title="CarbonSphere API",
    description="Carbon-Aware Waste Pathway Optimization Platform Engine",
    version="1.0.0"
)

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CarbonSphere Optimization Engine",
        "version": "1.0.0"
    }

@app.get("/api/scenarios", response_model=List[DemoScenario])
def list_demo_scenarios():
    """Returns curated benchmark demo scenarios for instant evaluation."""
    return DEMO_SCENARIOS

@app.get("/api/facilities")
async def get_facilities(pathway: Optional[str] = None):
    """Retrieves conversion facilities from the network."""
    all_facilities = await fetch_facilities()
    if pathway:
        all_facilities = [f for f in all_facilities if f.get("pathway") == pathway]
    return all_facilities

@app.post("/api/waste")
async def register_waste_stream(waste: WasteStreamInput):
    """Registers a new waste stream in Supabase."""
    try:
        supabase = get_supabase()
        data = {
            "title": waste.title,
            "generator_name": waste.generator_name,
            "waste_type": waste.waste_type,
            "quantity_tonnes": waste.quantity_tonnes,
            "moisture_pct": waste.moisture_pct,
            "ash_pct": waste.ash_pct,
            "carbon_nitrogen_ratio": waste.carbon_nitrogen_ratio,
            "energy_density_mj_kg": waste.energy_density_mj_kg,
            "contamination_pct": waste.contamination_pct,
            "location_name": waste.location_name,
            "latitude": waste.latitude,
            "longitude": waste.longitude,
            "location_point": f"SRID=4326;POINT({waste.longitude} {waste.latitude})",
            "status": "draft"
        }
        res = supabase.table("waste_streams").insert(data).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as e:
        print(f"Notice: waste stream insertion fallback: {e}")
        
    return {
        "id": "ws-local-mock",
        **waste.model_dump(),
        "status": "draft"
    }

@app.get("/api/waste")
async def list_waste_streams():
    """Lists registered waste streams."""
    try:
        supabase = get_supabase()
        res = supabase.table("waste_streams").select("*").order("created_at", desc=True).limit(20).execute()
        if res.data:
            return res.data
    except Exception as e:
        print(f"Notice: waste stream fetch fallback: {e}")
    return []

@app.post("/api/analyze", response_model=OptimizationResult)
async def analyze_waste(
    waste: WasteStreamInput,
    objective: OptimizationObjective = OptimizationObjective.BALANCED
):
    """
    Main Carbon Pathway Optimization Engine:
    Validates feedstock, models carbon, calculates logistics and circular economics,
    runs MCDA ranking, and generates explainable recommendations.
    """
    result = await optimize_pathway(waste=waste, objective=objective)
    
    # Store run record in database if Supabase is connected
    try:
        supabase = get_supabase()
        run_record = {
            "objective": objective.value,
            "recommended_facility_id": result.recommended_facility_id if len(result.recommended_facility_id) > 20 else None,
            "recommended_pathway": result.recommended_pathway.value,
            "net_carbon_impact_tco2e": result.net_carbon_impact_tco2e,
            "gross_carbon_avoided_tco2e": result.gross_carbon_avoided_tco2e,
            "transport_emissions_tco2e": result.transport_emissions_tco2e,
            "net_economic_value_inr": result.net_economic_value_inr,
            "transport_cost_inr": result.transport_cost_inr,
            "total_distance_km": result.total_distance_km,
            "estimated_duration_hrs": result.estimated_duration_hrs,
            "route_geometry": result.route_geometry.model_dump(),
            "explanation_summary": result.why_recommended,
            "explanation_details": result.detailed_explanation,
            "ranked_alternatives": [c.model_dump() for c in result.ranked_candidates]
        }
        supabase.table("optimization_runs").insert(run_record).execute()
    except Exception as e:
        print(f"Notice: optimization run DB persist fallback: {e}")

    return result

@app.get("/api/route")
@app.post("/api/route")
async def calculate_route(
    origin_lat: float = Query(..., ge=-90.0, le=90.0),
    origin_lon: float = Query(..., ge=-180.0, le=180.0),
    dest_lat: float = Query(..., ge=-90.0, le=90.0),
    dest_lon: float = Query(..., ge=-180.0, le=180.0)
):
    """Calculates route distance, duration, and GeoJSON geometry with coordinate validation."""
    return await get_route(origin_lat, origin_lon, dest_lat, dest_lon)
