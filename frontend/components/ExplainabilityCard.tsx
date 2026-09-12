import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Scale, TrendingUp } from 'lucide-react';
import { OptimizationResult } from '@/lib/types';

interface ExplainabilityCardProps {
  result: OptimizationResult;
}

export default function ExplainabilityCard({ result }: ExplainabilityCardProps) {
  const winner = result.ranked_candidates.find((c) => c.facility_id === result.recommended_facility_id);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-b from-[#0e1715] to-[#0a0f0e] shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e332f] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Optimization Decision Explainability
            </h3>
            <p className="text-[11px] text-gray-400">
              Deterministic multi-criteria trade-off synthesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">Selected Profile:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize">
            {result.objective.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Primary Executive Summary */}
      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
        "{result.why_recommended}"
      </div>

      {/* Grid of Key Drivers & Criteria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Key Decision Drivers */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Decision Drivers & Chemistry
          </h4>
          <ul className="space-y-2 text-xs text-gray-300">
            {result.detailed_explanation.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-[#121c19] p-3 rounded-lg border border-[#1e332f]">
                <span className="text-emerald-400 font-bold">•</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Objective Breakdown & Weights */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-sky-400" />
            Active Objective Weighting Model
          </h4>
          <div className="bg-[#121c19] p-3 rounded-lg border border-[#1e332f] space-y-3 text-xs">
            {Object.entries(result.objective_weights).map(([key, weight]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-400 capitalize">
                  <span>{key} Weight</span>
                  <span className="text-white font-mono">{(weight * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-[#1e332f] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {winner && (
            <div className="bg-[#121c19] p-3 rounded-lg border border-[#1e332f] text-xs space-y-1.5">
              <div className="text-[11px] text-gray-400 uppercase tracking-wide">
                Winning Facility Scores (0 - 100)
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded bg-black/30">
                  <div className="text-emerald-400 font-bold">{winner.carbon_score}</div>
                  <div className="text-[10px] text-gray-500">Carbon</div>
                </div>
                <div className="p-2 rounded bg-black/30">
                  <div className="text-amber-400 font-bold">{winner.economic_score}</div>
                  <div className="text-[10px] text-gray-500">Economics</div>
                </div>
                <div className="p-2 rounded bg-black/30">
                  <div className="text-sky-400 font-bold">{winner.logistics_score}</div>
                  <div className="text-[10px] text-gray-500">Logistics</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
