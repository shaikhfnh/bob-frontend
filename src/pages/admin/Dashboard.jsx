import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { springs } from '../../styles/motion';
import { getRegistrations } from '../../services/registrationService';
import { getSessions } from '../../services/sessionService';
import { getFunnelSummary } from '../../services/funnelService';
import { PageSkeleton } from '../../components/Skeleton';

function initials(first, last) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
}
function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function dayLabel(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}
function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

const Icon = {
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  download: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>,
  shield: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>,
  trendUp: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>,
  trendDown: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7l6 6 4-4 8 8M15 17h6v-6"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
};

function QuickAction({ icon: IconComp, label, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink shadow-sm transition-shadow hover:shadow-md"
    >
      <IconComp className="h-4 w-4 text-brand-red" />
      {label}
    </motion.button>
  );
}

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getRegistrations(), getSessions(), getFunnelSummary()])
      .then(([b, s, f]) => { setBookings(b); setSessions(s); setFunnel(f); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;
  if (error) return <p className="text-sm font-medium text-red-600">⚠ {error}</p>;

  const totalBookings = bookings.length;
  const onlineCount = bookings.filter((b) => b.format === 'online').length;
  const offlineCount = bookings.filter((b) => b.format === 'offline').length;
  const onlinePct = totalBookings ? Math.round((onlineCount / totalBookings) * 100) : 0;

  // Real week-over-week trend — last 7 days vs the 7 days before that
  const now = Date.now();
  const last7Start = now - 7 * 86400000;
  const prev7Start = now - 14 * 86400000;
  const last7Count = bookings.filter((b) => new Date(b.created_at).getTime() >= last7Start).length;
  const prev7Count = bookings.filter((b) => {
    const t = new Date(b.created_at).getTime();
    return t >= prev7Start && t < last7Start;
  }).length;
  const trendPct = prev7Count === 0
    ? (last7Count > 0 ? 100 : 0)
    : Math.round(((last7Count - prev7Count) / prev7Count) * 100);
  const trendUp = trendPct >= 0;

  const conversionRate = funnel?.pageViews ? Math.round((funnel.completed / funnel.pageViews) * 100) : 0;

  // Top-performing session
  const sessionCounts = sessions.map((s) => ({
    ...s,
    count: bookings.filter((b) => b.session_id === s.id).length,
  })).sort((a, b) => b.count - a.count);
  const topSession = sessionCounts[0];

  // Next upcoming session
  const upcoming = sessions
    .map((s) => ({ ...s, daysAway: daysUntil(s.date) }))
    .filter((s) => s.daysAway >= 0)
    .sort((a, b) => a.daysAway - b.daysAway)[0];

  const fillingSessions = sessions
    .filter((s) => s.format === 'offline' && s.capacity)
    .map((s) => {
      const booked = bookings.filter((b) => b.session_id === s.id).length;
      return { ...s, booked, remaining: s.capacity - booked };
    })
    .filter((s) => s.remaining <= Math.max(3, s.capacity * 0.15));

  const recent = [...bookings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const dailyCounts = last7Days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return bookings.filter((b) => {
      const t = new Date(b.created_at);
      return t >= day && t < next;
    }).length;
  });
  const maxDaily = Math.max(...dailyCounts, 1);
  const allQuiet = dailyCounts.every((c) => c === 0);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-ink">Dashboard</h1>
          <p className="text-sm text-brand-muted">Live overview from real bookings and sessions</p>
        </div>
        {/* Quick actions — real navigation, not decorative buttons */}
        <div className="flex flex-wrap gap-2">
          <QuickAction icon={Icon.plus} label="Add Session" onClick={() => navigate('/admin/sessions')} />
          <QuickAction icon={Icon.download} label="Export Bookings" onClick={() => navigate('/admin/bookings')} />
          <QuickAction icon={Icon.shield} label="Audit Log" onClick={() => navigate('/admin/audit')} />
        </div>
      </div>

      {/* System status strip — small, quiet, but real */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Database connected
        </span>
        <span>·</span>
        <span>{sessions.length} active session{sessions.length === 1 ? '' : 's'}</span>
        <span>·</span>
        <span>{recent.length > 0 ? `Last booking ${timeAgo(recent[0].created_at)}` : 'No bookings yet'}</span>
      </div>

      {fillingSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          🔥 <b>Filling up:</b>{' '}
          {fillingSessions.map((s, i) => (
            <span key={s.id}>
              {s.title} ({s.remaining <= 0 ? 'full' : `${s.remaining} left`}){i < fillingSessions.length - 1 ? ', ' : ''}
            </span>
          ))}
        </motion.div>
      )}

      {/* Hero panel — total bookings with real trend, conversion rate, format split */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="mt-5 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-brand-muted">Total bookings</p>
            <p className="mt-1 text-5xl font-bold tracking-tight text-brand-ink">{totalBookings}</p>
            <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {trendUp ? <Icon.trendUp className="h-3 w-3" /> : <Icon.trendDown className="h-3 w-3" />}
              {Math.abs(trendPct)}% vs last week
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <p className="text-xs font-semibold text-brand-muted">Conversion rate</p>
            <p className="mt-1 text-5xl font-bold tracking-tight text-brand-ink">{conversionRate}%</p>
            <p className="mt-2 text-xs text-brand-muted">
              {funnel ? `${funnel.completed} of ${funnel.pageViews} visitors registered` : '—'}
            </p>
          </div>

          <div className="border-t border-neutral-100 pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <p className="text-xs font-semibold text-brand-muted">Format split</p>
            <div className="mt-3 flex justify-between text-xs text-brand-muted">
              <span>💻 {onlineCount}</span>
              <span>📍 {offlineCount}</span>
            </div>
            <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <motion.div initial={{ width: 0 }} animate={{ width: `${onlinePct}%` }} transition={{ ...springs.default, delay: 0.15 }} className="h-full bg-blue-500" />
              <motion.div initial={{ width: 0 }} animate={{ width: `${100 - onlinePct}%` }} transition={{ ...springs.default, delay: 0.15 }} className="h-full bg-amber-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Spotlight + next-up row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {topSession && topSession.count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springs.default, delay: 0.05 }}
            className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6"
          >
            <div className="flex items-center gap-2 text-amber-600">
              <Icon.star className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wide">Top Performing Session</p>
            </div>
            <p className="mt-2 text-lg font-bold text-brand-ink">{topSession.title}</p>
            <p className="mt-1 text-sm text-brand-muted">
              {topSession.count} registration{topSession.count === 1 ? '' : 's'} · {topSession.format === 'online' ? '💻 Online' : '📍 Offline'}
            </p>
          </motion.div>
        )}

        {upcoming && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springs.default, delay: 0.1 }}
            className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6"
          >
            <div className="flex items-center gap-2 text-blue-600">
              <Icon.clock className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wide">Next Up</p>
            </div>
            <p className="mt-2 text-lg font-bold text-brand-ink">{upcoming.title}</p>
            <p className="mt-1 text-sm text-brand-muted">
              {upcoming.daysAway === 0 ? 'Today' : upcoming.daysAway === 1 ? 'Tomorrow' : `In ${upcoming.daysAway} days`} · {upcoming.date}
            </p>
          </motion.div>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-brand-ink">Last 7 days</h3>
          {allQuiet ? (
            <p className="mt-8 text-center text-sm text-brand-muted">No registrations yet this week.</p>
          ) : (
            <div className="mt-5 flex h-28 items-end gap-2.5">
              {dailyCounts.map((count, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${(count / maxDaily) * 100}%` }} transition={{ ...springs.default, delay: i * 0.05 }}
                    className={`w-full rounded-t-md ${i === 6 ? 'bg-brand-red' : 'bg-neutral-200'}`}
                    style={{ minHeight: count > 0 ? 4 : 0 }}
                    title={`${count}`}
                  />
                  <span className="text-[10px] text-brand-muted">{dayLabel(last7Days[i])}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-brand-ink">Session capacity</h3>
          <div className="mt-4 space-y-4">
            {sessions.map((s) => {
              const booked = bookings.filter((b) => b.session_id === s.id).length;
              const pct = s.format === 'offline' && s.capacity ? Math.min(100, (booked / s.capacity) * 100) : 0;
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-sm">
                    <span className="truncate font-medium text-brand-ink">{s.title}</span>
                    <span className="flex-shrink-0 text-xs text-brand-muted">
                      {s.format === 'online' ? 'Unlimited' : `${booked}/${s.capacity}`}
                    </span>
                  </div>
                  {s.format === 'offline' && (
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={springs.default} className={`h-full rounded-full ${pct >= 85 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-brand-ink">Recent activity</h3>
          <div className="mt-3 space-y-3">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-xl">📋</div>
                <p className="mt-3 text-sm font-semibold text-brand-ink">Nothing here yet</p>
                <p className="mt-1 text-xs text-brand-muted">New bookings show up here automatically.</p>
              </div>
            ) : (
              recent.map((b) => (
                <div
                  key={b.id}
                  onClick={() => navigate('/admin/bookings')}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border-b border-neutral-100 pb-3 transition-colors last:border-0 last:pb-0 hover:bg-neutral-50"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-neutral-300 text-[11px] font-bold text-brand-ink">
                    {initials(b.first_name, b.last_name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-ink">{b.first_name} {b.last_name}</p>
                    <p className="truncate text-xs text-brand-muted">{b.session_title} · {b.format === 'online' ? 'Online' : 'Offline'}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-brand-muted">{timeAgo(b.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}