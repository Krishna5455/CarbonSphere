import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-panel border-l-4 border-l-emerald-500 border-emerald-500/20 bg-emerald-950/15 p-4 rounded-xl text-xs text-gray-300 flex items-start gap-3 ${className}`}>
      <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      <div className="space-y-1 leading-relaxed">
        <div className="font-semibold text-emerald-400 flex items-center gap-2">
          <span>MODEL-BASED DECISION INTELLIGENCE SPECIFICATION</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            IPCC FOD + GLEC v3.0
          </span>
        </div>
        <p className="text-gray-400 text-[11px]">
          CarbonSphere metrics are <b>model-based scientific estimates</b> formulated to assist municipal and industrial decision-makers in comparing circular valorization pathways. They do <b>not</b> constitute audited third-party carbon credits, certified offsets, or financial guarantees. Every emission factor is traceable to explicit scientific parameters.
        </p>
      </div>
    </div>
  );
}
