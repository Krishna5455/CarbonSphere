import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { OptimizationResult } from '@/lib/types';

interface ExplainabilityCardProps {
  result: OptimizationResult;
}

export default function ExplainabilityCard({ result }: ExplainabilityCardProps) {
  // Take the top 3-4 decision drivers returned by the backend
  const drivers = result.detailed_explanation.slice(0, 4);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#1e332f] space-y-4">
      <div className="flex items-center gap-2 border-b border-[#1e332f] pb-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-white tracking-wide">
          Why this recommendation
        </h3>
      </div>

      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
        {result.why_recommended}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {drivers.map((driver, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-[#121c19] border border-[#1e332f] text-xs text-gray-300"
          >
            <span className="text-emerald-400 font-bold">•</span>
            <span className="leading-snug">{driver}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
