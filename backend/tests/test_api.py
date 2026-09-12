import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.schemas.domain import OptimizationObjective, FeedstockCategory

@pytest.mark.asyncio
async def test_api_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["service"] == "CarbonSphere Optimization Engine"

@pytest.mark.asyncio
async def test_api_scenarios():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/scenarios")
        assert res.status_code == 200
        scenarios = res.json()
        assert len(scenarios) == 3
        assert scenarios[0]["expected_optimal_pathway"] == "biochar"
        assert scenarios[1]["expected_optimal_pathway"] == "biogas"
        assert scenarios[2]["expected_optimal_pathway"] == "carbon_materials"

@pytest.mark.asyncio
async def test_api_facilities():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/facilities")
        assert res.status_code == 200
        facilities = res.json()
        assert len(facilities) >= 3
        for fac in facilities:
            assert "id" in fac
            assert "name" in fac
            assert "pathway" in fac
            assert "capacity_daily_tonnes" in fac

@pytest.mark.asyncio
async def test_api_waste_stream_submission():
    payload = {
        "title": "API Test Cotton Residue",
        "generator_name": "API Test Coop",
        "waste_type": "cotton stalk",
        "feedstock_category": "crop_residue",
        "quantity_tonnes": 15.0,
        "moisture_pct": 12.0,
        "ash_pct": 3.5,
        "carbon_nitrogen_ratio": 45.0,
        "energy_density_mj_kg": 17.2,
        "contamination_pct": 1.0,
        "location_name": "Baramati Region",
        "latitude": 18.15,
        "longitude": 74.58
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/waste", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "id" in data
        assert data["title"] == payload["title"]

@pytest.mark.asyncio
async def test_api_analyze_endpoint():
    payload = {
        "title": "API Optimize Biomass",
        "generator_name": "Farmer Cluster",
        "waste_type": "bagasse",
        "feedstock_category": "crop_residue",
        "quantity_tonnes": 20.0,
        "moisture_pct": 14.0,
        "ash_pct": 3.0,
        "carbon_nitrogen_ratio": 40.0,
        "energy_density_mj_kg": 16.5,
        "contamination_pct": 1.2,
        "location_name": "Indapur",
        "latitude": 18.11,
        "longitude": 75.02
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/analyze?objective=balanced", json=payload)
        assert res.status_code == 200
        result = res.json()
        assert "recommended_facility_id" in result
        assert "recommended_pathway" in result
        assert "ranked_candidates" in result
        assert "route_geometry" in result
        assert "accounting_disclaimer" in result
        # Check carbon categorization fields
        assert "avoided_fossil_displacement_tco2e" in result
        assert "permanent_sequestration_tco2e" in result

@pytest.mark.asyncio
async def test_api_route_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/route", params={
            "origin_lat": 18.105,
            "origin_lon": 74.375,
            "dest_lat": 18.165,
            "dest_lon": 74.585
        })
        assert res.status_code == 200
        route_data = res.json()
        assert "distance_km" in route_data
        assert route_data["distance_km"] > 0.0
        assert "geometry" in route_data
        assert len(route_data["geometry"]["coordinates"]) > 2
