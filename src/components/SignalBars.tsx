const phaseColors: Record<number, string> = {
  1: "var(--ph-core)",
  2: "var(--ph-mid)",
  3: "var(--amber-mid)",
  4: "#A05020"
};

interface SignalBarsProps {
  phase: number;
}

export default function SignalBars({ phase }: SignalBarsProps) {
  const litCount = Math.max(1, 4 - (phase - 1) + 1); // equivalent to 5 - (phase - 1)
  const heights = [4, 7, 10, 13, 16];

  return (
    <div id="status-signal-bars" className="flex items-center gap-1.5 select-none font-mono">
      <span 
        style={{ color: "var(--ph-dark)", fontSize: "9px" }}
        className="font-black tracking-widest uppercase"
      >
        SIGNAL
      </span>
      <div className="flex items-end gap-[3px] h-[16px] pb-[1px]">
        {heights.map((h, i) => {
          const isLit = i < litCount;
          return (
            <div
              key={i}
              style={{
                height: `${h}px`,
                backgroundColor: isLit ? phaseColors[phase] || "var(--ph-core)" : "var(--ph-dark)",
                opacity: isLit ? 1 : 0.3,
                width: "3px"
              }}
              className="rounded-t-sm transition-all duration-300"
            />
          );
        })}
      </div>
    </div>
  );
}
