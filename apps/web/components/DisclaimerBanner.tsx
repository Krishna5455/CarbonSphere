import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-panel border-l-4 border-l-emerald-500 border-emerald-500/20 bg-emerald-950/15 p-3.5 rounded-xl text-xs text-gray-300 flex items-start gap-3 ${className}`}>
      <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
      <div className="space-y-0.5 leading-relaxed">
        <div className="font-semibold text-emerald-400 flex items-center gap-2 text-xs">
          <span>Model Estimates & Methodology Notice</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            IPCC + GLEC
          </span>
        </div>
        <p className="text-gray-400 text-[11px]">
          Metrics are model-based estimates to compare circular waste pathways. They do not constitute audited third-party carbon credits or financial guarantees.
        </p>
      </div>
    </div>
  );
}
