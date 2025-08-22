export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="https://i.imgur.com/VXfQFab.png"
        alt="Fynix phoenix logo"
        className="h-10 w-10 rounded-lg"
        loading="eager"
        decoding="async"
      />
      <div className="leading-none">
        <div className="font-extrabold text-2xl tracking-wide">Fynix</div>
        <div className="text-xs opacity-80">by BLAiZE IT🔥</div>
      </div>
    </div>
  );
}
