import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowRight, Layers, Compass, Building2, MapPin, BarChart3, Play } from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    number: '01',
    title: 'Waste',
    description: 'Define the waste stream and its characteristics.',
    href: '/platform/waste',
    icon: Layers,
  },
  {
    number: '02',
    title: 'Pathway',
    description: 'Compare suitable circular pathways.',
    href: '/platform/recommendations',
    icon: Compass,
  },
  {
    number: '03',
    title: 'Facility',
    description: 'Review the best facility match and alternatives.',
    href: '/platform/recommendations',
    icon: Building2,
  },
  {
    number: '04',
    title: 'Route',
    description: 'Compare the logistics route and transport impact.',
    href: '/platform/routes',
    icon: MapPin,
  },
  {
    number: '05',
    title: 'Impact',
    description: 'Review estimated carbon and economic value.',
    href: '/platform/impact',
    icon: BarChart3,
  },
];

export default function PlatformOverviewPage() {
  return (
    <div className="min-h-screen bg-[#080c0b] text-[#f1f5f4] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span>CarbonSphere</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Waste → Pathway → Facility → Route → Impact
          </h1>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Turn a waste stream into the highest-value circular pathway.
          </p>

          {/* Primary Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/platform/waste"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/demo"
              className="px-6 py-3 rounded-xl border border-[#1e332f] bg-[#121c19] hover:bg-[#1a2b27] text-gray-200 hover:text-white font-medium text-xs transition-colors flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Demo</span>
            </Link>
          </div>
        </div>

        {/* 5-Step Workflow Cards */}
        <div className="space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-gray-400 px-1">
            Platform Workflow
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {WORKFLOW_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <Link
                  key={step.number}
                  href={step.href}
                  className="glass-panel p-5 rounded-2xl border border-[#1e332f] hover:border-emerald-500/40 hover:bg-[#121c19]/80 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-gray-400 group-hover:text-emerald-400 transition-colors">
                      <span className="text-xs font-mono font-bold text-emerald-400/80">
                        {step.number}
                      </span>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {step.number} — {step.title}
                      </h2>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-1 text-[11px] font-medium text-gray-400 group-hover:text-emerald-300 transition-colors">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
