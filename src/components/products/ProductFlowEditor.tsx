import React from "react";
import { ArrowRight, CornerDownRight } from "lucide-react";
import clsx from "clsx";

export function ProductFlowEditor() {
  return (
    <div className="flex-1 flex justify-center p-4 min-w-max select-none">
      <div className="flex flex-col gap-6 relative">
        
        {/* Row 1: Marco -> Hojas -> Mosquitero */}
        <div className="flex items-start gap-8">
          <FlowNode title="Marco" subtitle="00152" active />
          
          <ArrowRightIcon className="mt-8 text-red-500 w-6 h-6 -ml-4 -mr-4" />
          
          <FlowNode title="Hojas" subtitle="1 H / 00151 - 00102\n2 H / 00151 - 00102" bottomLabel="Izquierda" />
          
          <ArrowRightIcon className="mt-8 text-red-500 w-6 h-6 -ml-4 -mr-4" />
          
          <FlowNode title="Mosquitero" subtitle="00404" bottomLabel="Sin mosquitero" disabled />
        </div>

        {/* Arrow Down from Hojas */}
        <div className="absolute top-[80px] left-[256px]">
           <CornerDownRightIcon className="w-8 h-12 text-red-500" />
        </div>

        {/* Row 2: Interior */}
        <div className="flex items-start" style={{ marginLeft: "240px" }}>
          <FlowNode title="Interior" subtitle="VS" />
        </div>

        {/* Advanced branching arrows from Interior */}
        {/* It has arrows to Contravidrio int, Contravidrio ext, Cruces */}
        {/* Skipping strict svgs for simplicity, using div borders */}
        <div className="relative h-12" style={{ marginLeft: "28px" }}>
           <div className="absolute top-0 left-[280px] w-[2px] h-6 bg-red-500" />
           <div className="absolute top-6 left-[80px] right-[-100px] h-[2px] bg-red-500" />
           <div className="absolute top-6 left-[80px] w-[2px] h-6 bg-red-500" />
           <div className="absolute top-6 left-[280px] w-[2px] h-6 bg-red-500" />
           <div className="absolute top-6 left-[480px] w-[2px] h-6 bg-red-500" />
           {/* arrow head right */}
           <div className="absolute top-[18px] right-[-108px] text-red-500">
             <ArrowRight className="w-5 h-5" strokeWidth={3} />
           </div>
        </div>

        {/* Row 3: Hojas leaves */}
        <div className="flex items-start gap-6 relative" style={{ marginLeft: "28px" }}>
          <FlowNode title="Contravidrio interior" subtitle="v2" width={180} />
          <FlowNode title="Contravidrio exterior" subtitle="" width={180} />
          <FlowNode title="Cruces" subtitle="00122" width={180} bottomLabel="Sin cruces" />
          
          <div className="flex flex-col ml-12 text-[10px] gap-0.5 justify-center">
            {[1,2,3].map(n => (
              <div key={`mhor${n}`} className="flex items-center gap-2">
                <input type="text" readOnly value="0" className="w-12 text-right bg-[#fff6cd] border border-amber-300 px-1" />
                <span>Medida hor {n}</span>
              </div>
            ))}
            {[1,2,3,4,5].map(n => (
              <div key={`mver${n}`} className="flex items-center gap-2">
                <input type="text" readOnly value="0" className="w-12 text-right bg-[#fff6cd] border border-amber-300 px-1" />
                <span>Medida ver {n}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return <ArrowRight className={clsx("stroke-current", className)} strokeWidth={2.5} />
}

function CornerDownRightIcon({ className }: { className?: string }) {
  // A simple angled arrow
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className={className}>
       <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v12h8m-4-4l4 4-4 4" />
    </svg>
  );
}

function FlowNode({ title, subtitle, bottomLabel, active = false, disabled = false, width = 192 }: { title: string, subtitle: string, bottomLabel?: string, active?: boolean, disabled?: boolean, width?: number }) {
  return (
    <div className="flex flex-col gap-0 select-none" style={{ width }}>
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[11px] font-bold text-steel-800">{title}</span>
        <button className="bg-steel-200 border border-steel-300 hover:bg-steel-300 p-0.5 rounded shadow-sm">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
             <rect x="3" y="3" width="18" height="18" rx="2" />
             <path d="M9 3v18M3 9h18" />
           </svg>
        </button>
      </div>
      <div className={clsx(
        "border-[1.5px] border-black bg-white flex flex-col h-[72px]",
        active && "ring-2 ring-blue-400"
      )}>
        <div className="bg-black text-white text-[11px] px-2 py-0.5 font-bold">
          {subtitle.split('\\n')[0]}
        </div>
        <div className="flex-1 p-1 text-[10px] whitespace-pre text-black">
          {subtitle.split('\\n').slice(1).join('\n')}
        </div>
      </div>
      {bottomLabel && (
        <select className={clsx(
          "mt-1 text-[11px] px-1 py-0.5 border border-amber-300 bg-[#fff6cd] text-black w-full focus:outline-none",
          disabled && "opacity-80"
        )}>
          <option>{bottomLabel}</option>
        </select>
      )}
    </div>
  )
}
