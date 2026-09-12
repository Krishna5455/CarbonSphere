from typing import Dict
from ..schemas.domain import WasteStreamInput, PathwayType

# GLEC standard freight emission factor (Class 8 heavy diesel truck)
TRANSPORT_EMISSION_FACTOR_PER_TONNE_KM = 0.000096 # tCO2e per tonne-km

def calculate_carbon_metrics(
    waste: WasteStreamInput,
    facility: dict,
    distance_km: float
) -> Dict[str, float]:
    """
    Computes transparent, model-based carbon balances.
    All calculations conform to IPCC First-Order Decay and GLEC freight standards.
    
    Net Carbon Impact = Gross Avoided Emissions 
                      + Avoided Fossil Displacement 
                      + Permanent Sequestration 
                      - Process Emissions 
                      - Transport Emissions
    """
    pathway = facility.get("pathway")
    quantity = waste.quantity_tonnes
    dry_matter_fraction = max(0.05, 1.0 - (waste.moisture_pct / 100.0))
    dry_tonnes = quantity * dry_matter_fraction
    
    # 1. Transport Emissions
    transport_emissions = quantity * distance_km * TRANSPORT_EMISSION_FACTOR_PER_TONNE_KM
    
    # 2. Process Emissions
    process_factor = float(facility.get("process_emission_factor", 0.04))
    process_emissions = quantity * process_factor
    
    gross_avoided = 0.0
    avoided_fossil_displacement = 0.0
    permanent_sequestration = 0.0
    
    if pathway == PathwayType.BIOCHAR:
        # Avoided open crop burning / uncontrolled field decomposition
        # Emission factor ~1.15 tCO2e avoided per dry tonne biomass
        gross_avoided = dry_tonnes * 1.15
        
        # Permanent biogenic recalcitrant carbon storage in biochar
        # Biochar yield ~30-33%, fixed carbon ~78%, 100-year permanence factor ~80%
        yield_factor = float(facility.get("byproduct_yield_factor", 0.32))
        biochar_tonnes = dry_tonnes * yield_factor
        # 1 tonne fixed carbon = 44/12 = 3.667 tCO2e stored
        permanent_sequestration = biochar_tonnes * 0.78 * (44.0 / 12.0) * 0.80
        
    elif pathway == PathwayType.BIOGAS:
        # Avoided landfill anaerobic methane formation (IPCC FOD model: ~0.85 tCO2e per wet tonne diverted)
        gross_avoided = quantity * 0.85
        
        # Biomethane displacing fossil natural gas (Avoided fossil emissions, NOT permanent sequestration)
        # Yield ~65 kg CBG per wet tonne; 1 kg CBG replaces 1.14 m3 fossil gas (~2.2 kg CO2e)
        cbg_yield_kg = quantity * float(facility.get("byproduct_yield_factor", 0.065)) * 1000.0
        avoided_fossil_displacement = (cbg_yield_kg * 2.2) / 1000.0
        permanent_sequestration = 0.0
        
    elif pathway == PathwayType.CARBON_MATERIALS:
        # Avoided landfill / incineration
        gross_avoided = dry_tonnes * 0.90
        
        # Embodied carbon displacement / fossil polymer & cement clinker displacement
        # Displacement credit ~1.30 tCO2e per tonne composite produced
        composite_tonnes = dry_tonnes * float(facility.get("byproduct_yield_factor", 0.65))
        avoided_fossil_displacement = composite_tonnes * 1.30
        permanent_sequestration = 0.0
        
    net_carbon_impact = (
        gross_avoided
        + avoided_fossil_displacement
        + permanent_sequestration
        - process_emissions
        - transport_emissions
    )
    
    return {
        "gross_carbon_avoided_tco2e": round(gross_avoided, 3),
        "avoided_fossil_displacement_tco2e": round(avoided_fossil_displacement, 3),
        "permanent_sequestration_tco2e": round(permanent_sequestration, 3),
        "process_emissions_tco2e": round(process_emissions, 3),
        "transport_emissions_tco2e": round(transport_emissions, 3),
        "net_carbon_impact_tco2e": round(net_carbon_impact, 3)
    }
