from typing import List
from ..schemas.domain import DemoScenario, WasteStreamInput, PathwayType, FeedstockCategory

DEMO_SCENARIOS: List[DemoScenario] = [
    DemoScenario(
        id="scenario-agri-biomass",
        title="25 Tonnes Agricultural Crop Residue",
        description="Dry sugarcane bagasse and cotton stalks from an agricultural collective. Low moisture (14.5%) and moderate ash make it a premier candidate for biochar pyrolysis.",
        waste_input=WasteStreamInput(
            title="25 Tonnes Sugarcane Bagasse & Crop Residue",
            generator_name="Nira Basin Cane Farmers Cooperative FPO",
            waste_type="Agricultural Biomass / Bagasse",
            feedstock_category=FeedstockCategory.CROP_RESIDUE,
            quantity_tonnes=25.0,
            moisture_pct=14.5,
            ash_pct=4.2,
            carbon_nitrogen_ratio=42.0,
            energy_density_mj_kg=17.2,
            contamination_pct=1.8,
            location_name="Nira Valley Farm Cluster, Pune, Maharashtra",
            latitude=18.1050,
            longitude=74.3750
        ),
        expected_optimal_pathway=PathwayType.BIOCHAR
    ),
    DemoScenario(
        id="scenario-food-waste",
        title="40 Tonnes Food-Processing Organic Waste",
        description="High-moisture brewery, beverage, and food canning sludge from an industrial processing corridor. High wet organic fraction (82%) makes it ideal for continuous anaerobic digestion.",
        waste_input=WasteStreamInput(
            title="40 Tonnes Food Processing Wet Residue",
            generator_name="Bhosari Food & Dairy Processing Hub",
            waste_type="Food Processing Organic Sludge",
            feedstock_category=FeedstockCategory.FOOD_SLURRY,
            quantity_tonnes=40.0,
            moisture_pct=82.0,
            ash_pct=2.1,
            carbon_nitrogen_ratio=24.0,
            energy_density_mj_kg=4.8,
            contamination_pct=2.5,
            location_name="Bhosari MIDC Sector 7, Pune, Maharashtra",
            latitude=18.6280,
            longitude=73.8350
        ),
        expected_optimal_pathway=PathwayType.BIOGAS
    ),
    DemoScenario(
        id="scenario-sorted-fibrous",
        title="15 Tonnes Sorted Clean Cellulosic Fiber",
        description="Clean, segregated post-industrial paper pulp and fibrous packaging scraps. Very low moisture (9.0%) and zero stone/metal content make it ideal for structural bio-composites.",
        waste_input=WasteStreamInput(
            title="15 Tonnes Segregated Cellulosic Fiber",
            generator_name="Satara Clean Packaging Solutions Works",
            waste_type="Post-Industrial Cellulosic Fiber Scrap",
            feedstock_category=FeedstockCategory.SORTED_CELLULOSE,
            quantity_tonnes=15.0,
            moisture_pct=9.0,
            ash_pct=1.5,
            carbon_nitrogen_ratio=65.0,
            energy_density_mj_kg=15.5,
            contamination_pct=0.8,
            location_name="Hadapsar Packaging Distribution Hub, Pune, Maharashtra",
            latitude=18.5020,
            longitude=73.9280
        ),
        expected_optimal_pathway=PathwayType.CARBON_MATERIALS
    )
]
