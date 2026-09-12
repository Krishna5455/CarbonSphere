import asyncio
from typing import List, Dict, Any, Optional
from ..schemas.domain import (
    WasteStreamInput, OptimizationObjective, OptimizationResult,
    CandidateEvaluation, PathwayType, RouteGeometry
)
from .feasibility import evaluate_feasibility
from .carbon import calculate_carbon_metrics
from .economics import calculate_economic_metrics
from .routing import get_route
from .mcda import rank_candidates, OBJECTIVE_WEIGHTS
from .explainer import generate_explanation
from ..db import get_supabase

async def fetch_facilities() -> List[Dict[str, Any]]:
    """
    Fetches facilities from Supabase, or falls back to standard regional fixtures.
    """
    try:
        supabase = get_supabase()
        res = supabase.table("facilities").select("*").execute()
        if res.data and len(res.data) > 0:
            return res.data
    except Exception as e:
        print(f"Notice: Supabase fetch fallback: {e}")
        
    # Standard fallback facility network fixtures (Maharashtra & Karnataka corridor)
    return [
        {
            "id": "fac-biochar-1",
            "name": "Sahyadri Biochar & Pyrolysis Hub",
            "operator": "Sahyadri Agri-Energy Ltd",
            "pathway": "biochar",
            "capacity_daily_tonnes": 60.0,
            "current_load_tonnes": 20.0,
            "min_moisture_pct": 5.0,
            "max_moisture_pct": 25.0,
            "max_contamination_pct": 8.0,
            "gate_fee_per_tonne": 500.0,
            "process_emission_factor": 0.0450,
            "byproduct_yield_factor": 0.3200,
            "byproduct_market_price": 22000.0,
            "location_name": "Baramati, Pune",
            "latitude": 18.1519,
            "longitude": 74.5771
        },
        {
            "id": "fac-biochar-2",
            "name": "Godavari Agro-Carbon Pyrolysis Works",
            "operator": "Godavari Green Ventures",
            "pathway": "biochar",
            "capacity_daily_tonnes": 45.0,
            "current_load_tonnes": 15.0,
            "min_moisture_pct": 5.0,
            "max_moisture_pct": 22.0,
            "max_contamination_pct": 6.0,
            "gate_fee_per_tonne": 400.0,
            "process_emission_factor": 0.0420,
            "byproduct_yield_factor": 0.3000,
            "byproduct_market_price": 21500.0,
            "location_name": "Niphad, Nashik",
            "latitude": 20.0760,
            "longitude": 74.1080
        },
        {
            "id": "fac-biogas-1",
            "name": "Indrayani Clean Gas & CBG Refinery",
            "operator": "Indrayani Bio-Fuels Corp",
            "pathway": "biogas",
            "capacity_daily_tonnes": 100.0,
            "current_load_tonnes": 45.0,
            "min_moisture_pct": 65.0,
            "max_moisture_pct": 95.0,
            "max_contamination_pct": 5.0,
            "gate_fee_per_tonne": -200.0,
            "process_emission_factor": 0.0250,
            "byproduct_yield_factor": 0.0650,
            "byproduct_market_price": 54000.0,
            "location_name": "Chakan Industrial Area, Pune",
            "latitude": 18.7597,
            "longitude": 73.8580
        },
        {
            "id": "fac-biogas-2",
            "name": "Pravara Bio-Methane Energy Plant",
            "operator": "Pravara Renewable Power",
            "pathway": "biogas",
            "capacity_daily_tonnes": 80.0,
            "current_load_tonnes": 30.0,
            "min_moisture_pct": 60.0,
            "max_moisture_pct": 92.0,
            "max_contamination_pct": 6.0,
            "gate_fee_per_tonne": -150.0,
            "process_emission_factor": 0.0280,
            "byproduct_yield_factor": 0.0600,
            "byproduct_market_price": 52000.0,
            "location_name": "Rahata, Ahmednagar",
            "latitude": 19.6175,
            "longitude": 74.4780
        },
        {
            "id": "fac-materials-1",
            "name": "Western Ghats Bio-Composite Materials",
            "operator": "Sahyadri Composites Ltd",
            "pathway": "carbon_materials",
            "capacity_daily_tonnes": 40.0,
            "current_load_tonnes": 15.0,
            "min_moisture_pct": 0.0,
            "max_moisture_pct": 15.0,
            "max_contamination_pct": 3.0,
            "gate_fee_per_tonne": 750.0,
            "process_emission_factor": 0.0550,
            "byproduct_yield_factor": 0.6500,
            "byproduct_market_price": 34000.0,
            "location_name": "Shirwal MIDC, Satara",
            "latitude": 18.1360,
            "longitude": 73.9850
        },
        {
            "id": "fac-materials-2",
            "name": "EcoCem Circular Aggregate Works",
            "operator": "EcoCem Infrastructure Solutions",
            "pathway": "carbon_materials",
            "capacity_daily_tonnes": 60.0,
            "current_load_tonnes": 20.0,
            "min_moisture_pct": 0.0,
            "max_moisture_pct": 18.0,
            "max_contamination_pct": 5.0,
            "gate_fee_per_tonne": 300.0,
            "process_emission_factor": 0.0350,
            "byproduct_yield_factor": 0.8000,
            "byproduct_market_price": 18000.0,
            "location_name": "Talegaon MIDC, Pune",
            "latitude": 18.7300,
            "longitude": 73.6800
        }
    ]

async def optimize_pathway(
    waste: WasteStreamInput,
    objective: OptimizationObjective = OptimizationObjective.BALANCED,
    waste_stream_id: Optional[str] = None
) -> OptimizationResult:
    """
    Core Carbon Pathway Optimization Engine:
    Evaluates all candidate facilities, scores them against the objective profile,
    synthesizes explainable trade-offs, and extracts the optimal route.
    """
    facilities = await fetch_facilities()
    
    # Run route lookups concurrently
    route_tasks = [
        get_route(
            origin_lat=waste.latitude, origin_lon=waste.longitude,
            dest_lat=float(f["latitude"]), dest_lon=float(f["longitude"])
        )
        for f in facilities
    ]
    routes = await asyncio.gather(*route_tasks)
    
    candidates: List[CandidateEvaluation] = []
    routes_by_id = {}
    
    for f, r in zip(facilities, routes):
        fid = str(f.get("id"))
        routes_by_id[fid] = r
        dist_km = r["distance_km"]
        dur_hrs = r["duration_hrs"]
        
        is_feasible, rejection_reasons, compat_score = evaluate_feasibility(waste, f)
        carbon_data = calculate_carbon_metrics(waste, f, dist_km)
        econ_data = calculate_economic_metrics(waste, f, dist_km)
        
        # Capacity score calculation (headroom percentage)
        daily_cap = float(f.get("capacity_daily_tonnes", 50.0))
        avail_cap = max(0.0, daily_cap - float(f.get("current_load_tonnes", 0.0)))
        cap_headroom_pct = min(100.0, (avail_cap / (daily_cap + 1e-6)) * 100.0) if is_feasible else 0.0
        
        # Drivers & trade-offs
        drivers = []
        trade_offs = []
        if is_feasible:
            drivers.append(f"Delivers {carbon_data['net_carbon_impact_tco2e']:.1f} tCO2e net carbon reduction.")
            drivers.append(f"Generates ₹{econ_data['net_economic_value_inr']:,.0f} net circular economy margin.")
            if dist_km < 40.0:
                drivers.append(f"Hyper-local transit distance of only {dist_km:.1f} km.")
            else:
                trade_offs.append(f"Incurs {dist_km:.1f} km transit logistics ({dur_hrs:.1f} hrs travel).")
        else:
            trade_offs.extend(rejection_reasons)
            
        r_source = r.get("source", "osrm")
        
        cand = CandidateEvaluation(
            facility_id=fid,
            facility_name=f["name"],
            facility_location=f.get("location_name", "Regional Facility"),
            operator=f.get("operator", "Certified Operator"),
            pathway=PathwayType(f["pathway"]),
            is_feasible=is_feasible,
            rejection_reasons=rejection_reasons,
            latitude=float(f.get("latitude", 0.0)),
            longitude=float(f.get("longitude", 0.0)),
            distance_km=dist_km,
            duration_hrs=dur_hrs,
            route_source=r_source,
            transport_cost_inr=econ_data["transport_cost_inr"],
            transport_emissions_tco2e=carbon_data["transport_emissions_tco2e"],
            gross_carbon_avoided_tco2e=carbon_data["gross_carbon_avoided_tco2e"],
            avoided_fossil_displacement_tco2e=carbon_data["avoided_fossil_displacement_tco2e"],
            permanent_sequestration_tco2e=carbon_data["permanent_sequestration_tco2e"],
            process_emissions_tco2e=carbon_data["process_emissions_tco2e"],
            net_carbon_impact_tco2e=carbon_data["net_carbon_impact_tco2e"],
            gate_fee_revenue_or_cost_inr=econ_data["gate_fee_revenue_or_cost_inr"],
            byproduct_yield_tonnes=econ_data["byproduct_yield_tonnes"],
            byproduct_market_value_inr=econ_data["byproduct_market_value_inr"],
            net_economic_value_inr=econ_data["net_economic_value_inr"],
            carbon_score=0.0,
            economic_score=0.0,
            logistics_score=0.0,
            compatibility_score=compat_score,
            capacity_score=cap_headroom_pct,
            overall_score=0.0,
            key_drivers=drivers,
            trade_offs=trade_offs
        )
        candidates.append(cand)
        
    ranked = rank_candidates(candidates, objective)
    winner = ranked[0]
    
    why_summary, detailed_expl, disclaimer = generate_explanation(waste, winner, ranked, objective)
    winning_route = routes_by_id[winner.facility_id]
    
    weights = OBJECTIVE_WEIGHTS.get(objective, OBJECTIVE_WEIGHTS[OptimizationObjective.BALANCED])
    
    return OptimizationResult(
        waste_stream_id=waste_stream_id,
        objective=objective,
        objective_weights=weights,
        recommended_facility_id=winner.facility_id,
        recommended_facility_name=winner.facility_name,
        recommended_pathway=winner.pathway,
        net_carbon_impact_tco2e=winner.net_carbon_impact_tco2e,
        gross_carbon_avoided_tco2e=winner.gross_carbon_avoided_tco2e,
        avoided_fossil_displacement_tco2e=winner.avoided_fossil_displacement_tco2e,
        permanent_sequestration_tco2e=winner.permanent_sequestration_tco2e,
        transport_emissions_tco2e=winner.transport_emissions_tco2e,
        net_economic_value_inr=winner.net_economic_value_inr,
        transport_cost_inr=winner.transport_cost_inr,
        total_distance_km=winner.distance_km,
        estimated_duration_hrs=winner.duration_hrs,
        route_source=winner.route_source,
        route_geometry=RouteGeometry(**winning_route["geometry"]),
        why_recommended=why_summary,
        detailed_explanation=detailed_expl,
        accounting_disclaimer=disclaimer,
        ranked_candidates=ranked
    )
