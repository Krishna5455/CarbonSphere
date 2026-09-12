'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import dynamic from 'next/dynamic';

const CarbonMap = dynamic(() => import('@/components/map/CarbonMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] rounded-2xl bg-[#0e1514] border border-[#1e332f] flex items-center justify-center text-xs text-gray-400 font-mono">
      Loading Map Engine...
    </div>
  )
});
import { OptimizationResult, WasteStreamInput, CandidateEvaluation, RouteGeometry } from '@/lib/types';
import { getCurrentRun, saveCurrentRun } from '@/lib/store';
import { analyzeWasteStream, fetchRoute } from '@/lib/api';
import { MapPin, Navigation, Truck, Fuel, Clock, ArrowRight, RefreshCw } from 'lucide-react';

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

export default function RoutesPage() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [waste, setWaste] = useState<WasteStreamInput | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [activeRouteGeometry, setActiveRouteGeometry] = useState<RouteGeometry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = getCurrentRun();
      if (stored.result && stored.waste) {
        setResult(stored.result);
        setWaste(stored.waste);
        setSelectedCandidateId(stored.result.recommended_facility_id);
        setActiveRouteGeometry(stored.result.route_geometry);
        setIsLoading(false);
      } else {
        try {
          const res = await analyzeWasteStream(DEFAULT_WASTE, 'balanced');
          saveCurrentRun(res, DEFAULT_WASTE);
          setResult(res);
          setWaste(DEFAULT_WASTE);
          setSelectedCandidateId(res.recommended_facility_id);
          setActiveRouteGeometry(res.route_geometry);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    load();
  }, []);

  // When selectedCandidateId changes, update the route polyline geometry accordingly
  useEffect(() => {
    if (!result || !waste || !selectedCandidateId) return;

    if (selectedCandidateId === result.recommended_facility_id && result.route_geometry) {
      setActiveRouteGeometry(result.route_geometry);
      return;
    }

    const candidate = result.ranked_candidates.find((c) => c.facility_id === selectedCandidateId);
    if (candidate && candidate.latitude && candidate.longitude) {
      fetchRoute(waste.latitude, waste.longitude, candidate.latitude, candidate.longitude)
        .then((routeData) => {
          if (routeData.geometry) {
            setActiveRouteGeometry(routeData.geometry as RouteGeometry);
          }
        })
        .catch((err) => {
          console.warn('Fallback: Unable to calculate alternate candidate route:', err);
        });
    }
  }, [selectedCandidateId, result, waste]);

  if (isLoading || !result || !waste) {
    return (
      <div className="min-h-screen bg-[#080c0b] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-sm text-gray-400 font-mono">Loading Route...</p>
        </div>
      </div>
    );
  }

  const selectedCandidate = result.ranked_candidates.find((c) => c.facility_id === selectedCandidateId) || result.ranked_candidates[0];
  const isRecommended = selectedCandidate.facility_id === result.recommended_facility_id;

  return (
    <div className="min-h-screen bg-[#080c0b] text-[#f1f5f4] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e332f] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MapPin className="w-3.5 h-3.5" />
              <span>Step 3</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Route & Logistics
            </h1>
            <p className="text-sm text-gray-400">
              How the waste reaches the selected facility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/platform/recommendations"
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[#1e332f] bg-[#0e1514] text-gray-300 hover:text-white transition-colors"
            >
              ← Recommendations
            </Link>
            <Link
              href="/platform/impact"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <span>View Impact</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Operational Decision Summary Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-[#0e1715] to-[#080c0b] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div>
            <div className="text-[10px] uppercase font-semibold text-gray-400">Waste Batch</div>
            <div className="font-bold text-white mt-0.5 font-mono">{waste.quantity_tonnes}t</div>
            <div className="text-[10px] text-gray-500 truncate">{waste.waste_type}</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold text-gray-400">Target Pathway</div>
            <div className="font-bold text-emerald-400 mt-0.5 uppercase tracking-wide">
              {selectedCandidate.pathway.replace('_', ' ')}
            </div>
            <div className="text-[10px] text-gray-500">Selected technology</div>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <div className="text-[10px] uppercase font-semibold text-gray-400">Destination Facility</div>
            <div className="font-bold text-white mt-0.5 truncate">{selectedCandidate.facility_name}</div>
            <div className="text-[10px] text-gray-500 truncate">{selectedCandidate.facility_location}</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold text-gray-400">Transit Distance</div>
            <div className="font-bold font-mono text-sky-400 mt-0.5">{selectedCandidate.distance_km.toFixed(1)} km</div>
            <div className="text-[10px] text-gray-500">~{selectedCandidate.duration_hrs.toFixed(1)} hrs road transit</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold text-gray-400">Freight Logistics</div>
            <div className="font-bold font-mono text-amber-300 mt-0.5">₹{selectedCandidate.transport_cost_inr.toLocaleString()}</div>
            <div className="text-[10px] text-gray-500">{selectedCandidate.transport_emissions_tco2e.toFixed(2)} tCO₂e freight</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold text-gray-400">Active Objective</div>
            <div className="font-bold text-white mt-0.5 capitalize">
              {result.objective.replace('_', ' ')}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">Score: {selectedCandidate.overall_score.toFixed(1)}/100</div>
          </div>
        </div>

        {/* Layout: Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map */}
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
              routeGeometry={activeRouteGeometry || result.route_geometry}
            />
          </div>

          {/* Operational Route Details Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Active Facility & Route Card */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e332f] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  Operational Route
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                    isRecommended
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {isRecommended ? '★ Recommended' : 'Alternative'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono text-gray-400 bg-[#121c19] border border-[#1e332f]">
                    {selectedCandidate.route_source === 'geodesic_fallback' ? 'Estimated Route' : 'Road Route'}
                  </span>
                </div>
              </div>

              {/* Origin → Destination */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Origin (Generator)</div>
                    <div className="font-bold text-white text-sm">{waste.generator_name}</div>
                    <div className="text-gray-400 text-[11px]">{waste.location_name}</div>
                  </div>
                </div>

                <div className="ml-1.5 pl-3 border-l-2 border-dashed border-[#1e332f] py-1 text-[11px] text-gray-400">
                  <span className="font-mono text-emerald-400 font-bold">{selectedCandidate.distance_km.toFixed(1)} km</span>{' '}
                  {selectedCandidate.route_source === 'geodesic_fallback' ? 'estimated distance (geodesic)' : 'road network transit'}
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Destination Facility</div>
                    <div className="font-bold text-white text-sm">{selectedCandidate.facility_name}</div>
                    <div className="text-gray-400 text-[11px]">{selectedCandidate.facility_location} ({selectedCandidate.operator})</div>
                  </div>
                </div>
              </div>

              {/* Key Route Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-[#121c19] border border-[#1e332f]">
                  <div className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Travel Time</span>
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {selectedCandidate.duration_hrs.toFixed(1)} hrs
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#121c19] border border-[#1e332f]">
                  <div className="text-gray-400 flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    <span>Freight CO₂e</span>
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                    {selectedCandidate.transport_emissions_tco2e.toFixed(2)} t
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121c19] border border-[#1e332f] text-xs">
                <div className="flex justify-between text-gray-300">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-gray-400" />
                    Estimated Freight Cost
                  </span>
                  <span className="font-bold font-mono text-amber-300">₹{selectedCandidate.transport_cost_inr.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Compare Alternative Facilities */}
            <div className="glass-panel p-4 rounded-2xl border border-[#1e332f] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-300 uppercase tracking-wider">
                  Compare Facilities
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {result.ranked_candidates.length} evaluative options
                </span>
              </div>
              
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {result.ranked_candidates.map((c, idx) => {
                  const isSelected = selectedCandidateId === c.facility_id;
                  const isOptimal = c.facility_id === result.recommended_facility_id;
                  return (
                    <button
                      key={c.facility_id}
                      onClick={() => setSelectedCandidateId(c.facility_id)}
                      className={`w-full text-left p-3 rounded-xl text-xs border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500/50 shadow-md'
                          : 'bg-[#121c19] border-[#1e332f] text-gray-400 hover:text-white hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500 font-bold">#{idx + 1}</span>
                        <span className="font-semibold text-gray-200 truncate flex-1">{c.facility_name}</span>
                        {isOptimal ? (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                            Recommended
                          </span>
                        ) : (
                          <span className="shrink-0 text-[9px] font-mono text-gray-400">
                            Score: {c.overall_score.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                        <span>{c.distance_km.toFixed(1)} km · ~{c.duration_hrs.toFixed(1)} hrs</span>
                        <span className="text-amber-300 font-mono">₹{c.transport_cost_inr.toLocaleString()} freight</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom CTA */}
            <Link
              href="/platform/impact"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <span>View Impact Ledger</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <DisclaimerBanner />
      </main>
    </div>
  );
}
