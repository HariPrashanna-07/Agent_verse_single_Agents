import React, { useState } from 'react';
import { Wrench, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export default function ToolCallBadge({ toolCall }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-2 border border-slate-800 bg-slate-900/90 rounded-lg overflow-hidden text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-800/60 transition-colors text-left"
      >
        <div className="flex items-center space-x-2 text-emerald-400 font-mono">
          <Wrench className="w-3.5 h-3.5" />
          <span className="font-semibold">Tool Execution:</span>
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded font-mono">
            {toolCall.tool_name}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-800/80 pt-2 space-y-2 bg-slate-950/60">
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Arguments:</span>
            <pre className="mt-1 p-2 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
              {JSON.stringify(toolCall.arguments, null, 2)}
            </pre>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Result Payload:</span>
            <pre className="mt-1 p-2 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-40">
              {JSON.stringify(toolCall.result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
