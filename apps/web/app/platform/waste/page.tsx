'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import { WasteStreamInput, OptimizationObjective } from '@/lib/types';
import { analyzeWasteStream } from '@/lib/api';
import { saveCurrentRun } from '@/lib/store';
import { Layers, Sparkles, MapPin, ArrowRight, Loader2 } from 'lucide-react';

const PRESET_SCENARIOS: { label: string; data: WasteStreamInput }[] = [
  {
    label: '25t Agricultural Biomass',
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
    label: '40t Food Sludge',
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
    label: '15t Cellulosic Fiber',
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

const OBJECTIVES: { id: OptimizationObjective; name: string; desc: string }[] = [
  { id: 'balanced', name: 'Balanced', desc: 'Carbon, cost, and logistics combined' },
  { id: 'max_carbon', name: 'Max Carbon', desc: 'Highest net emissions reduction' },
  { id: 'max_economic', name: 'Max Value', desc: 'Highest net economic margin' },
  { id: 'min_logistics', name: 'Min Distance', desc: 'Shortest transit and logistics' },
  { id: 'max_diversion', name: 'Max Capacity', desc: 'Highest facility capacity headroom' },
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-[#1e332f] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span>Step 1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Define Your Waste
          </h1>
          <p className="text-sm text-gray-400">
            Tell CarbonSphere what you have. We'll determine what it can become.
          </p>

          {/* Quick Preset Bar */}
          <div className="pt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Quick Presets:</span>
            {PRESET_SCENARIOS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(preset.data)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  formData.title === preset.data.title
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-[#121c19] border-[#1e332f] text-gray-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profiler Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            {/* Section 1: Waste Stream */}
            <div className="glass-panel p-6 rounded-2xl border border-[#1e332f] space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1e332f] pb-3">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  1. Waste Stream
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Waste Type / Feedstock</label>
                  <input
                    type="text"
                    required
                    value={formData.waste_type}
                    onChange={(e) => setFormData({ ...formData, waste_type: e.target.value })}
                    className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g., Agricultural Biomass / Bagasse"
                  />
                </div>

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
                  <label className="block text-gray-300 mb-1 font-medium">Stream / Batch Name</label>
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
              </div>
            </div>

            {/* Section 2: Characteristics */}
            <div className="glass-panel p-6 rounded-2xl border border-[#1e332f] space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1e332f] pb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Characteristics
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                {/* Moisture */}
                <div className="p-3.5 rounded-xl bg-[#121c19] border border-[#1e332f] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Moisture</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">
                      {formData.moisture_pct.toFixed(1)}%
                    </span>
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
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Dry (&lt;25%)</span>
                    <span>Wet (&gt;65%)</span>
                  </div>
                </div>

                {/* Ash */}
                <div className="p-3.5 rounded-xl bg-[#121c19] border border-[#1e332f] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Ash</span>
                    <span className="text-amber-400 font-mono font-bold text-sm">
                      {formData.ash_pct.toFixed(1)}%
                    </span>
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
                  <div className="text-[10px] text-gray-500">Inorganic mineral residue</div>
                </div>

                {/* Contamination */}
                <div className="p-3.5 rounded-xl bg-[#121c19] border border-[#1e332f] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Contamination</span>
                    <span className="text-red-400 font-mono font-bold text-sm">
                      {formData.contamination_pct.toFixed(1)}%
                    </span>
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
                  <div className="text-[10px] text-gray-500">Foreign matter tolerance</div>
                </div>
              </div>

              {/* Numerical Input: C:N Ratio */}
              <div className="pt-1 text-xs sm:w-1/2">
                <label className="block text-gray-300 mb-1 font-medium">C:N Ratio (Carbon-to-Nitrogen)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={formData.carbon_nitrogen_ratio || 30}
                  onChange={(e) => setFormData({ ...formData, carbon_nitrogen_ratio: parseFloat(e.target.value) || 30 })}
                  className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Section 3: Origin */}
            <div className="glass-panel p-6 rounded-2xl border border-[#1e332f] space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1e332f] pb-3">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    3. Origin
                  </h2>
                  <p className="text-xs text-gray-400">Where is the waste generated?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-1">
                  <label className="block text-gray-300 mb-1 font-medium">Location Name</label>
                  <input
                    type="text"
                    required
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
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
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#121c19] border border-[#1e332f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Objective: What matters most? */}
            <div className="glass-panel p-6 rounded-2xl border border-[#1e332f] space-y-3">
              <h3 className="text-sm font-bold text-white tracking-wide">
                What matters most?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
                {OBJECTIVES.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setObjective(opt.id)}
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
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <DisclaimerBanner className="flex-1" />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Pathways...</span>
                </>
              ) : (
                <>
                  <span>Find Best Pathway</span>
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
