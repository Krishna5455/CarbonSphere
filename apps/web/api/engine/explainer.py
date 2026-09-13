from typing import List, Tuple
from ..schemas.domain import WasteStreamInput, CandidateEvaluation, OptimizationObjective

def generate_explanation(
    waste: WasteStreamInput,
    winner: CandidateEvaluation,
    ranked: List[CandidateEvaluation],
    objective: OptimizationObjective
) -> Tuple[str, List[str], str]:
    """
    Synthesizes explicit, rule-traceable explanations for the recommended decision.
    """
    pathway_title = winner.pathway.value.replace("_", " ").title()
    
    if not winner.is_feasible:
        summary = (
            f"No strictly feasible facility was identified for this feedstock stream. "
            f"Highest partial compatibility facility: {winner.facility_name} ({pathway_title}). "
            f"Rejection factors: {'; '.join(winner.rejection_reasons)}."
        )
    else:
        summary = (
            f"{winner.facility_name} ({pathway_title}) is recommended under the "
            f"'{objective.value.replace('_', ' ').title()}' objective. It delivers {winner.net_carbon_impact_tco2e:.1f} tCO2e "
            f"net carbon abatement and ₹{winner.net_economic_value_inr:,.0f} net circular value over a {winner.distance_km:.1f} km transit route."
        )
    
    details: List[str] = []
    
    # 1. Technical chemistry compatibility
    if winner.pathway.value == "biochar":
        details.append(
            f"Feedstock moisture of {waste.moisture_pct:.1f}% is well within the pyrolysis window (<25%), "
            f"requiring minimal thermal pre-drying and maximizing fixed recalcitrant biocarbon yield."
        )
    elif winner.pathway.value == "biogas":
        details.append(
            f"High organic moisture ({waste.moisture_pct:.1f}%) and optimal C:N ratio make this feedstock ideal for "
            f"rapid anaerobic digestion, capturing methane to displace fossil natural gas and avoiding landfill decay."
        )
    elif winner.pathway.value == "carbon_materials":
        details.append(
            f"Low contamination rate ({waste.contamination_pct:.1f}%) and structural fiber integrity allow high-yield "
            f"conversion into carbon-negative bio-composites, displacing fossil polymers and cement clinker materials."
        )
        
    # 2. Objective alignment
    if objective == OptimizationObjective.MAX_CARBON:
        if winner.permanent_sequestration_tco2e > 0:
            carbon_driver = f"Permanent biogenic sequestration ({winner.permanent_sequestration_tco2e:.1f} tCO2e) and avoided burning ({winner.gross_carbon_avoided_tco2e:.1f} tCO2e)"
        elif winner.avoided_fossil_displacement_tco2e > 0:
            carbon_driver = f"Avoided fossil fuel/material displacement ({winner.avoided_fossil_displacement_tco2e:.1f} tCO2e) and landfill methane avoidance ({winner.gross_carbon_avoided_tco2e:.1f} tCO2e)"
        else:
            carbon_driver = f"Avoided decomposition emissions ({winner.gross_carbon_avoided_tco2e:.1f} tCO2e)"
            
        details.append(
            f"Carbon prioritization achieved highest ranking: {carbon_driver} "
            f"substantially outweighs transport logistics emissions ({winner.transport_emissions_tco2e:.2f} tCO2e)."
        )
    elif objective == OptimizationObjective.MAX_ECONOMIC:
        details.append(
            f"Economic prioritization achieved highest ranking: Byproduct market value (₹{winner.byproduct_market_value_inr:,.0f}) "
            f"and feedstock transaction balance provide superior commercial margin."
        )
    elif objective == OptimizationObjective.MIN_LOGISTICS:
        details.append(
            f"Logistics minimization achieved highest ranking: Located {winner.distance_km:.1f} km away with "
            f"transit duration of {winner.duration_hrs:.1f} hrs and freight cost of ₹{winner.transport_cost_inr:,.0f}."
        )
    elif objective == OptimizationObjective.MAX_DIVERSION:
        details.append(
            f"Waste diversion prioritization achieved highest ranking: Maximizes available facility processing capacity "
            f"({winner.capacity_score:.0f}% headroom) and high technical compatibility ({winner.compatibility_score:.0f}/100)."
        )
    else:
        details.append(
            f"Balanced scoring harmonizes high carbon removal ({winner.net_carbon_impact_tco2e:.1f} tCO2e), "
            f"favorable circular economics (₹{winner.net_economic_value_inr:,.0f}), and controlled logistics distance ({winner.distance_km:.1f} km)."
        )
        
    # 3. Alternatives trade-off analysis
    runner_up = next((c for c in ranked if c.facility_id != winner.facility_id and c.is_feasible), None)
    if runner_up:
        diff_carbon = winner.net_carbon_impact_tco2e - runner_up.net_carbon_impact_tco2e
        diff_econ = winner.net_economic_value_inr - runner_up.net_economic_value_inr
        diff_dist = winner.distance_km - runner_up.distance_km
        
        trade_off_note = (
            f"Compared to runner-up {runner_up.facility_name} ({runner_up.pathway.value}): "
            f"{'+' if diff_carbon >= 0 else ''}{diff_carbon:.1f} tCO2e carbon balance, "
            f"{'+' if diff_econ >= 0 else ''}₹{diff_econ:,.0f} economic margin, "
            f"{'+' if diff_dist >= 0 else ''}{diff_dist:.1f} km transit distance."
        )
        details.append(trade_off_note)

    # 4. Mandatory carbon accounting rule disclaimer
    disclaimer = (
        "MODEL-BASED ESTIMATE: Carbon impact calculations are transparent engineering estimates based on "
        "IPCC First Order Decay methodology and GLEC freight emission factors. They are provided for decision intelligence "
        "and circular pathway optimization, and must not be treated as audited or certified third-party carbon credits."
    )
    
    return summary, details, disclaimer
