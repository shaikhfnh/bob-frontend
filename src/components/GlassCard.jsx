export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-neutral-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}