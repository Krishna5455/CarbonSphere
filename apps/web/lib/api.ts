import { WasteStreamInput, OptimizationObjective, OptimizationResult, Facility, DemoScenario } from './types';

function getEndpointUrl(path: string, params?: Record<string, string>): string {
  const base = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : '';
  const fullPath = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, v);
      }
    }
    const queryString = searchParams.toString();
    return queryString ? `${fullPath}?${queryString}` : fullPath;
  }
  return fullPath;
}

export async function fetchFacilities(pathway?: string): Promise<Facility[]> {
  try {
    const endpoint = getEndpointUrl('/api/facilities', pathway ? { pathway } : undefined);
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Facilities fetch failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend connection warning, fetching facilities via fallback:', err);
    throw err;
  }
}

export async function fetchDemoScenarios(): Promise<DemoScenario[]> {
  try {
    const endpoint = getEndpointUrl('/api/scenarios');
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Scenarios fetch failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('Fallback scenarios loaded:', err);
    return [];
  }
}

export async function analyzeWasteStream(
  waste: WasteStreamInput,
  objective: OptimizationObjective = 'balanced'
): Promise<OptimizationResult> {
  const endpoint = getEndpointUrl('/api/analyze', { objective });
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(waste),
  });
  
  if (!res.ok) {
    throw new Error(`Analysis calculation failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchRoute(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): Promise<{ distance_km: number; duration_hrs: number; geometry: { type: string; coordinates: [number, number][] }; source?: string }> {
  const endpoint = getEndpointUrl('/api/route', {
    origin_lat: originLat.toString(),
    origin_lon: originLon.toString(),
    dest_lat: destLat.toString(),
    dest_lon: destLon.toString(),
  });
  
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Route calculation failed: ${res.statusText}`);
  }
  return await res.json();
}

