'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Compass, MapPin, BarChart3, Sparkles, Layers } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/', icon: Sparkles },
    { name: 'Feedstock Profiler', href: '/platform/waste', icon: Layers },
    { name: 'Recommendations', href: '/platform/recommendations', icon: Compass },
    { name: 'Logistics Route', href: '/platform/routes', icon: MapPin },
    { name: 'Impact Audit', href: '/platform/impact', icon: BarChart3 },
    { name: 'Demo Scenarios', href: '/demo', icon: Leaf },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1e332f] bg-[#080c0b]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              Carbon<span className="text-emerald-400">Sphere</span>
            </span>
            <span className="text-[10px] text-gray-400 tracking-wider uppercase font-mono">
              Waste Pathway Intelligence
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/platform/waste"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/25 active:scale-95"
          >
            Launch Optimizer
          </Link>
        </div>
      </div>
    </header>
  );
}
