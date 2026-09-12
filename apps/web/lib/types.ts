export type PathwayType = 'biochar' | 'biogas' | 'carbon_materials';

export type FeedstockCategory = 'crop_residue' | 'food_slurry' | 'sorted_cellulose' | 'other';

export type OptimizationObjective = 
  | 'balanced'
  | 'max_carbon'
  | 'max_economic'
  | 'min_logistics'
  | 'max_diversion';

export interface WasteStreamInput {
  title: string;
  generator_name: string;
  waste_type: string;
  feedstock_category?: FeedstockCategory;
  quantity_tonnes: number;
  moisture_pct: number;
  ash_pct: number;
  carbon_nitrogen_ratio?: number;
  energy_density_mj_kg?: number;
  contamination_pct: number;
  location_name: string;
  latitude: number;
  longitude: number;
}

export interface Facility {
  id: string;
  name: string;
  operator: string;
  pathway: PathwayType;
  capacity_daily_tonnes: number;
  current_load_tonnes: number;
  available_capacity_tonnes: number;
  min_moisture_pct: number;
  max_moisture_pct: number;
  max_contamination_pct: number;
  gate_fee_per_tonne: number;
  process_emission_factor: number;
  byproduct_yield_factor: number;
  byproduct_market_price: number;
  location_name: string;
  latitude: number;
  longitude: number;
}

export interface CandidateEvaluation {
  facility_id: string;
  facility_name: string;
  facility_location: string;
  operator: string;
  pathway: PathwayType;
  is_feasible: boolean;
  rejection_reasons: string[];
  
  distance_km: number;
  duration_hrs: number;
  route_source?: string;
  latitude?: number;
  longitude?: number;
  transport_cost_inr: number;
  transport_emissions_tco2e: number;
  
  gross_carbon_avoided_tco2e: number;
  avoided_fossil_displacement_tco2e: number;
  permanent_sequestration_tco2e: number;
  process_emissions_tco2e: number;
  net_carbon_impact_tco2e: number;
  
  gate_fee_revenue_or_cost_inr: number;
  byproduct_yield_tonnes: number;
  byproduct_market_value_inr: number;
  net_economic_value_inr: number;
  
  carbon_score: number;
  economic_score: number;
  logistics_score: number;
  compatibility_score: number;
  capacity_score: number;
  overall_score: number;
  
  key_drivers: string[];
  trade_offs: string[];
}

export interface RouteGeometry {
  type: string;
  coordinates: [number, number][]; // [lon, lat]
}

export interface OptimizationResult {
  waste_stream_id?: string;
  objective: OptimizationObjective;
  objective_weights: Record<string, number>;
  
  recommended_facility_id: string;
  recommended_facility_name: string;
  recommended_pathway: PathwayType;
  
  net_carbon_impact_tco2e: number;
  gross_carbon_avoided_tco2e: number;
  avoided_fossil_displacement_tco2e: number;
  permanent_sequestration_tco2e: number;
  transport_emissions_tco2e: number;
  net_economic_value_inr: number;
  transport_cost_inr: number;
  total_distance_km: number;
  estimated_duration_hrs: number;
  route_source?: string;
  
  route_geometry: RouteGeometry;
  
  why_recommended: string;
  detailed_explanation: string[];
  accounting_disclaimer: string;
  
  ranked_candidates: CandidateEvaluation[];
  created_at: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  waste_input: WasteStreamInput;
  expected_optimal_pathway: PathwayType;
}
