from typing import Tuple, List, Union
from ..schemas.domain import WasteStreamInput, PathwayType, FeedstockCategory

def resolve_feedstock_category(waste: Union[WasteStreamInput, str]) -> FeedstockCategory:
    """
    Resolves structured feedstock category from explicit input or standardized classification.
    """
    if isinstance(waste, WasteStreamInput):
        if waste.feedstock_category:
            return waste.feedstock_category
        wt = waste.waste_type.lower()
    else:
        wt = str(waste).lower()
        
    # 1. Sorted Cellulose / Structural Fibers
    if any(k in wt for k in ["cellulose", "paper", "pulp", "wood", "sawdust", "fiber", "fibre", "textile", "packaging", "carton"]):
        return FeedstockCategory.SORTED_CELLULOSE
    # 2. Food Slurry / High Moisture Organics
    if any(k in wt for k in ["sludge", "slurry", "manure", "brewery", "food", "beverage", "dairy", "effluent", "organic waste"]):
        return FeedstockCategory.FOOD_SLURRY
    # 3. Crop Residue / Agricultural Biomass
    if any(k in wt for k in ["crop", "bagasse", "straw", "stalk", "husk", "stover", "biomass", "agricultural", "cane"]):
        return FeedstockCategory.CROP_RESIDUE
    return FeedstockCategory.OTHER

def evaluate_feasibility(waste: WasteStreamInput, facility: dict) -> Tuple[bool, List[str], float]:
    """
    Evaluates whether a waste stream is technically feasible for a facility
    based on capacity, contamination, feedstock category, and physical chemistry.
    Returns: (is_feasible, rejection_reasons, compatibility_score_0_to_100)
    """
    reasons = []
    penalty = 0.0
    category = resolve_feedstock_category(waste)
    
    # 1. Capacity Check
    avail_capacity = float(facility.get("capacity_daily_tonnes", 0)) - float(facility.get("current_load_tonnes", 0))
    if waste.quantity_tonnes > avail_capacity:
        reasons.append(f"Insufficient daily capacity: Requires {waste.quantity_tonnes:.1f}t, facility has {avail_capacity:.1f}t available.")
    
    # 2. Contamination Check
    max_contam = float(facility.get("max_contamination_pct", 10.0))
    if waste.contamination_pct > max_contam:
        reasons.append(f"Contamination rate ({waste.contamination_pct:.1f}%) exceeds facility threshold ({max_contam:.1f}%).")
    elif waste.contamination_pct > (max_contam * 0.7):
        penalty += 15.0 # Quality penalty
    
    # 3. Pathway Specific Category & Technical Chemistry Rules
    pathway = facility.get("pathway")
    min_moisture = float(facility.get("min_moisture_pct", 0.0))
    max_moisture = float(facility.get("max_moisture_pct", 100.0))
    
    if pathway == PathwayType.BIOCHAR:
        # Biochar pyrolysis demands dry, high-lignin biomass
        if category == FeedstockCategory.FOOD_SLURRY and waste.moisture_pct > 30.0:
            reasons.append(f"Feedstock category '{category.value}' has prohibitive moisture for thermal pyrolysis.")
        if waste.moisture_pct > max_moisture:
            reasons.append(f"Moisture ({waste.moisture_pct:.1f}%) is too high for Biochar pyrolysis (Max {max_moisture:.1f}%). Requires prohibitive thermal drying.")
        elif waste.moisture_pct > 18.0:
            # Minor penalty for moderate moisture requiring pre-drying
            penalty += (waste.moisture_pct - 18.0) * 3.0
            
        if waste.ash_pct > 20.0:
            reasons.append(f"Ash content ({waste.ash_pct:.1f}%) too high for stable biochar formation (Max 20%).")
        elif waste.ash_pct > 10.0:
            penalty += (waste.ash_pct - 10.0) * 2.0
            
    elif pathway == PathwayType.BIOGAS:
        # Biogas Anaerobic Digestion demands wet organic slurries with reasonable C:N ratio
        if category in (FeedstockCategory.CROP_RESIDUE, FeedstockCategory.SORTED_CELLULOSE) and waste.moisture_pct < 40.0:
            reasons.append(f"Dry lignocellulosic feedstock category '{category.value}' cannot undergo anaerobic digestion without major pre-treatment and rehydration.")
        if waste.moisture_pct < min_moisture:
            reasons.append(f"Moisture ({waste.moisture_pct:.1f}%) too low for Anaerobic Digestion (Min {min_moisture:.1f}%). Feedstock too dry for slurry digestion.")
        
        cn = waste.carbon_nitrogen_ratio or 25.0
        if cn > 60.0:
            penalty += 20.0 # High C:N slows digestion unless co-digested with nitrogen-rich waste
        elif cn < 12.0:
            penalty += 15.0 # Low C:N risks ammonia inhibition
            
    elif pathway == PathwayType.CARBON_MATERIALS:
        # Carbon-negative materials demand clean, low-moisture, low-ash fibrous feedstocks
        if category == FeedstockCategory.CROP_RESIDUE:
            reasons.append(f"Feedstock category 'crop_residue' ({waste.waste_type}) lacks structural tensile fiber consistency required for composite panel fabrication.")
        elif category == FeedstockCategory.FOOD_SLURRY:
            reasons.append(f"Feedstock category 'food_slurry' is chemically incompatible with solid carbon-negative material composites.")
            
        if waste.moisture_pct > max_moisture:
            reasons.append(f"Moisture ({waste.moisture_pct:.1f}%) exceeds composite fabrication limit ({max_moisture:.1f}%).")
        if waste.ash_pct > 3.0:
            reasons.append(f"Ash content ({waste.ash_pct:.1f}%) exceeds composite binding limit (Max 3.0%). High mineral/silica ash causes micro-cracking in structural composites.")
        if waste.contamination_pct > max_contam:
            reasons.append(f"Contamination ({waste.contamination_pct:.1f}%) impairs structural composite matrix bonding.")
            
    is_feasible = len(reasons) == 0
    compatibility_score = max(10.0, 100.0 - penalty) if is_feasible else 0.0
    
    return is_feasible, reasons, compatibility_score
