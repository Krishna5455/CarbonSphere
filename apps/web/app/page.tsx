'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import { FadeIn } from '@/components/motion/MotionWrapper';
import {
  Sparkles, ArrowRight, Flame, Droplets, Box, Compass,
  Truck, BarChart3, Layers, CheckCircle2, Building2, MapPin, ChevronRight
} from 'lucide-react';
import { analyzeWasteStream } from '@/lib/api';
import { saveCurrentRun } from '@/lib/store';
import { WasteStreamInput } from '@/lib/types';
import { useRouter } from 'next/navigation';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FIVE_STEP_FLOW = [
  { step: '01', name: 'Waste Stream', desc: 'Feedstock profiling & moisture analysis', icon: Layers, href: '/platform/waste' },
  { step: '02', name: 'Pathway Match', desc: 'Thermodynamic conversion feasibility', icon: Compass, href: '/platform/recommendations' },
  { step: '03', name: 'Facility Choice', desc: 'Capacity headroom & gate fees', icon: Building2, href: '/platform/recommendations' },
  { step: '04', name: 'Freight Route', desc: 'OSRM driving distance & logistics', icon: MapPin, href: '/platform/routes' },
  { step: '05', name: 'Impact Ledger', desc: 'Net carbon abatement & circular margin', icon: BarChart3, href: '/platform/impact' },
];

export default function HomePage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const flowContainerRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);

  const [activeWasteType, setActiveWasteType] = useState('agri');
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section reveal timeline
      gsap.from('.hero-badge-elem', {
        opacity: 0,
        y: -15,
        duration: 0.6,
        ease: 'power3.out'
      });
      gsap.from('.hero-title-elem', {
        opacity: 0,
        y: 25,
        duration: 0.8,
        delay: 0.15,
        ease: 'power3.out'
      });
      gsap.from('.hero-sub-elem', {
        opacity: 0,
        y: 15,
        duration: 0.7,
        delay: 0.3,
        ease: 'power3.out'
      });

      // ScrollTrigger for 5-Step Flow
      if (flowContainerRef.current) {
        gsap.from('.flow-step-card', {
          scrollTrigger: {
            trigger: flowContainerRef.current,
            start: 'top 80%',
          },
          opacity: 0,
          y: 30,
          stagger: 0.12,
          duration: 0.6,
          ease: 'power2.out'
        });
      }

      // ScrollTrigger for Pillars
      if (pillarsRef.current) {
        gsap.from('.pillar-card', {
          scrollTrigger: {
            trigger: pillarsRef.current,
            start: 'top 80%',
          },
          opacity: 0,
          y: 25,
          stagger: 0.15,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleLaunchQuickDemo = async (type: string) => {
    setIsOptimizing(true);
    let payload: WasteStreamInput = {
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

    if (type === 'food') {
      payload = {
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
      };
    } else if (type === 'fiber') {
      payload = {
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
    <div className="min-h-screen bg-[#060908] text-[#f3f7f6] flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar />

      {/* Subtle Restrained Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-emerald-500/8 rounded-full blur-[140px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col space-y-24 py-12 md:py-20">
        {/* HERO SECTION */}
        <section ref={heroRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="hero-badge-elem inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Carbon-Aware Waste Pathway Optimization</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="hero-title-elem text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              What should your waste become?
            </h1>

            <p className="hero-sub-elem text-base sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed pt-1">
              CarbonSphere pairs thermodynamic feedstock profiling with multi-criteria optimization to find the highest-value circular pathway, compatible facility, and route.
            </p>
          </div>

          {/* Primary Product CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/platform/waste" className="cs-button-primary w-full sm:w-auto">
              <span>Start Waste Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link href="/demo" className="cs-button-secondary w-full sm:w-auto">
              <span>Demo Benchmarks</span>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>

          {/* Interactive Optimization Engine Preview */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="cs-card p-6 sm:p-8 text-left space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182a25] pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Interactive Pathway Engine
                  </h3>
                  <p className="text-xs text-gray-400">
                    Select a waste feedstock profile to evaluate pathway compatibility
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-mono self-start sm:self-auto border border-emerald-500/30">
                  Engine Ready
                </span>
              </div>

              {/* Feedstock Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'agri', title: '25t Agri Bagasse', type: 'Pyrolysis Match', icon: Flame, color: 'text-amber-400' },
                  { id: 'food', title: '40t Food Sludge', type: 'Biogas Match', icon: Droplets, color: 'text-sky-400' },
                  { id: 'fiber', title: '15t Cellulosic Fiber', type: 'Composite Match', icon: Box, color: 'text-purple-400' }
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeWasteType === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveWasteType(t.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-md'
                          : 'bg-[#0f1715] border-[#182a25] text-gray-400 hover:border-gray-600'
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

              {/* Decision Flow Pipeline Bar */}
              <div className="p-4 rounded-2xl bg-[#090f0d] border border-[#182a25] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">Feedstock Input</div>
                    <div className="text-white font-semibold">
                      {activeWasteType === 'agri' ? '25t Bagasse (14.5% Moisture)' : activeWasteType === 'food' ? '40t Food Sludge (82% Moisture)' : '15t Cellulosic Scrap (9% Moisture)'}
                    </div>
                  </div>
                </div>

                <div className="text-emerald-400 font-bold hidden md:block">→</div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">Optimal Pathway</div>
                    <div className="text-emerald-300 font-semibold capitalize">
                      {activeWasteType === 'agri' ? 'Biochar Pyrolysis' : activeWasteType === 'food' ? 'Biogas Digestion' : 'Carbon-Negative Materials'}
                    </div>
                  </div>
                </div>

                <div className="text-emerald-400 font-bold hidden md:block">→</div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">Estimated Net Impact</div>
                    <div className="text-white font-semibold">
                      {activeWasteType === 'agri' ? '+39.0 tCO₂e Net Abatement' : activeWasteType === 'food' ? '+38.7 tCO₂e Net Abatement' : '+25.9 tCO₂e Net Abatement'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchQuickDemo(activeWasteType)}
                  disabled={isOptimizing}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-md shrink-0 disabled:opacity-50"
                >
                  {isOptimizing ? 'Evaluating...' : 'Run Scenario'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5-STEP DECISION CHAIN (GSAP ScrollTrigger Reveal) */}
        <section ref={flowContainerRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              End-to-End Decision Chain
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              How CarbonSphere transforms raw waste parameters into an operational pathway recommendation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {FIVE_STEP_FLOW.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.step}
                  href={item.href}
                  className="flow-step-card cs-card-interactive p-5 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-gray-400 group-hover:text-emerald-400 transition-colors">
                      <span className="text-xs font-mono font-bold text-emerald-400/80">
                        {item.step}
                      </span>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-400/80 group-hover:text-emerald-300 transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CORE PILLARS SECTION */}
        <section ref={pillarsRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Supported Conversion Pathways
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Quantitative feedstock matching aligned with thermodynamic processing bounds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="pillar-card cs-card p-6 space-y-3 hover:border-amber-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Biochar Pyrolysis</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Converts dry agricultural crop residues into stable biocarbon, sequestering recalcitrant carbon with 100-year permanence.
              </p>
              <div className="text-[11px] text-amber-300 font-mono pt-2">
                Ideal Feedstock: Dry Biomass (&lt;25% Moisture)
              </div>
            </div>

            <div className="pillar-card cs-card p-6 space-y-3 hover:border-sky-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-4 border border-sky-500/30">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Biogas & CBG</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Processes wet organic slurries through anaerobic digestion to yield compressed biomethane fuel and displace fossil natural gas.
              </p>
              <div className="text-[11px] text-sky-300 font-mono pt-2">
                Ideal Feedstock: Organic Slurry (65–95% Moisture)
              </div>
            </div>

            <div className="pillar-card cs-card p-6 space-y-3 hover:border-purple-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/30">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Carbon-Negative Materials</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Upcycles clean post-industrial cellulose scrap into structural bio-composites, displacing carbon-intensive Portland cement and synthetic resins.
              </p>
              <div className="text-[11px] text-purple-300 font-mono pt-2">
                Ideal Feedstock: Clean Fibers (&lt;15% Moisture)
              </div>
            </div>
          </div>
        </section>

        {/* METHODOLOGY BANNER */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
          <DisclaimerBanner />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#182a25] bg-[#040605] py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-gray-300">CarbonSphere</span> — Carbon-Aware Waste Pathway Optimization Platform
          </div>
          <div className="font-mono text-[11px]">
            HackOut'26 Problem: Waste-to-Carbon Value Chain Tracker
          </div>
        </div>
      </footer>
    </div>
  );
}
