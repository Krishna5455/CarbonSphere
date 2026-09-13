'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import {
  ArrowRight, Flame, Droplets, Box, Compass,
  Truck, BarChart3, Layers, CheckCircle2, Building2,
  MapPin, ChevronRight, Zap, Scale, ShieldCheck,
  Gauge, Target, Activity, TrendingUp, Sparkles,
  Cpu, Navigation, ArrowUpRight, Leaf
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ============================================================
   Section 1: HERO — THE WASTE
   ============================================================ */
function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const ctx = gsap.context(() => {
      // Hero entrance with fromTo and clearProps
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.hero-trail', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, clearProps: 'opacity,transform' })
        .fromTo('.hero-heading', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, clearProps: 'opacity,transform' }, '-=0.3')
        .fromTo('.hero-subtext', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, clearProps: 'opacity,transform' }, '-=0.4')
        .fromTo('.hero-cta-group', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, clearProps: 'opacity,transform' }, '-=0.3')
        .fromTo('.hero-tags', { opacity: 0 }, { opacity: 1, duration: 0.5, clearProps: 'opacity,transform' }, '-=0.2');

      // Subtle parallax on hero bg
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          scale: 1.08,
          yPercent: 4,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cs-hero relative min-h-[92vh] flex items-center overflow-hidden" id="hero">
      {/* Cinematic Background Treatment */}
      <div className="cs-hero-bg absolute inset-0 z-0">
        <Image
          ref={bgRef}
          src="/hero-bg.png"
          alt="CarbonSphere Industrial & Waste Environment"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%] opacity-40 brightness-[0.65] saturate-[0.85]"
          style={{ willChange: 'transform' }}
        />
        {/* Layered cinematic vignette and atmospheric lighting */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#060908]/70 via-[#060908]/30 to-[#060908]" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#060908] via-transparent to-[#060908]/90" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-[1]" />
      </div>

      {/* Content */}
      <div className="cs-hero-content relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
        <div className="max-w-3xl">
          {/* Breadcrumb / Storyline Trail */}
          <div className="hero-trail inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[0.6875rem] uppercase tracking-[0.18em] text-emerald-400 font-semibold mb-6 shadow-sm shadow-emerald-500/10">
            <span>Waste</span>
            <span className="text-emerald-500/50">→</span>
            <span>Opportunity</span>
            <span className="text-emerald-500/50">→</span>
            <span className="text-emerald-300">A Cleaner Tomorrow</span>
          </div>

          {/* Main Heading */}
          <h1 className="hero-heading text-4xl sm:text-6xl lg:text-[5.25rem] font-extrabold tracking-[-0.03em] text-white leading-[1.08] mb-6">
            What should your waste{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              become?
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="hero-subtext text-base sm:text-lg text-gray-300/90 leading-relaxed max-w-2xl mb-10 font-normal">
            CarbonSphere evaluates pathways, facilities and logistics to find the highest-value circular outcome.
          </p>

          {/* CTAs */}
          <div className="hero-cta-group flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/platform/waste"
              className="cs-button-primary group shadow-lg shadow-emerald-500/20"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="cs-button-secondary group"
            >
              <span>Demo Benchmarks</span>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Metadata telemetry tags */}
          <div className="hero-tags flex flex-wrap items-center gap-4 sm:gap-6 mt-14 text-[0.6875rem] uppercase tracking-[0.16em] text-gray-400/80 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Feedstock Intelligence</span>
            </div>
            <span className="w-px h-3 bg-gray-700 hidden sm:inline-block" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>MCDA Optimization</span>
            </div>
            <span className="w-px h-3 bg-gray-700 hidden sm:inline-block" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Measurable Impact</span>
            </div>
          </div>
        </div>

        {/* Right-side vertical telemetry coordinates — desktop only */}
        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-end gap-3 text-[0.625rem] uppercase tracking-[0.2em] text-gray-500 font-mono border-r border-emerald-500/20 pr-4">
          <span className="text-gray-400">SYS.VER // 7.4B</span>
          <span className="text-emerald-400/80">GLEC & IPCC ALIGNED</span>
          <span className="text-gray-400">MULTI-CRITERIA ENGINE</span>
          <div className="mt-4 pt-4 border-t border-gray-800 text-right">
            <span className="text-gray-400 block font-semibold text-xs tracking-normal font-sans">
              Circular Infrastructure
            </span>
            <span className="text-[10px] text-gray-500 lowercase font-mono">
              decisions@scale
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 2: THE POSSIBILITIES — BRANCHING PATHWAYS
   ============================================================ */
function PossibilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredPathway, setHoveredPathway] = useState<string | null>(null);

  const pathways = [
    {
      id: 'biochar',
      name: 'Biochar',
      tagline: 'Stable Carbon for Soils',
      description: 'High-temperature pyrolysis converts solid biomass into persistent biogenic carbon, sequestering CO₂ for centuries while restoring soil biology.',
      icon: Flame,
      color: 'text-amber-400',
      accentColor: '#f59e0b',
      borderGlow: 'hover:border-amber-500/40 hover:shadow-amber-500/15',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      glowClass: 'cs-glow-amber',
      tags: ['Carbon Sequestration', '100+ Yr Permanence', 'Soil Regeneration'],
    },
    {
      id: 'biogas',
      name: 'Biogas',
      tagline: 'Clean Energy for Today',
      description: 'Anaerobic digestion transforms high-moisture organic residues into clean biomethane and biofertilizer, displacing fossil fuel dependencies.',
      icon: Droplets,
      color: 'text-cyan-400',
      accentColor: '#06b6d4',
      borderGlow: 'hover:border-cyan-500/40 hover:shadow-cyan-500/15',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      glowClass: 'cs-glow-cyan',
      tags: ['Renewable Energy', 'Fossil Displacement', 'Baseload Heat & Power'],
    },
    {
      id: 'carbon-materials',
      name: 'Carbon Materials',
      tagline: 'High-Value Circular Products',
      description: 'Advanced thermochemical processing converts complex waste into graphite substitutes, activated carbon, and circular polymer composites.',
      icon: Box,
      color: 'text-purple-400',
      accentColor: '#a855f7',
      borderGlow: 'hover:border-purple-500/40 hover:shadow-purple-500/15',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      glowClass: 'cs-glow-purple',
      tags: ['Advanced Materials', 'Industrial Circularity', 'High-Margin Output'],
    },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'restart none restart reset',
        },
        defaults: { ease: 'power2.out', duration: 0.5 },
      });

      tl.fromTo('.possibilities-label', { opacity: 0, y: 12 }, { opacity: 1, y: 0 })
        .fromTo('.possibilities-title', { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, '-=0.2')
        .fromTo('.possibilities-sub', { opacity: 0, y: 12 }, { opacity: 1, y: 0 }, '-=0.2')
        .fromTo('.origin-feedstock-box', { opacity: 0, y: 15, scale: 0.98 }, { opacity: 1, y: 0, scale: 1 }, '-=0.1')
        .fromTo('.pathway-card-item', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 }, '-=0.2');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cs-section relative border-t border-[#182a25]/60" id="possibilities">
      {/* Subtle ambient light glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="possibilities-label cs-section-label mb-3">02 — The Possibilities</div>
          <h2 className="possibilities-title cs-section-title mb-4">
            Waste doesn&apos;t have one{' '}
            <span className="highlight">destination.</span>
          </h2>
          <p className="possibilities-sub cs-section-subtitle mx-auto">
            The same material can become clean energy, stable carbon, or high-value products.
          </p>
        </div>

        {/* Central Origin Node */}
        <div className="origin-feedstock-box flex flex-col items-center justify-center mb-8 sm:mb-12">
          <div className="px-5 py-3 rounded-2xl bg-[#0e1614] border border-emerald-500/30 flex items-center gap-3 shadow-lg shadow-emerald-500/5 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Feedstock Input Stream
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                Organic, Agricultural & Industrial Biomass Residues
              </div>
            </div>
          </div>
        </div>

        {/* Branching Visuals & Pathway Cards */}
        <div className="relative">
          {/* Branching SVG connector lines — Desktop view */}
          <div className="hidden lg:block absolute -top-10 inset-x-0 h-16 pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 1000 64" preserveAspectRatio="none">
              {/* Central origin point: (500, 0) */}
              {/* Left branch to Biochar (166, 64) */}
              <path
                d="M 500 0 C 500 32, 166 20, 166 64"
                className={`cs-branch-path ${hoveredPathway === 'biochar' ? 'active-biochar' : ''}`}
              />
              {/* Center branch to Biogas (500, 64) */}
              <path
                d="M 500 0 C 500 24, 500 40, 500 64"
                className={`cs-branch-path ${hoveredPathway === 'biogas' ? 'active-biogas' : ''}`}
              />
              {/* Right branch to Carbon Materials (833, 64) */}
              <path
                d="M 500 0 C 500 32, 833 20, 833 64"
                className={`cs-branch-path ${hoveredPathway === 'carbon-materials' ? 'active-carbon-materials' : ''}`}
              />
            </svg>
          </div>

          {/* Pathway Cards Grid */}
          <div className="pathway-cards-container grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {pathways.map((p) => {
              const Icon = p.icon;
              const isHovered = hoveredPathway === p.id;
              const isDimmed = hoveredPathway !== null && !isHovered;

              return (
                <div
                  key={p.id}
                  className={`pathway-card-item cs-pathway-card ${p.id} flex flex-col justify-between transition-all duration-300 ${
                    isDimmed ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'
                  } ${isHovered ? p.glowClass : ''}`}
                  onMouseEnter={() => setHoveredPathway(p.id)}
                  onMouseLeave={() => setHoveredPathway(null)}
                >
                  <div>
                    {/* Header Icon + Tagline */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`cs-pathway-icon ${p.id} !mb-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${p.bgColor} ${p.borderColor} ${p.color}`}>
                        {p.name}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-mono font-semibold mb-3">
                      {p.tagline}
                    </p>

                    <p className="text-xs text-gray-400 leading-relaxed mb-6">
                      {p.description}
                    </p>
                  </div>

                  {/* Feature Tags */}
                  <div className="space-y-2 pt-4 border-t border-[#182a25]/80">
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                            isHovered
                              ? `${p.bgColor} ${p.borderColor} ${p.color}`
                              : 'bg-[#0a110e] border-[#182a25] text-gray-400'
                          } transition-all duration-200`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            CarbonSphere evaluates multiple pathways to find the best fit for your feedstock, location and climate goals.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 3: THE INTELLIGENCE — OPTIMIZATION ENGINE
   ============================================================ */
function IntelligenceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const metrics = [
    { name: 'Estimated Carbon Impact', icon: Leaf, value: 85, scoreText: '85 / 100', sublabel: '−1.42 tCO₂e/t estimated impact (IPCC Tier 2)' },
    { name: 'Potential Economic Value', icon: TrendingUp, value: 72, scoreText: '72 / 100', sublabel: '₹4,850/t estimated net margin' },
    { name: 'Logistics Efficiency', icon: Truck, value: 90, scoreText: '90 / 100', sublabel: '42.5 km modeled road corridor' },
    { name: 'Feedstock Match', icon: ShieldCheck, value: 94, scoreText: '94 / 100', sublabel: 'Moisture ≤25% & Ash ≤8% model fit' },
    { name: 'Facility Headroom', icon: Gauge, value: 68, scoreText: '68 / 100', sublabel: '350 t/day benchmark capacity' },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'restart none restart reset',
        },
        defaults: { ease: 'power2.out', duration: 0.5 },
      });

      tl.fromTo('.intel-label', { opacity: 0, y: 12 }, { opacity: 1, y: 0 })
        .fromTo('.intel-title', { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, '-=0.2')
        .fromTo('.intel-sub', { opacity: 0, y: 12 }, { opacity: 1, y: 0 }, '-=0.2')
        .fromTo('.intel-metrics-container', { opacity: 0, y: 15 }, { opacity: 1, y: 0 }, '-=0.2')
        .fromTo('.intel-metric-item', { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.08 }, '-=0.2')
        .fromTo(
          '.intel-progress-fill',
          { scaleX: 0, transformOrigin: 'left' },
          { scaleX: 1, duration: 0.7, stagger: 0.06, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo('.intel-engine-card', { opacity: 0, y: 15 }, { opacity: 1, y: 0 }, '-=0.1');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cs-section relative border-t border-[#182a25]/60 overflow-hidden" id="intelligence">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Intelligence Narrative */}
          <div className="lg:col-span-5 min-w-0">
            <div className="intel-label cs-section-label mb-3">03 — Intelligence</div>
            <h2 className="intel-title text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight text-white leading-[1.12] mb-5 break-words">
              CarbonSphere<br />
              <span className="highlight text-emerald-400">Optimization Engine</span>
            </h2>
            <p className="intel-sub text-sm sm:text-base text-gray-300/80 leading-relaxed mb-8">
              Five dimensions evaluated simultaneously. Every candidate facility is scored, ranked and explained.
            </p>

            {/* Step-by-Step Chain Indicator */}
            <div className="space-y-3 pt-4 border-t border-[#182a25]/80">
              <div className="text-[11px] font-mono text-gray-500 uppercase tracking-wider">
                Multi-Criteria Decision Flow
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-medium">
                {['Waste', 'Pathway', 'Facility', 'Route', 'Impact'].map((step, i) => (
                  <React.Fragment key={step}>
                    {i > 0 && <span className="text-emerald-500/40">→</span>}
                    <span className={`px-2 py-0.5 rounded-md border ${
                      i === 0
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold'
                        : 'bg-[#0a110e] border-[#182a25] text-gray-400'
                    }`}>
                      {step}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Engine Dimensional Evaluation Visual */}
          <div className="lg:col-span-7 min-w-0 space-y-6">
            <div className="intel-metrics-container space-y-3 relative p-6 rounded-2xl bg-[#0c1210]/90 border border-[#182a25] backdrop-blur-md shadow-2xl">
              {/* Visual Scanning Line */}
              <div className="cs-scanner-beam" />

              <div className="flex items-center justify-between pb-3 border-b border-[#182a25] text-xs font-mono text-gray-400">
                <span className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  EVALUATION DIMENSIONS
                </span>
                <span className="text-emerald-400 text-[11px]">ILLUSTRATIVE EVALUATION RUN</span>
              </div>

              {metrics.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.name}
                    className="intel-metric-item p-3.5 rounded-xl border bg-[#080d0b]/80 border-[#15231f] hover:border-emerald-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span className="text-xs font-bold text-gray-200">{m.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {m.scoreText}
                      </span>
                    </div>

                    {/* Subdued Dark Track with Vivid Glowing Progress Fill */}
                    <div className="w-full bg-[#050a08] h-1.5 rounded-full overflow-hidden mb-1.5 border border-[#13221e]/40">
                      <div
                        className="intel-progress-fill h-full bg-gradient-to-r from-emerald-500 to-teal-400/90 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.3)] origin-left"
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {m.sublabel}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MCDA Scientific Framework Explainer */}
            <div className="intel-engine-card cs-card p-5 border border-emerald-500/20 bg-gradient-to-r from-[#0c1210] to-[#0d1815]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white mb-1">
                    Multi-Criteria Decision Analysis (MCDA)
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Evaluated using IPCC-aligned emission factors, GLEC logistics frameworks, and thermodynamic conversion boundaries. The score represents a model decision score calculated via weighted multi-criteria optimization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 4: THE DECISION — RANKED RECOMMENDATIONS
   ============================================================ */
function DecisionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  const candidates = [
    {
      id: 'biochar',
      name: 'EcoCarbon Biochar Works',
      pathway: 'Biochar Pyrolysis',
      icon: Flame,
      color: 'text-amber-400',
      activeBg: 'bg-[#0e1915]',
      activeBorder: 'border-emerald-500/70',
      activeGlow: 'shadow-xl shadow-emerald-500/15',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      score: 87.4,
      recommended: true,
      rank: '#1 Recommended',
      points: [
        'Highest Estimated Carbon Benefit (−1.42 tCO₂e/t)',
        'Optimal Feedstock Moisture Fit (94%)',
        'Close Freight Distance (42.5 km via NH-48)',
      ],
    },
    {
      id: 'biogas',
      name: 'GreenMethane AD Plant',
      pathway: 'Anaerobic Digestion',
      icon: Droplets,
      color: 'text-cyan-400',
      activeBg: 'bg-[#0a1619]',
      activeBorder: 'border-cyan-500/70',
      activeGlow: 'shadow-xl shadow-cyan-500/15',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      score: 74.2,
      recommended: false,
      rank: '#2 Alternative',
      points: [
        'Clean Biomethane Baseload Power',
        'Fossil Fuel Displacement Factor',
        'Moderate Logistics Radius (78.0 km)',
      ],
    },
    {
      id: 'carbon-materials',
      name: 'Apex Circular Carbon',
      pathway: 'Carbon Composites',
      icon: Box,
      color: 'text-purple-400',
      activeBg: 'bg-[#140e1c]',
      activeBorder: 'border-purple-500/70',
      activeGlow: 'shadow-xl shadow-purple-500/15',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      score: 68.9,
      recommended: false,
      rank: '#3 Alternative',
      points: [
        'High Margin Commodity Value',
        'Specialized Pre-processing Required',
        'Extended Transit Corridor (112.4 km)',
      ],
    },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'restart none restart reset',
        },
        defaults: { ease: 'power2.out', duration: 0.5 },
      });

      tl.fromTo('.decision-label', { opacity: 0, y: 12 }, { opacity: 1, y: 0 })
        .fromTo('.decision-title', { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, '-=0.2')
        .fromTo('.decision-sub', { opacity: 0, y: 12 }, { opacity: 1, y: 0 }, '-=0.2')
        .fromTo('.candidate-card-item', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 }, '-=0.2');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cs-section relative border-t border-[#182a25]/60" id="decision">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="decision-label cs-section-label mb-3">04 — The Decision</div>
          <h2 className="decision-title cs-section-title mb-4">
            Compare. Choose. Create{' '}
            <span className="highlight">Impact.</span>
          </h2>
          <p className="decision-sub cs-section-subtitle mx-auto">
            Every candidate facility in our regional benchmark dataset is scored, ranked and explained — so you make informed decisions, not guesses.
          </p>
        </div>

        <div
          className="candidates-container grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          onMouseLeave={() => setHoveredCardIndex(null)}
        >
          {candidates.map((c, i) => {
            const Icon = c.icon;
            const isExplicitlyHovered = hoveredCardIndex === i;
            const isActive = hoveredCardIndex === null ? c.recommended : isExplicitlyHovered;
            const isDimmed = hoveredCardIndex !== null && !isExplicitlyHovered;

            return (
              <div
                key={c.name}
                tabIndex={0}
                role="article"
                aria-label={`${c.name} - ${c.rank}, Score ${c.score}`}
                onMouseEnter={() => setHoveredCardIndex(i)}
                onFocus={() => setHoveredCardIndex(i)}
                onBlur={() => setHoveredCardIndex(null)}
                className={`candidate-card-item rounded-2xl p-6 flex flex-col justify-between cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-all duration-300 ${
                  isActive
                    ? `${c.activeBg} ${c.activeBorder} ${c.activeGlow} scale-[1.02] -translate-y-1 z-10 border-2`
                    : isDimmed
                    ? 'bg-[#0a0f0d]/60 border border-[#182a25]/60 opacity-60 scale-[0.98]'
                    : 'bg-[#0c1210]/80 border border-[#182a25] hover:border-gray-700'
                }`}
              >
                <div>
                  {/* Recommended Badge or Rank */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors duration-300 ${
                      isActive
                        ? c.badgeClass
                        : 'bg-gray-800/40 text-gray-400 border border-gray-700/60'
                    }`}>
                      {c.recommended && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {c.rank}
                    </span>

                    <span className={`text-xl font-extrabold font-mono transition-all duration-300 ${
                      isActive ? 'text-white scale-105' : 'text-gray-400'
                    }`}>
                      {c.score}
                    </span>
                  </div>

                  {/* Candidate Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-[#111a17] border border-[#182a25]'
                    }`}>
                      <Icon className={`w-5 h-5 ${c.color}`} />
                    </div>
                    <div>
                      <div className="text-base font-bold text-white">{c.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{c.pathway}</div>
                    </div>
                  </div>

                  {/* Points Checklist */}
                  <ul className="space-y-2.5 mb-6">
                    {c.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-xs text-gray-300/90 leading-snug">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors duration-300 ${
                          isActive ? 'text-emerald-400' : 'text-gray-600'
                        }`} />
                        <span className={isActive ? 'text-gray-100 font-medium' : 'text-gray-300/80'}>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Score Footer */}
                <div className="pt-4 border-t border-[#182a25] flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-mono uppercase text-[10px]">Model Decision Score</span>
                  <span className={`font-bold font-mono transition-colors duration-300 ${
                    isActive ? 'text-emerald-300' : 'text-gray-400'
                  }`}>
                    {c.score} / 100
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 5: THE FACILITY — OPTIMAL DESTINATION
   ============================================================ */
function FacilitySection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.facility-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'restart none restart reset',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const facilitySpecs = [
    { label: 'Facility Name', value: 'EcoCarbon Biochar Works (Representative)', mono: false },
    { label: 'Conversion Technology', value: 'High-Temp Continuous Pyrolysis', mono: false },
    { label: 'Feedstock Match', value: '94% Compatibility', mono: true },
    { label: 'Operational Capacity', value: '62% Headroom (350 t/day)', mono: true },
    { label: 'Logistics Corridor', value: '42.5 km (via NH-48)', mono: true },
    { label: 'Road Transit Time', value: '~0.9 Hours Modeled Freight', mono: true },
    { label: 'Model Decision Score', value: '87.4 / 100 (Rank #1)', mono: true },
    { label: 'Estimated CO₂e Impact', value: '−1.42 tCO₂e / tonne', mono: true },
  ];

  return (
    <section ref={sectionRef} className="cs-section relative border-t border-[#182a25]/60" id="facility">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Narrative */}
          <div className="lg:col-span-5 min-w-0">
            <div className="cs-section-label mb-3">05 — The Facility</div>
            <h2 className="cs-section-title mb-5">
              The <span className="highlight">destination</span> of optimization.
            </h2>
            <p className="cs-section-subtitle mb-6 text-sm sm:text-base leading-relaxed">
              Not just the nearest facility — the right one. Scored on capacity, compatibility, logistics and model-based circular permanence.
            </p>
            <div className="p-4 rounded-xl bg-[#0c1210] border border-[#182a25] text-xs text-gray-400 space-y-1">
              <div className="font-bold text-white">Pune Industrial Bio-Cluster (Regional Benchmark)</div>
              <div className="font-mono text-[11px] text-emerald-400">Lat: 18.5204° N, Lon: 73.8567° E</div>
            </div>
          </div>

          {/* Right: Facility High-Tech Terminal Card */}
          <div className="lg:col-span-7 min-w-0">
            <div className="facility-card cs-card p-6 sm:p-8 border border-emerald-500/30 bg-[#0c1210]/95 shadow-2xl relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#182a25]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">EcoCarbon Biochar Works</div>
                    <div className="text-[11px] text-gray-400 font-mono">Representative Pyrolysis Facility</div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                  Representative Facility
                </span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {facilitySpecs.map((d) => (
                  <div key={d.label} className={d.label === 'Facility Name' ? 'sm:col-span-2' : ''}>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono font-medium mb-1">
                      {d.label}
                    </div>
                    <div className={`text-sm font-semibold ${d.mono ? 'font-mono text-emerald-300' : 'text-white'}`}>
                      {d.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 6: THE ROUTE — LOGISTICS TELEMETRY
   ============================================================ */
function RouteSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [routeAnimated, setRouteAnimated] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRouteAnimated(true);
      return;
    }
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => setRouteAnimated(true),
        onEnterBack: () => setRouteAnimated(true),
        onLeave: () => setRouteAnimated(false),
        onLeaveBack: () => setRouteAnimated(false),
      });
      gsap.fromTo(
        '.route-content',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'restart none restart reset',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cs-section relative border-t border-[#182a25]/60" id="route">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="route-content max-w-3xl mx-auto text-center">
          <div className="cs-section-label mb-3">06 — Logistics & Freight</div>
          <h2 className="cs-section-title mb-4">
            Smarter routes for a <span className="highlight">cleaner planet.</span>
          </h2>
          <p className="cs-section-subtitle mx-auto mb-12 text-sm sm:text-base">
            OSRM-powered freight routing with road network distances, transit times and transport emission accounting.
          </p>

          {/* Conceptual Animated Route Track */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1210]/90 border border-[#182a25] mb-10 shadow-xl">
            <div className="flex items-center gap-4 sm:gap-6 max-w-2xl mx-auto mb-6">
              {/* Origin Beacon */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="cs-route-dot" />
                <span className="text-xs font-mono font-bold text-white">Generator Origin</span>
                <span className="text-[10px] text-gray-400 font-mono">Waste Source</span>
              </div>

              {/* Glowing Traveling Beam Line */}
              <div className={`cs-route-line flex-1 ${routeAnimated ? 'animate' : ''}`} />

              {/* Destination Beacon */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="cs-route-dot" />
                <span className="text-xs font-mono font-bold text-emerald-400">Representative Destination</span>
                <span className="text-[10px] text-gray-400 font-mono">EcoCarbon Biochar</span>
              </div>
            </div>

            {/* Route Telemetry Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#182a25] text-center">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">42.5 km</div>
                <div className="text-gray-400 text-[10px] uppercase font-mono tracking-wider mt-1">Modeled Road Distance</div>
              </div>
              <div className="border-x border-[#182a25]">
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">~0.9 hrs</div>
                <div className="text-gray-400 text-[10px] uppercase font-mono tracking-wider mt-1">Modeled Freight Time</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">−68%</div>
                <div className="text-gray-400 text-[10px] uppercase font-mono tracking-wider mt-1">Estimated Logistics CO₂e Delta</div>
              </div>
            </div>
          </div>

          <Link
            href="/platform/routes"
            className="cs-button-secondary inline-flex group"
          >
            <span>Explore the operational route</span>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 7: THE IMPACT — MEASURABLE METRICS
   ============================================================ */
function ImpactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [counts, setCounts] = useState({ carbon: 39.1, waste: 25, economic: 121250 });
  const animFrameRef = useRef<number | null>(null);

  const formatInteger = (n: number) => {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const runCountAnimation = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const start = performance.now();
    const duration = 1600;
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCounts({
        carbon: Math.round(39.1 * eased * 10) / 10,
        waste: Math.round(25 * eased),
        economic: Math.round(121250 * eased),
      });
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, []);

  const resetCounts = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setCounts({ carbon: 0, waste: 0, economic: 0 });
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCounts({ carbon: 39.1, waste: 25, economic: 121250 });
      return;
    }
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 15%',
        onEnter: () => runCountAnimation(),
        onEnterBack: () => runCountAnimation(),
        onLeave: () => resetCounts(),
        onLeaveBack: () => resetCounts(),
      });
      gsap.fromTo(
        '.impact-label',
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'restart none restart reset',
          },
        }
      );
      gsap.fromTo(
        '.impact-title',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'restart none restart reset',
          },
        }
      );
      gsap.fromTo(
        '.impact-card-box',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'restart none restart reset',
          },
        }
      );
    }, sectionRef);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      ctx.revert();
    };
  }, [runCountAnimation, resetCounts]);

  const impactMetrics = [
    {
      value: `${counts.carbon.toFixed(1)} tCO₂e`,
      label: 'Estimated Carbon Benefit',
      sublabel: 'Model-based lifecycle GHG mitigation'
    },
    {
      value: `${formatInteger(counts.waste)} Tonnes`,
      label: 'Feedstock Diverted',
      sublabel: 'From open field burning & landfilling'
    },
    {
      value: `₹${formatInteger(counts.economic)}`,
      label: 'Potential Economic Value',
      sublabel: 'Estimated net margin yield (₹4,850/t)'
    },
  ];

  return (
    <section ref={sectionRef} className="cs-section relative border-t border-[#182a25]/60" id="impact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <div className="impact-label cs-section-label mb-3">07 — Measurable Impact</div>
          <h2 className="impact-title cs-section-title mb-4">
            Model-driven impact. Transparent <span className="highlight">outcomes.</span>
          </h2>
          <p className="cs-section-subtitle mx-auto">
            What CarbonSphere can determine for a representative 25-tonne biomass conversion scenario evaluated through the multi-criteria engine.
          </p>
        </div>

        {/* Illustrative model output banner */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Illustrative model output — 25-tonne agricultural bagasse benchmark scenario
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto mb-14">
          {impactMetrics.map((m) => (
            <div key={m.label} className="impact-card-box p-6 rounded-2xl bg-[#0c1210]/80 border border-[#182a25] text-center shadow-lg">
              <div suppressHydrationWarning className="cs-impact-value text-emerald-400 font-mono font-extrabold">{m.value}</div>
              <div className="cs-impact-label text-white font-bold text-sm mt-3">{m.label}</div>
              <div className="text-xs text-gray-400 mt-1">{m.sublabel}</div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <DisclaimerBanner />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Section 8: THE LOOP — CLOSED-LOOP CIRCULAR SYSTEM
   ============================================================ */
function LoopSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const steps = [
    { label: 'Waste', icon: Layers, desc: 'Feedstock Input' },
    { label: 'Pathway', icon: Compass, desc: 'Multi-Path Evaluation' },
    { label: 'Facility', icon: Building2, desc: 'Optimal Destination' },
    { label: 'Route', icon: MapPin, desc: 'Freight Efficiency' },
    { label: 'Impact', icon: BarChart3, desc: 'Modeled Impact' },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'restart none restart reset',
        },
        defaults: { ease: 'power2.out', duration: 0.5 },
      });

      tl.fromTo('.loop-label', { opacity: 0, y: 12 }, { opacity: 1, y: 0 })
        .fromTo('.loop-step', { opacity: 0, y: 15, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, stagger: 0.08 }, '-=0.2')
        .fromTo('.loop-message', { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, '-=0.2');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cs-section pb-28 border-t border-[#182a25]/60" id="loop">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="loop-label cs-section-label mb-3">08 — The Circular Loop</div>
        
        {/* Decision & Circular Economy Chain */}
        <div className="loop-chain flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-10 max-w-4xl mx-auto">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.label}>
                {i > 0 && <span className="text-emerald-500/40 text-sm font-bold">→</span>}
                <div className="loop-step cs-flow-step flex flex-col items-center gap-1.5 p-3 sm:px-4 rounded-xl bg-[#0c1210] border border-emerald-500/30 shadow-md">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">{s.label}</span>
                  <span className="text-[10px] text-gray-400 font-mono hidden sm:inline-block">{s.desc}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Central Closing Narrative */}
        <div className="loop-message max-w-3xl mx-auto space-y-8 mt-12">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
            CarbonSphere doesn&apos;t just move waste.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              It decides what it should become.
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/platform/waste" className="cs-button-primary group shadow-lg shadow-emerald-500/25">
              <span>Start Analysis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/platform" className="cs-button-secondary">
              <span>Explore Platform Workflow</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Main Page Layout
   ============================================================ */
export default function HomePage() {
  useEffect(() => {
    // Refresh ScrollTrigger after initial mount and font/image loading
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060908] text-[#f3f7f6] flex flex-col cs-grain">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <HeroSection />
        <PossibilitiesSection />
        <IntelligenceSection />
        <DecisionSection />
        <FacilitySection />
        <RouteSection />
        <ImpactSection />
        <LoopSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#182a25] bg-[#040605] py-12 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span className="font-bold text-white text-sm tracking-tight">
              Carbon<span className="text-emerald-400">Sphere</span>
            </span>
            <span className="text-gray-600 hidden sm:inline">—</span>
            <span className="text-gray-400">Waste Pathway Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase font-mono tracking-wider text-gray-500">
            <span>People</span>
            <span className="w-px h-3 bg-gray-700" />
            <span>Planet</span>
            <span className="w-px h-3 bg-gray-700" />
            <span>Possibilities</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

