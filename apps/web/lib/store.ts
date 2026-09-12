import { OptimizationResult, WasteStreamInput } from './types';

const STORAGE_KEY = 'carbonsphere_current_run';
const WASTE_KEY = 'carbonsphere_current_waste';

export function saveCurrentRun(result: OptimizationResult, waste: WasteStreamInput) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    localStorage.setItem(WASTE_KEY, JSON.stringify(waste));
  }
}

export function getCurrentRun(): { result: OptimizationResult | null; waste: WasteStreamInput | null } {
  if (typeof window === 'undefined') return { result: null, waste: null };
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    const w = localStorage.getItem(WASTE_KEY);
    return {
      result: r ? JSON.parse(r) : null,
      waste: w ? JSON.parse(w) : null
    };
  } catch (e) {
    return { result: null, waste: null };
  }
}
