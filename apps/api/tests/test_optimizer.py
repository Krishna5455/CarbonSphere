import pytest
import asyncio
from app.schemas.domain import WasteStreamInput, OptimizationObjective, PathwayType, FeedstockCategory, CandidateEvaluation
from app.engine.feasibility import evaluate_feasibility, resolve_feedstock_category
from app.engine.carbon import calculate_carbon_metrics
from app.engine.economics import calculate_economic_metrics
from app.engine.optimizer import optimize_pathway
from app.engine.scenarios import DEMO_SCENARIOS
from app.engine.mcda import rank_candidates

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
        feedstock_category=FeedstockCategory.FOOD_SLURRY,
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
        feedstock_category=FeedstockCategory.CROP_RESIDUE,
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

def test_carbon_accounting_math_biochar():
    waste = WasteStreamInput(
        title="Agri Biomass",
        generator_name="Agri Coop",
        waste_type="Stalks",
        feedstock_category=FeedstockCategory.CROP_RESIDUE,
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
    assert metrics["avoided_fossil_displacement_tco2e"] == 0.0
    assert metrics["net_carbon_impact_tco2e"] > 30.0

def test_carbon_accounting_math_biogas_fossil_displacement():
    """
    Verifies that biogas/CBG fossil displacement is reported as
    avoided_fossil_displacement_tco2e and NOT permanent_sequestration_tco2e.
    """
    waste = WasteStreamInput(
        title="Food Processing Slurry",
        generator_name="Pvt Processing",
        waste_type="Slurry",
        feedstock_category=FeedstockCategory.FOOD_SLURRY,
        quantity_tonnes=30.0,
        moisture_pct=82.0,
        contamination_pct=2.0,
        location_name="Bhosari",
        latitude=18.628,
        longitude=73.835
    )
    facility = {
        "pathway": PathwayType.BIOGAS,
        "process_emission_factor": 0.030,
        "byproduct_yield_factor": 0.08
    }
    metrics = calculate_carbon_metrics(waste, facility, distance_km=20.0)
    
    assert metrics["avoided_fossil_displacement_tco2e"] > 0.0
    assert metrics["permanent_sequestration_tco2e"] == 0.0
    # Net carbon = gross_avoided + fossil_displacement + permanent_sequestration - process - transport
    expected_net = (
        metrics["gross_carbon_avoided_tco2e"] +
        metrics["avoided_fossil_displacement_tco2e"] +
        metrics["permanent_sequestration_tco2e"] -
        metrics["process_emissions_tco2e"] -
        metrics["transport_emissions_tco2e"]
    )
    assert metrics["net_carbon_impact_tco2e"] == pytest.approx(expected_net, rel=1e-3)

def test_mcda_single_candidate_normalization():
    """
    Test that when there is only one feasible candidate (X_max == X_min),
    the normalization deterministically assigns full baseline scores of 100.0.
    """
    candidate = CandidateEvaluation(
        facility_id="fac-1",
        facility_name="Single Fac",
        pathway=PathwayType.BIOCHAR,
        distance_km=25.0,
        is_feasible=True,
        feasibility_reasons=["Passed"],
        compatibility_score=95.0,
        transport_cost_inr=5000.0,
        processing_fee_inr=3000.0,
        byproduct_value_inr=15000.0,
        net_economic_value_inr=7000.0,
        transport_emissions_tco2e=0.1,
        process_emissions_tco2e=0.5,
        gross_carbon_avoided_tco2e=25.0,
        avoided_fossil_displacement_tco2e=0.0,
        permanent_sequestration_tco2e=14.0,
        net_carbon_impact_tco2e=38.4,
        available_capacity_tonnes=40.0,
        capacity_headroom_pct=80.0
    )
    ranked = rank_candidates([candidate], OptimizationObjective.BALANCED)
    assert len(ranked) == 1
    assert ranked[0].carbon_score == 100.0
    assert ranked[0].economic_score == 100.0
    assert ranked[0].logistics_score == 100.0
    assert ranked[0].overall_score > 0.0

def test_mcda_identical_metrics_normalization():
    """
    Test that when multiple feasible candidates have identical carbon, economic, and distance metrics,
    they all receive 100.0 on those normalized criteria.
    """
    c1 = CandidateEvaluation(
        facility_id="fac-1",
        facility_name="Fac 1",
        pathway=PathwayType.BIOCHAR,
        distance_km=20.0,
        is_feasible=True,
        feasibility_reasons=["Passed"],
        compatibility_score=90.0,
        transport_cost_inr=4000.0,
        processing_fee_inr=2000.0,
        byproduct_value_inr=10000.0,
        net_economic_value_inr=4000.0,
        transport_emissions_tco2e=0.1,
        process_emissions_tco2e=0.4,
        gross_carbon_avoided_tco2e=20.0,
        avoided_fossil_displacement_tco2e=0.0,
        permanent_sequestration_tco2e=10.0,
        net_carbon_impact_tco2e=29.5,
        available_capacity_tonnes=50.0,
        capacity_headroom_pct=75.0
    )
    c2 = CandidateEvaluation(
        facility_id="fac-2",
        facility_name="Fac 2",
        pathway=PathwayType.BIOCHAR,
        distance_km=20.0,
        is_feasible=True,
        feasibility_reasons=["Passed"],
        compatibility_score=90.0,
        transport_cost_inr=4000.0,
        processing_fee_inr=2000.0,
        byproduct_value_inr=10000.0,
        net_economic_value_inr=4000.0,
        transport_emissions_tco2e=0.1,
        process_emissions_tco2e=0.4,
        gross_carbon_avoided_tco2e=20.0,
        avoided_fossil_displacement_tco2e=0.0,
        permanent_sequestration_tco2e=10.0,
        net_carbon_impact_tco2e=29.5,
        available_capacity_tonnes=50.0,
        capacity_headroom_pct=75.0
    )
    ranked = rank_candidates([c1, c2], OptimizationObjective.BALANCED)
    assert ranked[0].carbon_score == 100.0
    assert ranked[1].carbon_score == 100.0
    assert ranked[0].economic_score == 100.0
    assert ranked[1].economic_score == 100.0
    assert ranked[0].logistics_score == 100.0
    assert ranked[1].logistics_score == 100.0

def test_feedstock_taxonomy_resolution():
    """
    Test that various agricultural biomass descriptions resolve to FeedstockCategory.CROP_RESIDUE
    and pass feasibility without relying on fragile substring checks.
    """
    test_cases = [
        ("agricultural biomass", FeedstockCategory.CROP_RESIDUE),
        ("paddy straw", FeedstockCategory.CROP_RESIDUE),
        ("wheat stalk", FeedstockCategory.CROP_RESIDUE),
        ("bagasse", FeedstockCategory.CROP_RESIDUE),
        ("spent sugarcane bagasse", FeedstockCategory.CROP_RESIDUE),
        ("food processing slurry", FeedstockCategory.FOOD_SLURRY),
        ("wet organic sludge", FeedstockCategory.FOOD_SLURRY),
        ("sorted cotton fiber waste", FeedstockCategory.SORTED_CELLULOSE),
        ("post-industrial cellulose scrap", FeedstockCategory.SORTED_CELLULOSE),
        ("unknown municipal rubbish", FeedstockCategory.OTHER),
    ]
    for waste_text, expected_cat in test_cases:
        assert resolve_feedstock_category(waste_text) == expected_cat

def test_feedstock_taxonomy_biochar_compatibility():
    biochar_facility = {
        "pathway": PathwayType.BIOCHAR,
        "capacity_daily_tonnes": 100.0,
        "current_load_tonnes": 20.0,
        "min_moisture_pct": 5.0,
        "max_moisture_pct": 30.0,
        "max_contamination_pct": 8.0
    }
    for ag_name in ["Paddy Straw", "Wheat Stalk", "Bagasse Residue", "Agricultural Biomass"]:
        w = WasteStreamInput(
            title=ag_name,
            generator_name="Farmer Group",
            waste_type=ag_name,
            quantity_tonnes=20.0,
            moisture_pct=15.0,
            contamination_pct=2.0,
            location_name="Field",
            latitude=18.0,
            longitude=74.0
        )
        is_feas, reasons, score = evaluate_feasibility(w, biochar_facility)
        assert is_feas, f"Failed for {ag_name}: {reasons}"
        assert score >= 90.0

@pytest.mark.asyncio
async def test_demo_scenarios_produce_different_pathways_and_non_zero_distance():
    # 1. Agricultural Biomass Scenario -> Biochar
    agri_scenario = DEMO_SCENARIOS[0]
    res_agri = await optimize_pathway(agri_scenario.waste_input, OptimizationObjective.BALANCED)
    assert res_agri.recommended_pathway == PathwayType.BIOCHAR
    assert res_agri.total_distance_km >= 10.0
    assert res_agri.permanent_sequestration_tco2e > 0.0
    assert res_agri.avoided_fossil_displacement_tco2e == 0.0
    
    # 2. Food Processing Wet Waste Scenario -> Biogas
    food_scenario = DEMO_SCENARIOS[1]
    res_food = await optimize_pathway(food_scenario.waste_input, OptimizationObjective.BALANCED)
    assert res_food.recommended_pathway == PathwayType.BIOGAS
    assert res_food.total_distance_km >= 10.0
    assert res_food.avoided_fossil_displacement_tco2e > 0.0
    assert res_food.permanent_sequestration_tco2e == 0.0
    
    # 3. Clean Sorted Fibrous Scrap Scenario -> Carbon Materials
    fiber_scenario = DEMO_SCENARIOS[2]
    res_fiber = await optimize_pathway(fiber_scenario.waste_input, OptimizationObjective.BALANCED)
    assert res_fiber.recommended_pathway == PathwayType.CARBON_MATERIALS
    assert res_fiber.total_distance_km >= 10.0

@pytest.mark.asyncio
async def test_objective_weighting_differentiation():
    """
    Verify changing objectives produces different rankings when data supports it.
    """
    waste = WasteStreamInput(
        title="Custom Agri Stream",
        generator_name="Test Generator",
        waste_type="paddy straw",
        feedstock_category=FeedstockCategory.CROP_RESIDUE,
        quantity_tonnes=20.0,
        moisture_pct=15.0,
        contamination_pct=2.0,
        location_name="Pune East",
        latitude=18.52,
        longitude=74.00
    )
    res_carbon = await optimize_pathway(waste, OptimizationObjective.MAX_CARBON)
    res_econ = await optimize_pathway(waste, OptimizationObjective.MAX_ECONOMIC)
    assert res_carbon.recommended_facility_id is not None
    assert res_econ.recommended_facility_id is not None
