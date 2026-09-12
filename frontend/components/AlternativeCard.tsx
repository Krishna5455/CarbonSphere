import React from 'react';
import { CandidateEvaluation } from '@/lib/types';
import { CheckCircle, XCircle, ArrowUpRight, Flame, Droplets, Box, AlertCircle } from 'lucide-react';

interface AlternativeCardProps {
  candidate: CandidateEvaluation;
  rank: number;
  isWinner: boolean;
}

export default function AlternativeCard({ candidate, rank, isWinner }: AlternativeCardProps) {
  const getPathwayIcon = () => {
    switch (candidate.pathway) {
      case 'biochar':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'biogas':
        return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'carbon_materials':
        return <Box className="w-4 h-4 text-purple-400" />;
    }
  };

  const getPathwayBadge = () => {
    switch (candidate.pathway) {
      case 'biochar':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'biogas':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'carbon_materials':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div
      className={`glass-panel rounded-xl p-5 border transition-all duration-200 ${
        isWinner
          ? 'border-emerald-500/50 bg-emerald-950/10 shadow-lg shadow-emerald-500/10'
          : candidate.is_feasible
          ? 'border-[#1e332f] hover:border-[#2d4d46]'
          : 'border-red-950/40 bg-red-950/5 opacity-75'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              isWinner
                ? 'bg-emerald-500 text-black'
                : candidate.is_feasible
                ? 'bg-[#162421] text-gray-300'
                : 'bg-red-950 text-red-400'
            }`}
          >
            #{rank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white leading-tight">
                {candidate.facility_name}
              </h4>
              {isWinner && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  TOP PICK
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400">{candidate.operator} • {candidate.facility_location}</p>
          </div>
        </div>

        {/* Score Badge */}
        <div className="text-right">
          <div className="text-base font-extrabold font-mono text-white">
            {candidate.is_feasible ? candidate.overall_score : '—'}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-gray-500">Score</div>
        </div>
      </div>

      {/* Pathway & Feasibility Tag */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border font-medium ${getPathwayBadge()}`}>
          {getPathwayIcon()}
          <span className="capitalize">{candidate.pathway.replace('_', ' ')}</span>
        </div>

        {candidate.is_feasible ? (
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Feasible</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-red-400 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            <span>Incompatible</span>
          </div>
        )}

        <div className="text-[11px] text-gray-400 ml-auto">
          <b className="text-gray-200">{candidate.distance_km.toFixed(1)} km</b> ({candidate.duration_hrs.toFixed(1)}h)
        </div>
      </div>

      {/* Metrics Row */}
      {candidate.is_feasible ? (
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-[#1e332f] text-center my-3 bg-[#0a0f0e]/50 rounded-lg">
          <div>
            <div className="text-xs font-bold text-emerald-400 font-mono">
              +{candidate.net_carbon_impact_tco2e.toFixed(1)} t
            </div>
            <div className="text-[10px] text-gray-400">Net Carbon</div>
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300 font-mono">
              ₹{candidate.net_economic_value_inr.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400">Net Value</div>
          </div>
          <div>
            <div className="text-xs font-bold text-sky-400 font-mono">
              ₹{candidate.transport_cost_inr.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400">Freight</div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/30 text-xs text-red-300 my-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-[11px]">Incompatible:</div>
            {candidate.rejection_reasons.map((r, i) => (
              <div key={i} className="text-[11px] text-red-300 leading-snug">• {r}</div>
            ))}
          </div>
        </div>
      )}

      {/* Highlights or Trade-offs */}
      {candidate.key_drivers.length > 0 && (
        <div className="text-[11px] text-gray-300 space-y-1 pt-1">
          {candidate.key_drivers.slice(0, 2).map((d, i) => (
            <div key={i} className="flex items-center gap-1.5 text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{d}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
