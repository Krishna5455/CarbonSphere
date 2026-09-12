from typing import List, Dict
from ..schemas.domain import OptimizationObjective, CandidateEvaluation

OBJECTIVE_WEIGHTS: Dict[OptimizationObjective, Dict[str, float]] = {
    OptimizationObjective.BALANCED: {
        "carbon": 0.30,
        "economic": 0.25,
        "logistics": 0.20,
        "compatibility": 0.15,
        "capacity": 0.10,
    },
    OptimizationObjective.MAX_CARBON: {
        "carbon": 0.60,
        "economic": 0.10,
        "logistics": 0.15,
        "compatibility": 0.15,
        "capacity": 0.00,
    },
    OptimizationObjective.MAX_ECONOMIC: {
        "carbon": 0.10,
        "economic": 0.60,
        "logistics": 0.20,
        "compatibility": 0.10,
        "capacity": 0.00,
    },
    OptimizationObjective.MIN_LOGISTICS: {
        "carbon": 0.10,
        "economic": 0.20,
        "logistics": 0.60,
        "compatibility": 0.10,
        "capacity": 0.00,
    },
    OptimizationObjective.MAX_DIVERSION: {
        "carbon": 0.15,
        "economic": 0.15,
        "logistics": 0.00,
        "compatibility": 0.30,
        "capacity": 0.40,
    },
}

def rank_candidates(
    candidates: List[CandidateEvaluation],
    objective: OptimizationObjective
) -> List[CandidateEvaluation]:
    """
    Normalizes candidate metrics across the cohort and scores them using
    the selected objective weighting profile.
    
    Normalization Policy:
    When a metric has zero differentiation across all feasible candidates (X_max == X_min),
    the normalized score is deterministically assigned a full baseline of 100.0,
    ensuring mathematical neutrality without penalizing a single feasible candidate or uniform cohort.
    """
    if not candidates:
        return []

    weights = OBJECTIVE_WEIGHTS.get(objective, OBJECTIVE_WEIGHTS[OptimizationObjective.BALANCED])
    
    # Extract feasible candidates for normalization bounds
    feasible = [c for c in candidates if c.is_feasible]
    if not feasible:
        # If none are strictly feasible, return all ranked by compatibility
        for c in candidates:
            c.overall_score = c.compatibility_score * 0.5
        return sorted(candidates, key=lambda x: x.overall_score, reverse=True)

    max_carbon = max(c.net_carbon_impact_tco2e for c in feasible)
    min_carbon = min(c.net_carbon_impact_tco2e for c in feasible)
    
    max_econ = max(c.net_economic_value_inr for c in feasible)
    min_econ = min(c.net_economic_value_inr for c in feasible)
    
    max_dist = max(c.distance_km for c in feasible)
    min_dist = min(c.distance_km for c in feasible)

    for c in candidates:
        if not c.is_feasible:
            c.carbon_score = 0.0
            c.economic_score = 0.0
            c.logistics_score = 0.0
            c.capacity_score = 0.0
            c.overall_score = 0.0
            continue

        # 1. Carbon Score (0 - 100)
        if max_carbon == min_carbon:
            c.carbon_score = 100.0
        else:
            c.carbon_score = round(max(0.0, min(100.0, ((c.net_carbon_impact_tco2e - min_carbon) / (max_carbon - min_carbon + 1e-6)) * 100.0)), 1)
            
        # 2. Economic Score (0 - 100)
        if max_econ == min_econ:
            c.economic_score = 100.0
        else:
            c.economic_score = round(max(0.0, min(100.0, ((c.net_economic_value_inr - min_econ) / (max_econ - min_econ + 1e-6)) * 100.0)), 1)
            
        # 3. Logistics Score (Lower distance -> Higher score)
        if max_dist == min_dist:
            c.logistics_score = 100.0
        else:
            c.logistics_score = round(max(0.0, min(100.0, ((max_dist - c.distance_km) / (max_dist - min_dist + 1e-6)) * 100.0)), 1)
            
        # 4. Capacity Headroom Score
        # (Already scaled 0 - 100 in candidate prep)
        
        # 5. Composite Score
        composite = (
            weights["carbon"] * c.carbon_score +
            weights["economic"] * c.economic_score +
            weights["logistics"] * c.logistics_score +
            weights["compatibility"] * c.compatibility_score +
            weights["capacity"] * c.capacity_score
        )
        c.overall_score = round(composite, 1)

    # Deterministic multi-factor tie breaking:
    # 1. Feasibility (True > False)
    # 2. Overall composite score (Descending)
    # 3. Feedstock technical compatibility score (Descending)
    # 4. Logistics transit distance (Ascending -> negative for reverse sort)
    # 5. Stable facility ID (Ascending)
    return sorted(
        candidates,
        key=lambda x: (x.is_feasible, x.overall_score, x.compatibility_score, -x.distance_km, x.facility_id),
        reverse=True
    )
