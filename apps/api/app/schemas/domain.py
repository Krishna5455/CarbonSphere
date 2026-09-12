from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime, timezone

class PathwayType(str, Enum):
    BIOCHAR = "biochar"
    BIOGAS = "biogas"
    CARBON_MATERIALS = "carbon_materials"

class FeedstockCategory(str, Enum):
    CROP_RESIDUE = "crop_residue"
    FOOD_SLURRY = "food_slurry"
    SORTED_CELLULOSE = "sorted_cellulose"
    OTHER = "other"

class OptimizationObjective(str, Enum):
    BALANCED = "balanced"
    MAX_CARBON = "max_carbon"
    MAX_ECONOMIC = "max_economic"
    MIN_LOGISTICS = "min_logistics"
    MAX_DIVERSION = "max_diversion"

class WasteStreamInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    generator_name: str = Field(..., min_length=1, max_length=200)
    waste_type: str = Field(..., min_length=1, max_length=200)
    feedstock_category: Optional[FeedstockCategory] = Field(default=None)
    quantity_tonnes: float = Field(..., gt=0, le=1000000.0)
    moisture_pct: float = Field(..., ge=0.0, le=100.0)
    ash_pct: float = Field(default=4.2, ge=0.0, le=100.0)
    carbon_nitrogen_ratio: Optional[float] = Field(default=45.0, ge=0.0, le=500.0)
    energy_density_mj_kg: Optional[float] = Field(default=16.8, ge=0.0, le=100.0)
    contamination_pct: float = Field(default=1.5, ge=0.0, le=100.0)
    location_name: str = Field(..., min_length=1, max_length=200)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

class FacilityResponse(BaseModel):
    id: str
    name: str
    operator: str
    pathway: PathwayType
    capacity_daily_tonnes: float
    current_load_tonnes: float
    available_capacity_tonnes: float
    min_moisture_pct: float
    max_moisture_pct: float
    max_contamination_pct: float
    gate_fee_per_tonne: float
    process_emission_factor: float
    byproduct_yield_factor: float
    byproduct_market_price: float
    location_name: str
    latitude: float
    longitude: float
    distance_km: Optional[float] = None
    duration_hrs: Optional[float] = None

class CandidateEvaluation(BaseModel):
    facility_id: str
    facility_name: str
    facility_location: str = ""
    operator: str = ""
    pathway: PathwayType
    is_feasible: bool = True
    rejection_reasons: List[str] = []
    
    # Distance and logistics
    latitude: float = 0.0
    longitude: float = 0.0
    distance_km: float = 0.0
    duration_hrs: float = 0.0
    route_source: Optional[str] = "osrm"
    transport_cost_inr: float = 0.0
    transport_emissions_tco2e: float = 0.0
    
    # Carbon metrics
    gross_carbon_avoided_tco2e: float = 0.0
    avoided_fossil_displacement_tco2e: float = 0.0
    permanent_sequestration_tco2e: float = 0.0
    process_emissions_tco2e: float = 0.0
    net_carbon_impact_tco2e: float = 0.0
    
    # Economic metrics
    gate_fee_revenue_or_cost_inr: float = 0.0
    byproduct_yield_tonnes: float = 0.0
    byproduct_market_value_inr: float = 0.0
    net_economic_value_inr: float = 0.0
    
    # Scores (0 - 100)
    carbon_score: float = 0.0
    economic_score: float = 0.0
    logistics_score: float = 0.0
    compatibility_score: float = 0.0
    capacity_score: float = 0.0
    overall_score: float = 0.0
    
    # Explainability
    key_drivers: List[str] = []
    trade_offs: List[str] = []

class RouteGeometry(BaseModel):
    type: str = "LineString"
    coordinates: List[List[float]] # [lon, lat]

class OptimizationResult(BaseModel):
    waste_stream_id: Optional[str] = None
    objective: OptimizationObjective
    objective_weights: Dict[str, float]
    
    # Selected Recommendation
    recommended_facility_id: str
    recommended_facility_name: str
    recommended_pathway: PathwayType
    
    # Summary Impact
    net_carbon_impact_tco2e: float
    gross_carbon_avoided_tco2e: float
    avoided_fossil_displacement_tco2e: float = 0.0
    permanent_sequestration_tco2e: float = 0.0
    transport_emissions_tco2e: float
    net_economic_value_inr: float
    transport_cost_inr: float
    total_distance_km: float
    estimated_duration_hrs: float
    route_source: Optional[str] = "osrm"
    
    # Route
    route_geometry: RouteGeometry
    
    # Explainability
    why_recommended: str
    detailed_explanation: List[str]
    accounting_disclaimer: str
    
    # Ranked Alternatives
    ranked_candidates: List[CandidateEvaluation]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DemoScenario(BaseModel):
    id: str
    title: str
    description: str
    waste_input: WasteStreamInput
    expected_optimal_pathway: PathwayType
