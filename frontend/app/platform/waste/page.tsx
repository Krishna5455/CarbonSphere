'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import { WasteStreamInput, OptimizationObjective } from '@/lib/types';
import { analyzeWasteStream } from '@/lib/api';
import { saveCurrentRun } from '@/lib/store';
import { Sparkles, Layers, Sliders, MapPin, ArrowRight, Loader2, Info } from 'lucide-react';

const PRESET_SCENARIOS: { label: string; data: WasteStreamInput }[] = [
  {
    label: '25t Agricultural Biomass (Bagasse)',
    data: {
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
    label: '40t Food-Processing Sludge',
    data: {
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
    label: '15t Sorted Cellulosic Fiber',
    data: {
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

export default function WasteProfilerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<WasteStreamInput>(PRESET_SCENARIOS[0].data);
  const [objective, setObjective] = useState<OptimizationObjective>('balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePresetSelect = (preset: WasteStreamInput) => {
    setFormData(preset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await analyzeWasteStream(formData, objective);
      saveCurrentRun(result, formData);
      router.push('/platform/recommendations');
    } catch (err: any) {
      console.error('Optimization error:', err);
      setErrorMsg(err.message || 'Failed to connect to optimization engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c0b] text-[#f1f5f4] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Waste Profiler</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Define Waste Feedstock
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Enter waste specifications to determine compatibility across Biochar, Biogas, and Carbon Materials.
          </p>
        </div>

        {/* Preset Chips */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Quick Load Demo Feedstocks:
          </span>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_SCENARIOS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePresetSelect(preset.data)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                  formData.title === preset.data.title
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-[#0e1514] border-[#1e332f] text-gray-300 hover:border-gray-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profiler Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Stream & Generator Metadata */}
            <div className="glass-panel p-6 rounded-2xl border border-[#1e332f] space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Origin & Details
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Batch Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Generator Name</label>
                  <input
                    type="text"
                    required
                    value={formData.generator_name}
                    onChange={(e) => setFormData({ ...formData, generator_name: e.target.value })}
                    className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Waste Type</label>
                  <input
                    type="text"
                    required
                    value={formData.waste_type}
                    onChange={(e) => setFormData({ ...formData, waste_type: e.target.value })}
                    className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Quantity (Tonnes)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={formData.quantity_tonnes}
                      onChange={(e) => setFormData({ ...formData, quantity_tonnes: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Origin Location</label>
                    <input
                      type="text"
                      required
                      value={formData.location_name}
                      onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                      className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Physical & Chemical Characteristics */}
            <div className="glass-panel p-6 rounded-2xl border border-[#1e332f] space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Characteristics
              </h3>

              <div className="space-y-4 text-xs">
                {/* Moisture Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 font-medium">Moisture Content</span>
                    <span className="text-white font-mono font-bold">{formData.moisture_pct.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="95"
                    step="0.5"
                    value={formData.moisture_pct}
                    onChange={(e) => setFormData({ ...formData, moisture_pct: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                    <span>Dry / Pyrolysis (&lt;25%)</span>
                    <span>Slurry / Biogas (&gt;65%)</span>
                  </div>
                </div>

                {/* Ash Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 font-medium">Ash Content</span>
                    <span className="text-white font-mono font-bold">{formData.ash_pct.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    value={formData.ash_pct}
                    onChange={(e) => setFormData({ ...formData, ash_pct: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Contamination Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 font-medium">Contamination Rate</span>
                    <span className="text-white font-mono font-bold">{formData.contamination_pct.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={formData.contamination_pct}
                    onChange={(e) => setFormData({ ...formData, contamination_pct: parseFloat(e.target.value) })}
                    className="w-full accent-red-400 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">C:N Ratio</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.carbon_nitrogen_ratio || 30}
                      onChange={(e) => setFormData({ ...formData, carbon_nitrogen_ratio: parseFloat(e.target.value) || 30 })}
                      className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Energy Density (MJ/kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.energy_density_mj_kg || 15}
                      onChange={(e) => setFormData({ ...formData, energy_density_mj_kg: parseFloat(e.target.value) || 15 })}
                      className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Objective Selection Bar */}
          <div className="glass-panel p-6 rounded-2xl border border-[#1e332f] space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Optimization Objective
              </h3>
              <p className="text-xs text-gray-400">
                Choose how to rank candidate pathways and facilities
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {[
                { id: 'balanced', name: 'Balanced', desc: '30% Carbon • 25% Econ • 20% Logistics' },
                { id: 'max_carbon', name: 'Max Carbon', desc: 'Prioritize total emissions reduction' },
                { id: 'max_economic', name: 'Max Value', desc: 'Prioritize net circular margin' },
                { id: 'min_logistics', name: 'Min Distance', desc: 'Prioritize local facilities' },
                { id: 'max_diversion', name: 'Max Capacity', desc: 'Prioritize available facility headroom' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setObjective(opt.id as OptimizationObjective)}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    objective === opt.id
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-[#121c19] border-[#1e332f] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="font-bold text-xs text-white mb-1">{opt.name}</div>
                  <div className="text-[10px] text-gray-400 leading-snug">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <DisclaimerBanner className="flex-1" />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Pathways...</span>
                </>
              ) : (
                <>
                  <span>Find Optimal Pathway</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
