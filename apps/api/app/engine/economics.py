from typing import Dict
from ..schemas.domain import WasteStreamInput, PathwayType

TRANSPORT_BASE_FEE_PER_TONNE = 100.0 # INR base loading and handling
TRANSPORT_RATE_PER_TONNE_KM = 6.50 # INR per tonne-km for regional heavy freight

def calculate_economic_metrics(
    waste: WasteStreamInput,
    facility: dict,
    distance_km: float
) -> Dict[str, float]:
    """
    Calculates circular economic balance, freight cost, gate fees, and byproduct values.
    All monetary units are in INR (Indian Rupee).
    """
    quantity = waste.quantity_tonnes
    pathway = facility.get("pathway")
    
    # 1. Transport Cost
    transport_cost = quantity * (TRANSPORT_BASE_FEE_PER_TONNE + (distance_km * TRANSPORT_RATE_PER_TONNE_KM))
    
    # 2. Feedstock Gate Fee / Purchase Price
    # Positive gate fee = facility buys feedstock (revenue)
    # Negative gate fee = facility charges tipping fee (cost)
    gate_fee_unit = float(facility.get("gate_fee_per_tonne", 0.0))
    gate_fee_total = quantity * gate_fee_unit
    
    # 3. Byproduct Yield & Commercial Value
    yield_factor = float(facility.get("byproduct_yield_factor", 0.30))
    market_price = float(facility.get("byproduct_market_price", 20000.0))
    
    # Dry matter based conversion for solid lignocellulose/cellulose (biochar & composites)
    # Wet basis conversion for anaerobic slurry digestion (biogas)
    if pathway in (PathwayType.BIOCHAR, PathwayType.CARBON_MATERIALS):
        dry_matter = max(0.05, 1.0 - (waste.moisture_pct / 100.0))
        byproduct_tonnes = quantity * dry_matter * yield_factor
    else:
        byproduct_tonnes = quantity * yield_factor
        
    byproduct_market_value = byproduct_tonnes * market_price
    
    # 4. Circular Net Value
    # (Byproduct creation value + gate fee transaction - logistics cost - processing estimate)
    # Processing operating expense is modeled as 35% of product gross value
    estimated_opex = byproduct_market_value * 0.35
    net_economic_value = byproduct_market_value + gate_fee_total - transport_cost - estimated_opex
    
    return {
        "transport_cost_inr": round(transport_cost, 2),
        "gate_fee_revenue_or_cost_inr": round(gate_fee_total, 2),
        "byproduct_yield_tonnes": round(byproduct_tonnes, 2),
        "byproduct_market_value_inr": round(byproduct_market_value, 2),
        "net_economic_value_inr": round(net_economic_value, 2)
    }
