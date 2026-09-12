'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import ExplainabilityCard from '@/components/ExplainabilityCard';
import AlternativeCard from '@/components/AlternativeCard';
import { OptimizationResult, WasteStreamInput, OptimizationObjective } from '@/lib/types';
import { getCurrentRun, saveCurrentRun } from '@/lib/store';
import { analyzeWasteStream } from '@/lib/api';
import { Compass, ArrowRight, RefreshCw, Layers } from 'lucide-react';

const DEFAULT_WASTE: WasteStreamInput = {
  title: '25 Tonnes Agricultural Bagasse & Crop Residue',
  generator_name: 'Baramati Sugarcane Agro Cooperative',
  waste_type: 'Agricultural Biomass / Bagasse',
  feedstock_category: 'crop_residue',
  quantity_tonnes: 25.0,
  moisture_pct: 14.5,
  ash_pct: 4.2,
  carbon_nitrogen_ratio: 42.0,
  energy_density_mj_kg: 17.2,
  contamination_pct: 1.5,
  location_name: 'Nira Valley Agricultural Cluster, Baramati Region',
  latitude: 18.1050,
  longitude: 74.3750
};

export default function RecommendationsPage() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [waste, setWaste] = useState<WasteStreamInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const stored = getCurrentRun();
    if (stored.result && stored.waste) {
      setResult(stored.result);
      setWaste(stored.waste);
      setIsLoading(false);
    } else {
      try {
        const res = await analyzeWasteStream(DEFAULT_WASTE, 'balanced');
        saveCurrentRun(res, DEFAULT_WASTE);
        setResult(res);
        setWaste(DEFAULT_WASTE);
      } catch (e) {
        console.error('Error auto-running benchmark:', e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleObjectiveSwitch = async (newObj: OptimizationObjective) => {
    if (!waste) return;
    setIsLoading(true);
    try {
      const updated = await analyzeWasteStream(waste, newObj);
      saveCurrentRun(updated, waste);
      setResult(updated);
    } catch (e) {
      console.error('Failed to update objective:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !result || !waste) {
    return (
      <div className="min-h-screen bg-[#080c0b] text-[#f1f5f4] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-sm text-gray-400 font-mono">Evaluating Optimal Pathways...</p>
        </div>
      </div>
    );
  }

  const winner = result.ranked_candidates.find((c) => c.facility_id === result.recommended_facility_id);
  const viableAlternatives = result.ranked_candidates.filter(
    (c) => c.facility_id !== result.recommended_facility_id && c.is_feasible
  );
  const infeasibleCount = result.ranked_candidates.filter((c) => !c.is_feasible).length;

  return (
    <div className="min-h-screen bg-[#080c0b] text-[#f1f5f4] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e332f] pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Compass className="w-3.5 h-3.5" />
              <span>Step 2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Best Pathway & Facility
            </h1>
            <p className="text-sm text-gray-400">
              CarbonSphere ranked feasible pathways and facilities for this waste stream.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/platform/waste"
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[#1e332f] bg-[#0e1514] text-gray-300 hover:text-white transition-colors"
            >
              Change Waste
            </Link>
            <Link
              href="/platform/routes"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <span>View Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Objective Switcher (Visually Secondary) */}
        <div className="glass-panel p-3.5 rounded-xl border border-[#1e332f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-gray-300 font-medium">Change objective:</span>
            <span className="text-gray-500 ml-2">Ranking updates in real time</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'balanced', label: 'Balanced' },
              { id: 'max_carbon', label: 'Max Carbon' },
              { id: 'max_economic', label: 'Max Value' },
              { id: 'min_logistics', label: 'Min Distance' },
              { id: 'max_diversion', label: 'Max Capacity' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleObjectiveSwitch(item.id as OptimizationObjective)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  result.objective === item.id
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-[#121c19] border-[#1e332f] text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Result: Winning Recommendation */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-[#0e1715] to-[#080c0b] shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-6">
            <div className="space-y-1.5">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Recommended Decision
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                {result.recommended_pathway.replace('_', ' ')}
              </div>
              <div className="text-sm text-gray-300 pt-1">
                Destination Facility:{' '}
                <span className="text-white font-bold">{result.recommended_facility_name}</span>
                {winner?.facility_location && (
                  <span className="text-gray-400 text-xs ml-1.5">({winner.facility_location})</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/platform/routes"
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                <span>View Route</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/platform/impact"
                className="px-4 py-3 rounded-xl border border-[#1e332f] bg-[#121c19] hover:bg-[#1a2b27] text-gray-200 hover:text-white text-xs font-medium transition-colors"
              >
                View Impact
              </Link>
            </div>
          </div>

          {/* 4 Key Supporting Operational Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#121c19] border border-[#1e332f]">
              <div className="text-xs text-gray-400 mb-1">Decision Score</div>
              <div className="text-2xl font-bold font-mono text-white">
                {winner ? winner.overall_score.toFixed(1) : '98.5'}
                <span className="text-xs text-gray-500 font-normal"> /100</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                Fit: {winner ? winner.compatibility_score.toFixed(0) : '95'}/100
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121c19] border border-[#1e332f]">
              <div className="text-xs text-gray-400 mb-1">Transit Distance</div>
              <div className="text-2xl font-bold font-mono text-sky-400">
                {result.total_distance_km.toFixed(1)}{' '}
                <span className="text-xs text-gray-500 font-normal">km</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                ~{result.estimated_duration_hrs.toFixed(1)} hrs road travel
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121c19] border border-[#1e332f]">
              <div className="text-xs text-gray-400 mb-1">Estimated Carbon Impact</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                +{result.net_carbon_impact_tco2e.toFixed(1)}{' '}
                <span className="text-xs text-gray-500 font-normal">tCO₂e</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">Net climate balance</div>
            </div>

            <div className="p-4 rounded-xl bg-[#121c19] border border-[#1e332f]">
              <div className="text-xs text-gray-400 mb-1">Economic Value</div>
              <div className="text-2xl font-bold font-mono text-amber-300">
                ₹{result.net_economic_value_inr.toLocaleString()}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">Net circular margin</div>
            </div>
          </div>
        </div>

        {/* Why This Recommendation */}
        <ExplainabilityCard result={result} />

        {/* Alternative Facilities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Alternative Facilities
              </h3>
              <p className="text-xs text-gray-400">
                Other feasible destination facilities evaluated for this feedstock
              </p>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              {viableAlternatives.length} Alternative{viableAlternatives.length === 1 ? '' : 's'}
            </span>
          </div>

          {viableAlternatives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viableAlternatives.map((cand, idx) => (
                <AlternativeCard
                  key={cand.facility_id}
                  candidate={cand}
                  rank={idx + 2}
                  isWinner={false}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#121c19] border border-[#1e332f] text-center text-xs text-gray-400">
              No other feasible alternative facilities identified for this specific feedstock criteria.
            </div>
          )}

          {infeasibleCount > 0 && (
            <p className="text-[11px] text-gray-500 text-center pt-2">
              Note: {infeasibleCount} facility in the regional network was excluded due to physical feedstock incompatibility (moisture/ash thresholds).
            </p>
          )}
        </div>

        {/* Next Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1e332f]">
          <Link
            href="/platform/waste"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Modify Feedstock Profile
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/platform/routes"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>View Route</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <DisclaimerBanner />
      </main>
    </div>
  );
}
