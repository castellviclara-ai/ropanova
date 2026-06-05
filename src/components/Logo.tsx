export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
        <span className="font-display text-lg leading-none tracking-tighter">RN</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg tracking-[0.18em]">ROPA NOVA</span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Tracking
        </span>
      </div>
    </div>
  );
}
