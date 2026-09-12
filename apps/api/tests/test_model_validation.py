import pytest
from app.schemas.domain import (
    CandidateEvaluation, OptimizationObjective, PathwayType,
    WasteStreamInput, FeedstockCategory
)
from app.engine.mcda import rank_candidates, OBJECTIVE_WEIGHTS
from app.engine.explainer import generate_explanation

def create_mock_candidate(
    facility_id: str,
    name: str,
    pathway: PathwayType = PathwayType.BIOCHAR,
    is_feasible: bool = True,
    rejection_reasons: list = None,
    distance_km: float = 30.0,
    net_carbon_impact_tco2e: float = 25.0,
    net_economic_value_inr: float = 20000.0,
    compatibility_score: float = 85.0,
    capacity_score: float = 50.0,
    byproduct_market_value_inr: float = 30000.0,
    transport_cost_inr: float = 3000.0,
    permanent_sequestration_tco2e: float = 15.0,
    avoided_fossil_displacement_tco2e: float = 0.0,
    gross_carbon_avoided_tco2e: float = 12.0,
    transport_emissions_tco2e: float = 0.1,
    duration_hrs: float = 0.7
) -> CandidateEvaluation:
    return CandidateEvaluation(
        facility_id=facility_id,
        facility_name=name,
        pathway=pathway,
        is_feasible=is_feasible,
        rejection_reasons=rejection_reasons or [],
        distance_km=distance_km,
        duration_hrs=duration_hrs,
        transport_cost_inr=transport_cost_inr,
        transport_emissions_tco2e=transport_emissions_tco2e,
        gross_carbon_avoided_tco2e=gross_carbon_avoided_tco2e,
        avoided_fossil_displacement_tco2e=avoided_fossil_displacement_tco2e,
        permanent_sequestration_tco2e=permanent_sequestration_tco2e,
        process_emissions_tco2e=0.5,
        net_carbon_impact_tco2e=net_carbon_impact_tco2e,
        gate_fee_revenue_or_cost_inr=2000.0,
        byproduct_yield_tonnes=5.0,
        byproduct_market_value_inr=byproduct_market_value_inr,
        net_economic_value_inr=net_economic_value_inr,
        carbon_score=0.0,
        economic_score=0.0,
        logistics_score=0.0,
        compatibility_score=compatibility_score,
        capacity_score=capacity_score,
        overall_score=0.0
    )

def test_tradeoff_controlled_fixture_different_objectives_produce_different_winners():
    """
    Constructs a controlled trade-off scenario between 4 distinct feasible candidates:
    - Candidate Carbon: Dominant carbon abatement (65 tCO2e), modest economics, 40 km
    - Candidate Econ: Dominant economic margin (₹95,000), modest carbon, 40 km
    - Candidate Logistics: Hyper-local transit (4 km), modest carbon & economics
    - Candidate Diversion: Maximum capacity headroom (98%) and top compatibility (98/100)
    """
    cand_carbon = create_mock_candidate(
        facility_id="fac-carbon",
        name="High Carbon Facility",
        net_carbon_impact_tco2e=65.0,
        net_economic_value_inr=15000.0,
        distance_km=40.0,
        capacity_score=40.0,
        compatibility_score=80.0
    )
    cand_econ = create_mock_candidate(
        facility_id="fac-econ",
        name="High Economic Facility",
        net_carbon_impact_tco2e=20.0,
        net_economic_value_inr=95000.0,
        distance_km=40.0,
        capacity_score=40.0,
        compatibility_score=80.0
    )
    cand_logistics = create_mock_candidate(
        facility_id="fac-logistics",
        name="Hyper-Local Logistics Facility",
        net_carbon_impact_tco2e=22.0,
        net_economic_value_inr=16000.0,
        distance_km=4.0,
        capacity_score=40.0,
        compatibility_score=80.0
    )
    cand_diversion = create_mock_candidate(
        facility_id="fac-diversion",
        name="High Capacity Diversion Facility",
        net_carbon_impact_tco2e=22.0,
        net_economic_value_inr=16000.0,
        distance_km=40.0,
        capacity_score=98.0,
        compatibility_score=98.0
    )
    
    cohort = [cand_carbon, cand_econ, cand_logistics, cand_diversion]
    
    # 1. MAX_CARBON must select cand_carbon
    ranked_carbon = rank_candidates([c.model_copy() for c in cohort], OptimizationObjective.MAX_CARBON)
    assert ranked_carbon[0].facility_id == "fac-carbon"
    
    # 2. MAX_ECONOMIC must select cand_econ
    ranked_econ = rank_candidates([c.model_copy() for c in cohort], OptimizationObjective.MAX_ECONOMIC)
    assert ranked_econ[0].facility_id == "fac-econ"
    
    # 3. MIN_LOGISTICS must select cand_logistics
    ranked_logistics = rank_candidates([c.model_copy() for c in cohort], OptimizationObjective.MIN_LOGISTICS)
    assert ranked_logistics[0].facility_id == "fac-logistics"
    
    # 4. MAX_DIVERSION must select cand_diversion
    ranked_diversion = rank_candidates([c.model_copy() for c in cohort], OptimizationObjective.MAX_DIVERSION)
    assert ranked_diversion[0].facility_id == "fac-diversion"

def test_scoring_direction_and_negative_economics():
    """
    Validates linear scoring direction across negative to positive economic values
    (e.g., tipping fees / losses vs profitable conversion).
    """
    c_loss_high = create_mock_candidate("fac-loss-high", "High Loss", net_economic_value_inr=-20000.0)
    c_loss_low = create_mock_candidate("fac-loss-low", "Low Loss", net_economic_value_inr=-5000.0)
    c_profit = create_mock_candidate("fac-profit", "Profit", net_economic_value_inr=30000.0)
    
    ranked = rank_candidates([c_loss_high, c_loss_low, c_profit], OptimizationObjective.MAX_ECONOMIC)
    
    # c_profit must have economic_score == 100.0
    # c_loss_high must have economic_score == 0.0
    # c_loss_low must have economic_score between 0 and 100, strictly higher than c_loss_high
    scores_by_id = {c.facility_id: c.economic_score for c in ranked}
    assert scores_by_id["fac-profit"] == 100.0
    assert scores_by_id["fac-loss-high"] == 0.0
    assert 0.0 < scores_by_id["fac-loss-low"] < 100.0
    assert ranked[0].facility_id == "fac-profit"
    assert ranked[1].facility_id == "fac-loss-low"
    assert ranked[2].facility_id == "fac-loss-high"

def test_feasibility_strictly_overrides_attractive_mcda_metrics():
    """
    Confirms an infeasible candidate with extreme carbon and economic metrics
    CANNOT beat a modest feasible candidate.
    """
    infeasible_superstar = create_mock_candidate(
        facility_id="fac-infeas",
        name="Infeasible Superstar",
        is_feasible=False,
        rejection_reasons=["Moisture exceeds maximum threshold (80% > 25%)"],
        net_carbon_impact_tco2e=500.0,
        net_economic_value_inr=1000000.0,
        distance_km=2.0,
        capacity_score=100.0,
        compatibility_score=0.0
    )
    modest_feasible = create_mock_candidate(
        facility_id="fac-modest",
        name="Modest Feasible Plant",
        is_feasible=True,
        net_carbon_impact_tco2e=10.0,
        net_economic_value_inr=5000.0,
        distance_km=35.0,
        capacity_score=50.0,
        compatibility_score=85.0
    )
    
    for obj in [
        OptimizationObjective.BALANCED,
        OptimizationObjective.MAX_CARBON,
        OptimizationObjective.MAX_ECONOMIC,
        OptimizationObjective.MIN_LOGISTICS,
        OptimizationObjective.MAX_DIVERSION
    ]:
        ranked = rank_candidates([infeasible_superstar.model_copy(), modest_feasible.model_copy()], obj)
        assert ranked[0].facility_id == "fac-modest"
        assert ranked[0].is_feasible is True
        assert ranked[1].facility_id == "fac-infeas"
        assert ranked[1].overall_score == 0.0

def test_engine_determinism_across_multiple_iterations():
    """
    Verifies that ranking, scores, and explanations are 100% deterministic across 20 iterations.
    """
    c1 = create_mock_candidate("fac-1", "Plant 1", net_carbon_impact_tco2e=30.0, distance_km=25.0)
    c2 = create_mock_candidate("fac-2", "Plant 2", net_carbon_impact_tco2e=35.0, distance_km=45.0)
    c3 = create_mock_candidate("fac-3", "Plant 3", net_carbon_impact_tco2e=20.0, distance_km=10.0)
    
    waste = WasteStreamInput(
        title="Test Input",
        generator_name="Gen",
        waste_type="Bagasse",
        feedstock_category=FeedstockCategory.CROP_RESIDUE,
        quantity_tonnes=20.0,
        moisture_pct=15.0,
        contamination_pct=1.0,
        location_name="Pune",
        latitude=18.5,
        longitude=74.0
    )
    
    first_order = None
    first_summary = None
    
    for _ in range(20):
        cohort = [c1.model_copy(), c2.model_copy(), c3.model_copy()]
        ranked = rank_candidates(cohort, OptimizationObjective.BALANCED)
        order = [c.facility_id for c in ranked]
        scores = [c.overall_score for c in ranked]
        summary, details, disclaimer = generate_explanation(waste, ranked[0], ranked, OptimizationObjective.BALANCED)
        
        if first_order is None:
            first_order = (order, scores)
            first_summary = summary
        else:
            assert (order, scores) == first_order
            assert summary == first_summary

def test_explainability_faithfulness_to_objective_drivers():
    """
    Verifies that generated explanation reflects the true underlying driver
    for each objective without attributing results to irrelevant factors.
    """
    waste = WasteStreamInput(
        title="Straw",
        generator_name="Farm",
        waste_type="Wheat Straw",
        feedstock_category=FeedstockCategory.CROP_RESIDUE,
        quantity_tonnes=20.0,
        moisture_pct=14.0,
        contamination_pct=1.5,
        location_name="Nashik",
        latitude=20.0,
        longitude=74.0
    )
    
    winner = create_mock_candidate(
        facility_id="fac-w",
        name="Nashik Pyrolysis Hub",
        pathway=PathwayType.BIOCHAR,
        permanent_sequestration_tco2e=18.5,
        avoided_fossil_displacement_tco2e=0.0,
        gross_carbon_avoided_tco2e=22.0,
        transport_emissions_tco2e=0.08,
        net_carbon_impact_tco2e=40.42,
        net_economic_value_inr=32000.0,
        byproduct_market_value_inr=45000.0,
        distance_km=12.5,
        duration_hrs=0.35,
        transport_cost_inr=1800.0,
        capacity_score=85.0,
        compatibility_score=95.0
    )
    
    # Carbon objective
    _, details_carbon, _ = generate_explanation(waste, winner, [winner], OptimizationObjective.MAX_CARBON)
    assert any("Permanent biogenic sequestration" in d for d in details_carbon)
    
    # Economic objective
    _, details_econ, _ = generate_explanation(waste, winner, [winner], OptimizationObjective.MAX_ECONOMIC)
    assert any("Byproduct market value" in d for d in details_econ)
    
    # Logistics objective
    _, details_logistics, _ = generate_explanation(waste, winner, [winner], OptimizationObjective.MIN_LOGISTICS)
    assert any("12.5 km away" in d for d in details_logistics)
    
    # Diversion objective
    _, details_diversion, _ = generate_explanation(waste, winner, [winner], OptimizationObjective.MAX_DIVERSION)
    assert any("capacity" in d.lower() and "85%" in d for d in details_diversion)
