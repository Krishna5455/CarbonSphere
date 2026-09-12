'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import { OptimizationResult, WasteStreamInput } from '@/lib/types';
import { getCurrentRun, saveCurrentRun } from '@/lib/store';
import { analyzeWasteStream } from '@/lib/api';
import { BarChart3, FileSpreadsheet, Download, Leaf, DollarSign, ArrowRight, RefreshCw, Layers } from 'lucide-react';

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

export default function ImpactPage() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [waste, setWaste] = useState<WasteStreamInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    load();
  }, []);

  if (isLoading || !result || !waste) {
    return (
      <div className="min-h-screen bg-[#080c0b] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-sm text-gray-400 font-mono">Calculating Impact...</p>
        </div>
      </div>
    );
  }

  const winner = result.ranked_candidates.find((c) => c.facility_id === result.recommended_facility_id);

  return (
    <div className="min-h-screen bg-[#080c0b] text-[#f1f5f4] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e332f] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Step 4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Estimated Impact
            </h1>
            <p className="text-sm text-gray-400">
              Summary for {waste.quantity_tonnes}t {waste.waste_type}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/platform/routes"
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[#1e332f] bg-[#0e1514] text-gray-300 hover:text-white transition-colors"
            >
              ← Route
            </Link>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[#1e332f] bg-[#0e1514] text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Hero: 3 Key Numbers */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-[#0e1715] to-[#080c0b] shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-5">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Analysis Result
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                {result.recommended_pathway.replace('_', ' ')}
              </div>
              <div className="text-sm text-gray-400">
                via <span className="text-white font-semibold">{result.recommended_facility_name}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {waste.generator_name}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[#121c19] border border-[#1e332f] text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Waste Diverted</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-white">
                {waste.quantity_tonnes}
                <span className="text-sm text-gray-500 font-normal ml-1">tonnes</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#121c19] border border-emerald-500/30 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-2">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Estimated Carbon Impact</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                +{result.net_carbon_impact_tco2e.toFixed(1)}
                <span className="text-sm text-gray-500 font-normal ml-1">tCO₂e</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#121c19] border border-amber-500/30 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Economic Value</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-amber-300">
                ₹{result.net_economic_value_inr.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <DisclaimerBanner />

        {/* Detailed Breakdown: Carbon + Economic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carbon Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e332f] pb-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Carbon Breakdown
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">tCO₂e</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                <div>
                  <div className="font-semibold text-white">Avoided Baseline Emissions</div>
                  <div className="text-[10px] text-gray-400">Avoided open burning / landfilling</div>
                </div>
                <div className="text-base font-bold font-mono text-emerald-400">
                  +{result.gross_carbon_avoided_tco2e.toFixed(2)}
                </div>
              </div>

              {/* Avoided Fossil Displacement (Biogas / CBG) */}
              {((winner && winner.avoided_fossil_displacement_tco2e > 0) || result.avoided_fossil_displacement_tco2e > 0) && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-sky-500/30">
                  <div>
                    <div className="font-semibold text-sky-300">Fossil Fuel Displacement</div>
                    <div className="text-[10px] text-gray-400">Biomethane replacing fossil gas</div>
                  </div>
                  <div className="text-base font-bold font-mono text-sky-400">
                    +{(winner ? winner.avoided_fossil_displacement_tco2e : result.avoided_fossil_displacement_tco2e).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Permanent Sequestration (Biochar / Structural Composites) */}
              {((winner && winner.permanent_sequestration_tco2e > 0) || result.permanent_sequestration_tco2e > 0) && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-emerald-500/30">
                  <div>
                    <div className="font-semibold text-emerald-300">Permanent Carbon Storage</div>
                    <div className="text-[10px] text-gray-400">Stable carbon retention (100-yr permanence)</div>
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    +{(winner ? winner.permanent_sequestration_tco2e : result.permanent_sequestration_tco2e).toFixed(2)}
                  </div>
                </div>
              )}

              {winner && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                  <div>
                    <div className="font-semibold text-white">Process Emissions</div>
                    <div className="text-[10px] text-gray-400">Facility energy consumption</div>
                  </div>
                  <div className="text-base font-bold font-mono text-amber-400">
                    -{winner.process_emissions_tco2e.toFixed(2)}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                <div>
                  <div className="font-semibold text-white">Transport Emissions</div>
                  <div className="text-[10px] text-gray-400">
                    {result.total_distance_km.toFixed(1)} km freight transit
                  </div>
                </div>
                <div className="text-base font-bold font-mono text-amber-400">
                  -{result.transport_emissions_tco2e.toFixed(2)}
                </div>
              </div>

              {/* Net Result */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 mt-4">
                <div>
                  <div className="font-extrabold text-sm text-white">Net Carbon Impact</div>
                  <div className="text-[10px] text-emerald-300">Total avoided emissions</div>
                </div>
                <div className="text-xl font-extrabold font-mono text-emerald-300">
                  +{result.net_carbon_impact_tco2e.toFixed(2)} tCO₂e
                </div>
              </div>
            </div>
          </div>

          {/* Economic Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e332f] pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Economic Breakdown
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">INR (₹)</span>
            </div>

            <div className="space-y-3 text-xs">
              {winner && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                  <div>
                    <div className="font-semibold text-white">Byproduct Value</div>
                    <div className="text-[10px] text-gray-400">
                      {winner.byproduct_yield_tonnes.toFixed(1)}t marketable output
                    </div>
                  </div>
                  <div className="text-base font-bold font-mono text-amber-300">
                    +₹{winner.byproduct_market_value_inr.toLocaleString()}
                  </div>
                </div>
              )}

              {winner && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                  <div>
                    <div className="font-semibold text-white">Gate Fee</div>
                    <div className="text-[10px] text-gray-400">
                      {winner.gate_fee_revenue_or_cost_inr >= 0 ? 'Purchase credit' : 'Disposal tipping fee'}
                    </div>
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {winner.gate_fee_revenue_or_cost_inr >= 0 ? '+' : ''}₹{winner.gate_fee_revenue_or_cost_inr.toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                <div>
                  <div className="font-semibold text-white">Transport Cost</div>
                  <div className="text-[10px] text-gray-400">
                    {result.total_distance_km.toFixed(1)} km freight
                  </div>
                </div>
                <div className="text-base font-bold font-mono text-sky-400">
                  -₹{result.transport_cost_inr.toLocaleString()}
                </div>
              </div>

              {/* Net Economic Value */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-amber-950/20 border border-amber-500/50 mt-4">
                <div>
                  <div className="font-extrabold text-sm text-white">Net Economic Value</div>
                  <div className="text-[10px] text-amber-300">Total value across the chain</div>
                </div>
                <div className="text-xl font-extrabold font-mono text-amber-300">
                  ₹{result.net_economic_value_inr.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Methodology Reference */}
        <div className="glass-panel p-5 rounded-2xl border border-[#1e332f] space-y-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-gray-400" />
            Emission Factors & Standards
          </h3>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e332f] text-gray-400 font-mono text-[11px]">
                  <th className="py-2 px-3">Parameter</th>
                  <th className="py-2 px-3">Value</th>
                  <th className="py-2 px-3">Reference</th>
                  <th className="py-2 px-3">Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e332f] text-gray-300">
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">Heavy-Duty Freight EF</td>
                  <td className="py-2 px-3 font-mono text-emerald-400">0.096 kg CO₂e / t·km</td>
                  <td className="py-2 px-3 text-gray-400">GLEC Framework v3.0</td>
                  <td className="py-2 px-3">Highway freight</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">Landfill Methane FOD</td>
                  <td className="py-2 px-3 font-mono text-emerald-400">0.85 tCO₂e / wet tonne</td>
                  <td className="py-2 px-3 text-gray-400">IPCC Guidelines Vol. 5</td>
                  <td className="py-2 px-3">Avoided methane</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">Biochar Fixed Carbon</td>
                  <td className="py-2 px-3 font-mono text-emerald-400">78% C, 80% 100-yr</td>
                  <td className="py-2 px-3 text-gray-400">European Biochar Certificate</td>
                  <td className="py-2 px-3">Soil carbon storage</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">Biomethane Displacement</td>
                  <td className="py-2 px-3 font-mono text-emerald-400">2.2 kg CO₂e / kg CBG</td>
                  <td className="py-2 px-3 text-gray-400">MNRE (SATAT)</td>
                  <td className="py-2 px-3">Fossil gas displacement</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Next Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#1e332f]">
          <Link
            href="/platform/routes"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Route
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/platform"
              className="px-4 py-2.5 rounded-xl text-xs font-medium border border-[#1e332f] bg-[#0e1514] text-gray-300 hover:text-white transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/platform/waste"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <span>New Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
