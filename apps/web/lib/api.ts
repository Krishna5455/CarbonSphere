import { WasteStreamInput, OptimizationObjective, OptimizationResult, Facility, DemoScenario } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchFacilities(pathway?: string): Promise<Facility[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/facilities`);
    if (pathway) url.searchParams.append('pathway', pathway);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`Facilities fetch failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend connection warning, fetching facilities via local endpoint or fallback:', err);
    throw err;
  }
}

export async function fetchDemoScenarios(): Promise<DemoScenario[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/scenarios`, { cache: 'no-store' });
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
  const res = await fetch(`${API_BASE_URL}/api/analyze?objective=${objective}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(waste),
  });
  
  return await res.json();
}

export async function fetchRoute(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): Promise<{ distance_km: number; duration_hrs: number; geometry: { type: string; coordinates: [number, number][] }; source?: string }> {
  const url = new URL(`${API_BASE_URL}/api/route`);
  url.searchParams.append('origin_lat', originLat.toString());
  url.searchParams.append('origin_lon', originLon.toString());
  url.searchParams.append('dest_lat', destLat.toString());
  url.searchParams.append('dest_lon', destLon.toString());
  
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Route calculation failed: ${res.statusText}`);
  }
  return await res.json();
}
