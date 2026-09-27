type HarmonySwatchItemProps = {
  hex: string;
  name: string;
  role?: string;
  onSelectColor: (hex: string) => void;
};

export default function HarmonySwatchItem({
  hex,
  name,
  role,
  onSelectColor,
}: HarmonySwatchItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelectColor(hex)}
      aria-label={`Select ${role ? `${role} ` : ''}${name} (${hex})`}
      className="shadow-xs group relative flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 p-2.5 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60"
    >
      {/* Swatch square */}
      <div
        className="shadow-xs h-10 w-full rounded-lg border border-black/10 sm:h-12 dark:border-white/20"
        style={{ backgroundColor: hex }}
      />

      {/* Role / Name */}
      <div className="flex w-full flex-col text-left">
        {role && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {role}
          </span>
        )}
        <span className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          {name}
        </span>
        <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
          {hex}
        </span>
      </div>
    </button>
  );
}
