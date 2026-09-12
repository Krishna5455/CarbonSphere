'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import CarbonMap from '@/components/map/CarbonMap';
import { OptimizationResult, WasteStreamInput, CandidateEvaluation } from '@/lib/types';
import { getCurrentRun, saveCurrentRun } from '@/lib/store';
import { analyzeWasteStream } from '@/lib/api';
import { MapPin, Navigation, Truck, Fuel, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

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

export default function RoutesPage() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [waste, setWaste] = useState<WasteStreamInput | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = getCurrentRun();
      if (stored.result && stored.waste) {
        setResult(stored.result);
        setWaste(stored.waste);
        setSelectedCandidateId(stored.result.recommended_facility_id);
        setIsLoading(false);
      } else {
        try {
          const res = await analyzeWasteStream(DEFAULT_WASTE, 'balanced');
          saveCurrentRun(res, DEFAULT_WASTE);
          setResult(res);
          setWaste(DEFAULT_WASTE);
          setSelectedCandidateId(res.recommended_facility_id);
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
          <p className="text-gray-400 text-sm font-mono animate-pulse">Loading Route Logistics...</p>
        </div>
      </div>
    );
  }

  const selectedCandidate = result.ranked_candidates.find((c) => c.facility_id === selectedCandidateId) || result.ranked_candidates[0];

  return (
    <div className="min-h-screen bg-[#080c0b] text-[#f1f5f4] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e332f] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <Truck className="w-3.5 h-3.5" />
              <span>Carbon-Aware Freight Logistics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Optimized Transportation Corridor
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Evaluating transit emissions and fuel burn across regional highway infrastructure
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/platform/recommendations"
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[#1e332f] bg-[#0e1514] text-gray-300 hover:text-white"
            >
              Back to Recommendations
            </Link>
          </div>
        </div>

        {/* Layout: Map and Route Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map View */}
          <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-[#1e332f]">
            <CarbonMap
              className="w-full h-[620px]"
              origin={{
                lat: waste.latitude,
                lon: waste.longitude,
                name: waste.generator_name,
                wasteType: waste.waste_type
              }}
              facilities={result.ranked_candidates}
              recommendedId={selectedCandidateId || result.recommended_facility_id}
              routeGeometry={result.route_geometry}
            />
          </div>

          {/* Logistics Metrics & Candidate Selector */}
          <div className="lg:col-span-4 space-y-4">
            {/* Active Corridor Card */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e332f] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  Corridor Breakdown
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Active Transit
                </span>
              </div>

              {/* Waypoints */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Origin (Generator)</div>
                    <div className="font-bold text-white text-sm">{waste.generator_name}</div>
                    <div className="text-gray-400 text-[11px]">{waste.location_name}</div>
                  </div>
                </div>

                <div className="ml-1.5 pl-3 border-l-2 border-dashed border-[#1e332f] py-1 text-[11px] text-gray-500">
                  {selectedCandidate.distance_km.toFixed(1)} km freight corridor
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Destination (Facility)</div>
                    <div className="font-bold text-white text-sm">{selectedCandidate.facility_name}</div>
                    <div className="text-gray-400 text-[11px]">{selectedCandidate.facility_location}</div>
                  </div>
                </div>
              </div>

              {/* Numerical Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-[#121c19] border border-[#1e332f]">
                  <div className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Duration</span>
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {selectedCandidate.duration_hrs.toFixed(1)} hrs
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Heavy Truck Transit</div>
                </div>

                <div className="p-3 rounded-xl bg-[#121c19] border border-[#1e332f]">
                  <div className="text-gray-400 flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    <span>Transport CO₂e</span>
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                    {selectedCandidate.transport_emissions_tco2e.toFixed(2)} t
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">GLEC Factor: 0.096 kg/t-km</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121c19] border border-[#1e332f] text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Logistics Freight Cost:</span>
                  <span className="font-bold font-mono text-amber-300">₹{selectedCandidate.transport_cost_inr.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Includes base loading (₹100/t) + road freight tariff (₹6.50/t-km)
                </div>
              </div>
            </div>

            {/* Candidate Route Selectors */}
            <div className="glass-panel p-4 rounded-2xl border border-[#1e332f] space-y-2.5">
              <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Compare Alternate Routes
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {result.ranked_candidates.map((c) => (
                  <button
                    key={c.facility_id}
                    onClick={() => setSelectedCandidateId(c.facility_id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs border transition-all ${
                      selectedCandidateId === c.facility_id
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-[#121c19] border-[#1e332f] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-gray-200 truncate">{c.facility_name}</div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>{c.distance_km.toFixed(1)} km</span>
                      <span className="text-emerald-400">+{c.net_carbon_impact_tco2e.toFixed(1)} t CO₂e</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DisclaimerBanner />
      </main>
    </div>
  );
}
