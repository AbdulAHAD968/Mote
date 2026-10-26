export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="9" fill="#cc785c" />
      {[[51, 32], [41.5, 48.5], [22.5, 48.5], [13, 32], [22.5, 15.5], [41.5, 15.5]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3.5" fill="#cc785c" />
      ))}
      {[[53.6, 44.5], [32, 57], [10.4, 44.5], [10.4, 19.5], [32, 7], [53.6, 19.5]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="2.5" fill="#e8a55a" />
      ))}
    </svg>
  );
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      <span
        className="font-display text-[26px] leading-none tracking-tight"
        style={{ color: dark ? "var(--color-on-dark)" : "var(--color-ink)" }}
      >
        Mote
      </span>
    </span>
  );
}
