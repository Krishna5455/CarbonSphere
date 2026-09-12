'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import { Sparkles, ArrowRight, Flame, Droplets, Box, Compass, Truck, BarChart3, Layers, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';
import { analyzeWasteStream } from '@/lib/api';
import { saveCurrentRun } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardGridRef = useRef<HTMLDivElement>(null);

  const [activeWasteType, setActiveWasteType] = useState('agri');
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: 'power3.out'
      });
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.9,
        delay: 0.2,
        ease: 'power3.out'
      });
      gsap.from('.hero-badge', {
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: 'back.out(1.7)'
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleLaunchQuickDemo = async (type: string) => {
    setIsOptimizing(true);
    let payload = {
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

    if (type === 'food') {
      payload = {
        title: '40 Tonnes Food Processing Organic Residue',
        generator_name: 'Chakan Food & Brewery Industrial Hub',
        waste_type: 'Food Processing Organic Sludge',
        quantity_tonnes: 40.0,
        moisture_pct: 82.0,
        ash_pct: 2.1,
        carbon_nitrogen_ratio: 24.0,
        energy_density_mj_kg: 4.8,
        contamination_pct: 2.5,
        location_name: 'Chakan MIDC Phase 2, Pune, Maharashtra',
        latitude: 18.7597,
        longitude: 73.8580
      };
    } else if (type === 'fiber') {
      payload = {
        title: '15 Tonnes Post-Industrial Cellulosic Fiber',
        generator_name: 'Satara Clean Packaging Works',
        waste_type: 'Post-Industrial Cellulosic Fiber Scrap',
        quantity_tonnes: 15.0,
        moisture_pct: 9.0,
        ash_pct: 1.5,
        carbon_nitrogen_ratio: 65.0,
        energy_density_mj_kg: 15.5,
        contamination_pct: 0.8,
        location_name: 'Shirwal MIDC, Satara, Maharashtra',
        latitude: 18.1360,
        longitude: 73.9850
      };
    }

    try {
      const res = await analyzeWasteStream(payload, 'balanced');
      saveCurrentRun(res, payload);
      router.push('/platform/recommendations');
    } catch (e) {
      console.error(e);
      router.push('/platform/waste');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c0b] text-[#f1f5f4] flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar />

      {/* Atmospheric Glow Backdrops */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[450px] h-[450px] bg-teal-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-0 w-[550px] h-[550px] bg-emerald-700/5 rounded-full blur-[150px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col space-y-24 py-12 md:py-20">
        {/* HERO SECTION */}
        <section ref={heroRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Carbon-Aware Waste Pathway Optimization Platform</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1
              ref={titleRef}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
            >
              Don't optimize waste disposal.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Optimize waste utilization.
              </span>
            </h1>

            <p
              ref={subtitleRef}
              className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed pt-2"
            >
              What should your waste become? CarbonSphere identifies the highest-value circular pathway,
              compatible regional facility, optimized freight route, and verified carbon/economic dividend.
            </p>
          </div>

          {/* Quick Action CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/platform/waste"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Launch Pathway Optimizer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/demo"
              className="w-full sm:w-auto px-7 py-4 rounded-xl glass-panel hover:bg-white/10 text-white font-medium text-sm transition-all border border-[#1e332f] flex items-center justify-center gap-2"
            >
              <span>HackOut'26 Demo Scenarios</span>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>

          {/* Live Interactive Valorization Preview */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 text-left space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e332f] pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Live Waste Valorization Teaser
                  </h3>
                  <p className="text-xs text-gray-400">
                    Select a waste stream to test the multi-criteria optimization pipeline
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono self-start sm:self-auto">
                  Engine: Live Active
                </span>
              </div>

              {/* Stream Switcher Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'agri', title: '25t Agri Bagasse', type: 'Pyrolysis Match', icon: Flame, color: 'text-amber-400' },
                  { id: 'food', title: '40t Food Sludge', type: 'Biogas AD Match', icon: Droplets, color: 'text-sky-400' },
                  { id: 'fiber', title: '15t Cellulosic Fiber', type: 'Composite Match', icon: Box, color: 'text-purple-400' }
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveWasteType(t.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        activeWasteType === t.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-white'
                          : 'bg-[#121c19] border-[#1e332f] text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${t.color}`} />
                        <span className="font-bold text-xs text-white">{t.title}</span>
                      </div>
                      <div className="text-[11px] text-gray-400">{t.type}</div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Pathway Flow Diagram */}
              <div className="p-4 rounded-2xl bg-[#090f0e] border border-[#1e332f] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <div className="text-gray-400 text-[10px] uppercase">Input Stream</div>
                    <div className="text-white font-semibold">
                      {activeWasteType === 'agri' ? '25t Sugarcane Bagasse (14.5% Moisture)' : activeWasteType === 'food' ? '40t Organic Sludge (82% Moisture)' : '15t Industrial Fibers (9% Moisture)'}
                    </div>
                  </div>
                </div>

                <div className="text-emerald-400 font-bold hidden md:block">→</div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <div className="text-gray-400 text-[10px] uppercase">Evaluated Pathway</div>
                    <div className="text-emerald-300 font-semibold capitalize">
                      {activeWasteType === 'agri' ? 'Biochar Pyrolysis' : activeWasteType === 'food' ? 'Biogas / RNG Digestion' : 'Carbon-Negative Materials'}
                    </div>
                  </div>
                </div>

                <div className="text-emerald-400 font-bold hidden md:block">→</div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <div className="text-gray-400 text-[10px] uppercase">Carbon Benefit</div>
                    <div className="text-white font-semibold">
                      {activeWasteType === 'agri' ? '+31.4 tCO₂e Net Abatement' : activeWasteType === 'food' ? '+35.1 tCO₂e Net Abatement' : '+20.6 tCO₂e Net Abatement'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchQuickDemo(activeWasteType)}
                  disabled={isOptimizing}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-md shrink-0 disabled:opacity-50"
                >
                  {isOptimizing ? 'Optimizing...' : 'View Full Solution'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CORE PILLARS SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              A Decision Layer Built for Industrial Ecology
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Moving beyond basic logistics to solve the fundamental question: what should waste become?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[#1e332f] space-y-3 hover:border-amber-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Biochar Pyrolysis</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Transforms dry agricultural residues into recalcitrant biocarbon with 100-year carbon permanence,
                enriching soil microbiology while sequestering atmospheric carbon dioxide.
              </p>
              <div className="text-[11px] text-amber-300 font-mono pt-2">
                Ideal Feedstock: Dry Biomass (&lt;25% Moisture)
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#1e332f] space-y-3 hover:border-sky-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Biogas & CBG (AD)</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Diverts high-moisture organic food slurry from landfills, capturing fugitive methane to produce
                compressed bio-gas and nutrient-dense organic digestate fertilizer.
              </p>
              <div className="text-[11px] text-sky-300 font-mono pt-2">
                Ideal Feedstock: Organic Sludge (65-95% Moisture)
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#1e332f] space-y-3 hover:border-purple-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Carbon-Negative Materials</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Upcycles clean fibrous cellulose scrap into structural bio-composite panels and mineralized aggregates,
                directly displacing high-embodied carbon cement and synthetic resins.
              </p>
              <div className="text-[11px] text-purple-300 font-mono pt-2">
                Ideal Feedstock: Clean Fibers (&lt;15% Moisture, &lt;3% Ash)
              </div>
            </div>
          </div>
        </section>

        {/* METHODOLOGY & TRANSPARENCY BANNER */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
          <DisclaimerBanner />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#1e332f] bg-[#050807] py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-gray-300">CarbonSphere</span> — Carbon-Aware Waste Pathway Optimization Platform
          </div>
          <div>
            HackOut'26 Problem: Waste-to-Carbon Value Chain Tracker
          </div>
        </div>
      </footer>
    </div>
  );
}
