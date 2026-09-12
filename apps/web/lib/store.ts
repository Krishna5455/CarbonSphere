import { OptimizationResult, WasteStreamInput } from './types';

const STORAGE_KEY = 'carbonsphere_current_run';
const WASTE_KEY = 'carbonsphere_current_waste';

function isValidOptimizationResult(obj: any): obj is OptimizationResult {
  return Boolean(
    obj &&
    typeof obj === 'object' &&
    typeof obj.recommended_facility_id === 'string' &&
    typeof obj.recommended_pathway === 'string' &&
    typeof obj.net_carbon_impact_tco2e === 'number' &&
    typeof obj.net_economic_value_inr === 'number' &&
    Array.isArray(obj.ranked_candidates) &&
    obj.ranked_candidates.length > 0
  );
}

function isValidWasteStreamInput(obj: any): obj is WasteStreamInput {
  return Boolean(
    obj &&
    typeof obj === 'object' &&
    typeof obj.quantity_tonnes === 'number' &&
    typeof obj.waste_type === 'string' &&
    typeof obj.latitude === 'number' &&
    typeof obj.longitude === 'number'
  );
}

export function saveCurrentRun(result: OptimizationResult, waste: WasteStreamInput) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      localStorage.setItem(WASTE_KEY, JSON.stringify(waste));
    } catch (e) {
      console.warn('Unable to persist analysis run to localStorage:', e);
    }
  }
}

export function getCurrentRun(): { result: OptimizationResult | null; waste: WasteStreamInput | null } {
  if (typeof window === 'undefined') return { result: null, waste: null };
  try {
    const rawResult = localStorage.getItem(STORAGE_KEY);
    const rawWaste = localStorage.getItem(WASTE_KEY);
    
    const parsedResult = rawResult ? JSON.parse(rawResult) : null;
    const parsedWaste = rawWaste ? JSON.parse(rawWaste) : null;

    const validResult = isValidOptimizationResult(parsedResult) ? parsedResult : null;
    const validWaste = isValidWasteStreamInput(parsedWaste) ? parsedWaste : null;

    // If data in storage is corrupt or partial, clean up storage gracefully
    if (rawResult && !validResult) {
      localStorage.removeItem(STORAGE_KEY);
    }
    if (rawWaste && !validWaste) {
      localStorage.removeItem(WASTE_KEY);
    }

    return {
      result: validResult,
      waste: validWaste
    };
  } catch (e) {
    console.warn('Failed to safely parse active analysis from localStorage:', e);
    return { result: null, waste: null };
  }
}
