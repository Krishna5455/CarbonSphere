'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import CarbonMap from '@/components/map/CarbonMap';
import ExplainabilityCard from '@/components/ExplainabilityCard';
import AlternativeCard from '@/components/AlternativeCard';
import { OptimizationResult, WasteStreamInput, OptimizationObjective } from '@/lib/types';
import { getCurrentRun, saveCurrentRun } from '@/lib/store';
import { analyzeWasteStream } from '@/lib/api';
import { Sparkles, ArrowRight, RefreshCw, Layers, Compass, CheckCircle, Scale, ShieldCheck } from 'lucide-react';

const DEFAULT_WASTE: WasteStreamInput = {
  title: '25 Tonnes Agricultural Bagasse & Crop Residue',
  generator_name: 'Baramati Sugarcane Agro Cooperative',
  waste_type: 'Agricultural Biomass / Bagasse',
  quantity_tonnes: 25.0,
  moisture_pct: 14.5,
  ash_pct: 4.2,
  carbon_nitrogen_ratio: 42.0,
  energy_density_mj_kg: 17.2,
  contamination_pct: 1.5,
  location_name: 'Baramati Agri-Zone, Pune, Maharashtra',
  latitude: 18.1519,
  longitude: 74.5771
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
      // Auto-run default benchmark
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
          <p className="text-sm text-gray-400 font-mono">Running Multi-Criteria Pathway Optimization...</p>
        </div>
      </div>
    );
  }

  const winner = result.ranked_candidates.find((c) => c.facility_id === result.recommended_facility_id);

  return (
    <div className="min-h-screen bg-[#080c0b] text-[#f1f5f4] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e332f] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Optimal Decision Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recommended Pathway & Facility Match
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Evaluating: <b className="text-white">{waste.quantity_tonnes}t {waste.waste_type}</b> from <i>{waste.location_name}</i>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/platform/waste"
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[#1e332f] bg-[#0e1514] text-gray-300 hover:text-white transition-colors"
            >
              Modify Feedstock Specs
            </Link>
            <Link
              href="/platform/impact"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <span>Full Audit Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Objective Switcher Bar */}
        <div className="glass-panel p-4 rounded-xl border border-[#1e332f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <span className="text-gray-400 font-medium">Re-score Alternatives with Objective:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'balanced', label: 'Balanced' },
              { id: 'max_carbon', label: 'Max Carbon' },
              { id: 'max_economic', label: 'Max Value' },
              { id: 'min_logistics', label: 'Min Transport' },
              { id: 'max_diversion', label: 'Max Diversion' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleObjectiveSwitch(item.id as OptimizationObjective)}
                className={`px-3 py-1.5 rounded-lg font-medium border transition-all ${
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

        {/* Hero Recommended Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-[#0e1715] to-[#0a0f0e] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Decision Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-black shadow-md shadow-emerald-500/30">
                  Primary Recommendation
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                  Pathway: <b className="text-emerald-300">{result.recommended_pathway.replace('_', ' ')}</b>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {result.recommended_facility_name}
              </h2>

              <p className="text-sm text-gray-300 leading-relaxed">
                {result.why_recommended}
              </p>

              {/* Badges / Metrics Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#121c19] border border-[#1e332f]">
                  <div className="text-xs text-gray-400">Net CO₂e Abatement</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    +{result.net_carbon_impact_tco2e.toFixed(1)} t
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#121c19] border border-[#1e332f]">
                  <div className="text-xs text-gray-400">Circular Net Value</div>
                  <div className="text-lg font-bold font-mono text-amber-300">
                    ₹{result.net_economic_value_inr.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#121c19] border border-[#1e332f]">
                  <div className="text-xs text-gray-400">Freight Distance</div>
                  <div className="text-lg font-bold font-mono text-sky-400">
                    {result.total_distance_km.toFixed(1)} km
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#121c19] border border-[#1e332f]">
                  <div className="text-xs text-gray-400">Transit Time</div>
                  <div className="text-lg font-bold font-mono text-gray-200">
                    {result.estimated_duration_hrs.toFixed(1)} hrs
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Action & Mini Map */}
            <div className="lg:col-span-5 h-[260px] rounded-xl overflow-hidden border border-[#1e332f]">
              <CarbonMap
                className="w-full h-full"
                origin={{
                  lat: waste.latitude,
                  lon: waste.longitude,
                  name: waste.generator_name,
                  wasteType: waste.waste_type
                }}
                facilities={result.ranked_candidates}
                recommendedId={result.recommended_facility_id}
                routeGeometry={result.route_geometry}
              />
            </div>
          </div>
        </div>

        {/* Explainability Breakdown Card */}
        <ExplainabilityCard result={result} />

        {/* Ranked Alternatives Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Candidate Facilities & Feasibility Comparison
              </h3>
              <p className="text-xs text-gray-400">
                Comparing all regional conversion hubs across Biochar, Biogas, and Carbon Materials
              </p>
            </div>
            <span className="text-xs text-gray-400">
              {result.ranked_candidates.length} Evaluated Facilities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.ranked_candidates.map((cand, idx) => (
              <AlternativeCard
                key={cand.facility_id}
                candidate={cand}
                rank={idx + 1}
                isWinner={cand.facility_id === result.recommended_facility_id}
              />
            ))}
          </div>
        </div>

        <DisclaimerBanner />
      </main>
    </div>
  );
}
