'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Compass, MapPin, BarChart3, Sparkles, Layers, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Overview', href: '/platform', icon: Sparkles },
    { name: 'Waste', href: '/platform/waste', icon: Layers },
    { name: 'Recommendations', href: '/platform/recommendations', icon: Compass },
    { name: 'Routes', href: '/platform/routes', icon: MapPin },
    { name: 'Impact', href: '/platform/impact', icon: BarChart3 },
    { name: 'Demo', href: '/demo', icon: Leaf },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1e332f] bg-[#080c0b]/90 backdrop-blur-md">
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

        {/* Desktop Navigation links */}
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

        {/* Action Button & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <Link
            href="/platform/waste"
            className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/25 active:scale-95"
          >
            Launch Optimizer
          </Link>

          <button
            type="button"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1e332f] bg-[#0c1311] px-4 py-4 space-y-1 shadow-2xl transition-all">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-3">
              <Link
                href="/platform/waste"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-2.5 text-xs font-semibold rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/25"
              >
                Launch Optimizer
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
