import os
import httpx
import math
from geopy.distance import geodesic
from typing import Dict, Any, List

OSRM_BASE = os.getenv("OSRM_ENDPOINT", "https://router.project-osrm.org").rstrip("/")
OSRM_BASE_URL = f"{OSRM_BASE}/route/v1/driving"

async def get_route(
    origin_lat: float, origin_lon: float,
    dest_lat: float, dest_lon: float
) -> Dict[str, Any]:
    """
    Retrieves driving route between origin and destination.
    Uses OSRM API with automatic zero-cost geodesic fallback.
    """
    url = f"{OSRM_BASE_URL}/{origin_lon},{origin_lat};{dest_lon},{dest_lat}?overview=full&geometries=geojson"
    
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    route = data["routes"][0]
                    distance_km = route["distance"] / 1000.0
                    duration_hrs = route["duration"] / 3600.0
                    geometry = route["geometry"]
                    return {
                        "distance_km": round(distance_km, 2),
                        "duration_hrs": round(duration_hrs, 2),
                        "geometry": geometry,
                        "source": "osrm"
                    }
    except Exception:
        # Fall through to offline geodesic calculation
        pass

    # Resilient Geodesic Fallback with 1.25 Road Tortuosity Factor
    p1 = (origin_lat, origin_lon)
    p2 = (dest_lat, dest_lon)
    direct_km = geodesic(p1, p2).kilometers
    road_distance_km = direct_km * 1.25
    average_speed_kmh = 45.0 # Typical Indian regional freight truck speed
    duration_hrs = road_distance_km / average_speed_kmh
    
    # Generate realistic intermediate points along geodesic arc with slight natural curvature
    coords: List[List[float]] = []
    steps = 15
    for i in range(steps + 1):
        fraction = i / float(steps)
        lat = origin_lat + fraction * (dest_lat - origin_lat)
        lon = origin_lon + fraction * (dest_lon - origin_lon)
        # Add slight natural curvature displacement
        offset = math.sin(fraction * math.pi) * 0.015
        coords.append([round(lon + offset, 6), round(lat + offset, 6)])
        
    return {
        "distance_km": round(road_distance_km, 2),
        "duration_hrs": round(duration_hrs, 2),
        "geometry": {
            "type": "LineString",
            "coordinates": coords
        },
        "source": "geodesic_fallback"
    }
