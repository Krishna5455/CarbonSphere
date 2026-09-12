'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import { OptimizationResult, WasteStreamInput } from '@/lib/types';
import { getCurrentRun, saveCurrentRun } from '@/lib/store';
import { analyzeWasteStream } from '@/lib/api';
import { BarChart3, FileSpreadsheet, ShieldAlert, CheckCircle2, ArrowRight, Download, Leaf, DollarSign } from 'lucide-react';

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
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm font-mono animate-pulse">Generating Audit Trail...</p>
        </div>
      </div>
    );
  }

  const winner = result.ranked_candidates.find((c) => c.facility_id === result.recommended_facility_id);

  return (
    <div className="min-h-screen bg-[#080c0b] text-[#f1f5f4] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e332f] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Transparent Carbon & Economic Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Impact Audit & Emission Factor Ledger
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Traceable accounting ledger for {waste.quantity_tonnes}t {waste.waste_type} routed to {result.recommended_facility_name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[#1e332f] bg-[#0e1514] text-gray-300 hover:text-white flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit PDF</span>
            </button>
            <Link
              href="/platform/recommendations"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400"
            >
              Recommendations
            </Link>
          </div>
        </div>

        <DisclaimerBanner />

        {/* Ledger Grid: Carbon Ledger & Economic Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carbon Accounting Balance Sheet */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e332f] pb-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Carbon Abatement Balance Sheet
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">Units: tCO₂e</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                <div>
                  <div className="font-semibold text-white">Gross Avoided Baseline Emissions</div>
                  <div className="text-[10px] text-gray-400">Avoided open crop burning / landfill decomposition</div>
                </div>
                <div className="text-base font-bold font-mono text-emerald-400">
                  +{result.gross_carbon_avoided_tco2e.toFixed(2)}
                </div>
              </div>

              {winner && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                  <div>
                    <div className="font-semibold text-white">Permanent Biogenic Sequestration</div>
                    <div className="text-[10px] text-gray-400">Fixed stable carbon retention (100-year permanence)</div>
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    +{winner.permanent_sequestration_tco2e.toFixed(2)}
                  </div>
                </div>
              )}

              {winner && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                  <div>
                    <div className="font-semibold text-white">Conversion Process Emissions</div>
                    <div className="text-[10px] text-gray-400">Thermal heating & electrical shredder power</div>
                  </div>
                  <div className="text-base font-bold font-mono text-amber-400">
                    -{winner.process_emissions_tco2e.toFixed(2)}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                <div>
                  <div className="font-semibold text-white">Freight Transport Emissions</div>
                  <div className="text-[10px] text-gray-400">
                    {result.total_distance_km.toFixed(1)} km transit @ 0.096 kg CO₂e / t-km
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
                  <div className="text-[10px] text-emerald-300">Net atmospheric atmospheric abatement dividend</div>
                </div>
                <div className="text-xl font-extrabold font-mono text-emerald-300">
                  +{result.net_carbon_impact_tco2e.toFixed(2)} tCO₂e
                </div>
              </div>
            </div>
          </div>

          {/* Economic Balance Sheet */}
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e332f] pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Circular Financial Ledger
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">Units: INR (₹)</span>
            </div>

            <div className="space-y-3 text-xs">
              {winner && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                  <div>
                    <div className="font-semibold text-white">Byproduct Commercial Value</div>
                    <div className="text-[10px] text-gray-400">
                      Yield: {winner.byproduct_yield_tonnes.toFixed(1)}t marketable end-product
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
                    <div className="font-semibold text-white">Feedstock Gate Transaction</div>
                    <div className="text-[10px] text-gray-400">
                      {winner.gate_fee_revenue_or_cost_inr >= 0 ? 'Feedstock purchase credit' : 'Disposal tipping fee'}
                    </div>
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {winner.gate_fee_revenue_or_cost_inr >= 0 ? '+' : ''}₹{winner.gate_fee_revenue_or_cost_inr.toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center p-3 rounded-lg bg-[#121c19] border border-[#1e332f]">
                <div>
                  <div className="font-semibold text-white">Freight Logistics Expense</div>
                  <div className="text-[10px] text-gray-400">
                    Loading & hauling over {result.total_distance_km.toFixed(1)} km
                  </div>
                </div>
                <div className="text-base font-bold font-mono text-sky-400">
                  -₹{result.transport_cost_inr.toLocaleString()}
                </div>
              </div>

              {/* Net Circular Margin */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-amber-950/20 border border-amber-500/50 mt-4">
                <div>
                  <div className="font-extrabold text-sm text-white">Net Circular Value</div>
                  <div className="text-[10px] text-amber-300">Total economic surplus generated across value chain</div>
                </div>
                <div className="text-xl font-extrabold font-mono text-amber-300">
                  ₹{result.net_economic_value_inr.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Methodology Transparency Table */}
        <div className="glass-panel p-6 rounded-2xl border border-[#1e332f] space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Scientific Assumptions & Traceability Framework
          </h3>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e332f] text-gray-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">Parameter</th>
                  <th className="py-2.5 px-3">Adopted Value</th>
                  <th className="py-2.5 px-3">Standard / Source Reference</th>
                  <th className="py-2.5 px-3">Scope & Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e332f] text-gray-300">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Heavy-Duty Freight EF</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400">0.096 kg CO₂e / (tonne·km)</td>
                  <td className="py-2.5 px-3 text-gray-400">GLEC Framework v3.0 (Class 8 Diesel)</td>
                  <td className="py-2.5 px-3">Regional highway haulage emissions</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Landfill Methane FOD</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400">0.85 tCO₂e / wet tonne diverted</td>
                  <td className="py-2.5 px-3 text-gray-400">IPCC Guidelines for GHG Inventories Vol. 5</td>
                  <td className="py-2.5 px-3">Avoided methane formation in anaerobic landfills</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Biochar Fixed Carbon</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400">78% C, 80% 100-yr permanence</td>
                  <td className="py-2.5 px-3 text-gray-400">European Biochar Certificate (EBC) Standard</td>
                  <td className="py-2.5 px-3">Stable recalcitrant soil biocarbon sequestration</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Biomethane Fossil Displacement</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400">2.2 kg CO₂e / kg CBG</td>
                  <td className="py-2.5 px-3 text-gray-400">Ministry of New & Renewable Energy (SATAT)</td>
                  <td className="py-2.5 px-3">Displacement of fossil compressed natural gas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
