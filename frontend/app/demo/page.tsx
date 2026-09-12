'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import { analyzeWasteStream } from '@/lib/api';
import { saveCurrentRun } from '@/lib/store';
import { WasteStreamInput, OptimizationResult, PathwayType } from '@/lib/types';
import { Sparkles, Flame, Droplets, Box, ArrowRight, CheckCircle2, Play, Loader2 } from 'lucide-react';

interface BenchmarkCardData {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  tonnage: string;
  wasteType: string;
  expectedPathway: PathwayType;
  keyPhysics: string;
  payload: WasteStreamInput;
}

const BENCHMARKS: BenchmarkCardData[] = [
  {
    id: 'sc-1',
    badge: 'Scenario 1 • Agriculture',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    title: '25t Agricultural Biomass',
    tonnage: '25.0 Tonnes',
    wasteType: 'Sugarcane Bagasse & Crop Residue',
    expectedPathway: 'biochar',
    keyPhysics: 'Low moisture (14.5%) and moderate ash (4.2%) favor slow pyrolysis for biochar.',
    payload: {
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
    }
  },
  {
    id: 'sc-2',
    badge: 'Scenario 2 • Food Processing',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    title: '40t Food-Processing Sludge',
    tonnage: '40.0 Tonnes',
    wasteType: 'Brewery & Food Slurry',
    expectedPathway: 'biogas',
    keyPhysics: 'High moisture (82%) and balanced C:N (24:1) enable anaerobic digestion for biomethane.',
    payload: {
      title: '40 Tonnes Food Processing Organic Residue',
      generator_name: 'Chakan Food & Brewery Industrial Hub',
      waste_type: 'Food Processing Organic Sludge',
      feedstock_category: 'food_slurry',
      quantity_tonnes: 40.0,
      moisture_pct: 82.0,
      ash_pct: 2.1,
      carbon_nitrogen_ratio: 24.0,
      energy_density_mj_kg: 4.8,
      contamination_pct: 2.5,
      location_name: 'Bhosari MIDC Industrial Estate, Pune',
      latitude: 18.6280,
      longitude: 73.8350
    }
  },
  {
    id: 'sc-3',
    badge: 'Scenario 3 • Fibrous Scrap',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    title: '15t Sorted Cellulosic Fiber',
    tonnage: '15.0 Tonnes',
    wasteType: 'Industrial Packaging Fiber',
    expectedPathway: 'carbon_materials',
    keyPhysics: 'Low moisture (9%) and clean fibers allow structural composite manufacturing.',
    payload: {
      title: '15 Tonnes Post-Industrial Cellulosic Fiber',
      generator_name: 'Satara Clean Packaging Works',
      waste_type: 'Post-Industrial Cellulosic Fiber Scrap',
      feedstock_category: 'sorted_cellulose',
      quantity_tonnes: 15.0,
      moisture_pct: 9.0,
      ash_pct: 1.5,
      carbon_nitrogen_ratio: 65.0,
      energy_density_mj_kg: 15.5,
      contamination_pct: 0.8,
      location_name: 'Hadapsar Packaging Distribution Hub, Pune',
      latitude: 18.5020,
      longitude: 73.9280
    }
  }
];

export default function DemoPage() {
  const router = useRouter();
  const [runningId, setRunningId] = useState<string | null>(null);
  const [demoResults, setDemoResults] = useState<Record<string, OptimizationResult>>({});

  const runBenchmark = async (benchmark: BenchmarkCardData) => {
    setRunningId(benchmark.id);
    try {
      const res = await analyzeWasteStream(benchmark.payload, 'balanced');
      setDemoResults((prev) => ({ ...prev, [benchmark.id]: res }));
      saveCurrentRun(res, benchmark.payload);
    } catch (e) {
      console.error('Demo run error:', e);
    } finally {
      setRunningId(null);
    }
  };

  const handleInspectRun = (benchmark: BenchmarkCardData) => {
    const res = demoResults[benchmark.id];
    if (res) {
      saveCurrentRun(res, benchmark.payload);
      router.push('/platform/recommendations');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c0b] text-[#f1f5f4] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title */}
        <div className="space-y-2 border-b border-[#1e332f] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Scenarios</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Benchmark Demo Scenarios
          </h1>
          <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
            Run live scenarios to see how different waste characteristics produce different circular pathways.
          </p>
        </div>

        {/* 3 Benchmark Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {BENCHMARKS.map((bm) => {
            const hasRun = !!demoResults[bm.id];
            const result = demoResults[bm.id];
            const isProcessing = runningId === bm.id;

            return (
              <div
                key={bm.id}
                className="glass-panel rounded-2xl p-6 border border-[#1e332f] flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${bm.badgeColor}`}>
                      {bm.badge}
                    </span>
                    <span className="text-xs font-mono text-gray-400 font-bold">{bm.tonnage}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{bm.title}</h3>
                    <p className="text-xs text-gray-400">{bm.wasteType}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#121c19] border border-[#1e332f] text-xs text-gray-300 space-y-1.5">
                    <div className="font-semibold text-emerald-400 text-[11px] uppercase tracking-wide">
                      Key Driver
                    </div>
                    <p className="text-gray-400 leading-relaxed text-[11px]">{bm.keyPhysics}</p>
                  </div>

                  {/* Expected vs Actual Outcome */}
                  <div className="text-xs space-y-2 pt-1">
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Target Pathway:</span>
                      <span className="font-bold text-white capitalize font-mono">{bm.expectedPathway.replace('_', ' ')}</span>
                    </div>

                    {hasRun && result && (
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Optimized Result</span>
                        </div>
                        <div className="text-white font-bold text-xs truncate">
                          {result.recommended_facility_name}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-gray-300 font-mono">
                          <div>+{result.net_carbon_impact_tco2e.toFixed(1)} t CO₂e</div>
                          <div className="text-amber-300">₹{result.net_economic_value_inr.toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => runBenchmark(bm)}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{hasRun ? 'Re-run Scenario' : 'Run Scenario'}</span>
                      </>
                    )}
                  </button>

                  {hasRun && (
                    <button
                      onClick={() => handleInspectRun(bm)}
                      className="w-full py-2 rounded-xl border border-[#1e332f] bg-[#121c19] hover:bg-[#1a2b27] text-gray-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>View Full Results</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DisclaimerBanner />
      </main>
    </div>
  );
}
