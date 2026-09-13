export default function DonutChart({ data, size = 140, thickness = 18 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePct = 0;

  const gradientStops = data.length && total > 0
    ? data.map((d) => {
        const pct = (d.value / total) * 100;
        const stop = `${d.color} ${cumulativePct}% ${cumulativePct + pct}%`;
        cumulativePct += pct;
        return stop;
      }).join(', ')
    : null;

  return (
    <div className="flex items-center gap-5">
      <div
        className="relative flex-shrink-0 rounded-full"
        style={{
          width: size,
          height: size,
          background: gradientStops ? `conic-gradient(${gradientStops})` : '#e5e5ea',
        }}
      >
        <div
          className="absolute flex items-center justify-center rounded-full bg-white"
          style={{ inset: thickness }}
        >
          <span className="text-lg font-bold text-brand-ink">{total}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-brand-muted">{d.label}</span>
            <span className="font-semibold text-brand-ink">{d.value}</span>
            <span className="text-xs text-brand-muted">({total ? Math.round((d.value / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}