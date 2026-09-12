import pytest
import asyncio
from app.schemas.domain import WasteStreamInput, OptimizationObjective, PathwayType
from app.engine.feasibility import evaluate_feasibility
from app.engine.carbon import calculate_carbon_metrics
from app.engine.economics import calculate_economic_metrics
from app.engine.optimizer import optimize_pathway
from app.engine.scenarios import DEMO_SCENARIOS

def test_feasibility_biochar_rejects_high_moisture():
    facility = {
        "pathway": PathwayType.BIOCHAR,
        "capacity_daily_tonnes": 50.0,
        "current_load_tonnes": 10.0,
        "min_moisture_pct": 5.0,
        "max_moisture_pct": 25.0,
        "max_contamination_pct": 8.0
    }
    wet_waste = WasteStreamInput(
        title="Wet Waste",
        generator_name="Test Generator",
        waste_type="Wet Sludge",
        quantity_tonnes=10.0,
        moisture_pct=65.0,
        contamination_pct=2.0,
        location_name="Test Loc",
        latitude=18.0,
        longitude=74.0
    )
    is_feasible, reasons, score = evaluate_feasibility(wet_waste, facility)
    assert not is_feasible
    assert any("too high for Biochar" in r for r in reasons)
    assert score == 0.0

def test_feasibility_biogas_rejects_dry_biomass():
    facility = {
        "pathway": PathwayType.BIOGAS,
        "capacity_daily_tonnes": 80.0,
        "current_load_tonnes": 20.0,
        "min_moisture_pct": 65.0,
        "max_moisture_pct": 95.0,
        "max_contamination_pct": 6.0
    }
    dry_waste = WasteStreamInput(
        title="Dry Straw",
        generator_name="Test Farm",
        waste_type="Straw",
        quantity_tonnes=15.0,
        moisture_pct=12.0,
        contamination_pct=1.0,
        location_name="Test Loc",
        latitude=18.0,
        longitude=74.0
    )
    is_feasible, reasons, score = evaluate_feasibility(dry_waste, facility)
    assert not is_feasible
    assert any("too low for Anaerobic Digestion" in r for r in reasons)

def test_carbon_accounting_math():
    waste = WasteStreamInput(
        title="Agri Biomass",
        generator_name="Agri Coop",
        waste_type="Stalks",
        quantity_tonnes=25.0,
        moisture_pct=14.5,
        contamination_pct=1.0,
        location_name="Pune",
        latitude=18.5,
        longitude=74.0
    )
    facility = {
        "pathway": PathwayType.BIOCHAR,
        "process_emission_factor": 0.045,
        "byproduct_yield_factor": 0.32
    }
    metrics = calculate_carbon_metrics(waste, facility, distance_km=50.0)
    
    # 25t * 50km * 0.000096 = 0.12 tCO2e
    assert metrics["transport_emissions_tco2e"] == pytest.approx(0.12, abs=0.01)
    assert metrics["gross_carbon_avoided_tco2e"] > 20.0
    assert metrics["permanent_sequestration_tco2e"] > 10.0
    assert metrics["net_carbon_impact_tco2e"] > 30.0

@pytest.mark.asyncio
async def test_demo_scenarios_produce_different_pathways():
    # 1. Agricultural Biomass Scenario -> Biochar
    agri_scenario = DEMO_SCENARIOS[0]
    res_agri = await optimize_pathway(agri_scenario.waste_input, OptimizationObjective.BALANCED)
    assert res_agri.recommended_pathway == PathwayType.BIOCHAR
    
    # 2. Food Processing Wet Waste Scenario -> Biogas
    food_scenario = DEMO_SCENARIOS[1]
    res_food = await optimize_pathway(food_scenario.waste_input, OptimizationObjective.BALANCED)
    assert res_food.recommended_pathway == PathwayType.BIOGAS
    
    # 3. Clean Sorted Fibrous Scrap Scenario -> Carbon Materials
    fiber_scenario = DEMO_SCENARIOS[2]
    res_fiber = await optimize_pathway(fiber_scenario.waste_input, OptimizationObjective.BALANCED)
    assert res_fiber.recommended_pathway == PathwayType.CARBON_MATERIALS
