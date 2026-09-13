import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { springs } from '../../styles/motion';
import { getRegistrations } from '../../services/registrationService';
import { getSessions } from '../../services/sessionService';

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

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getRegistrations(), getSessions()])
      .then(([b, s]) => { setBookings(b); setSessions(s); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalBookings = bookings.length;
  const onlineCount = bookings.filter((b) => b.format === 'online').length;
  const offlineCount = bookings.filter((b) => b.format === 'offline').length;
  const onlinePct = totalBookings ? Math.round((onlineCount / totalBookings) * 100) : 0;

  const fillingSessions = sessions
    .filter((s) => s.format === 'offline' && s.capacity)
    .map((s) => {
      const booked = bookings.filter((b) => b.session_id === s.id).length;
      return { ...s, booked, remaining: s.capacity - booked };
    })
    .filter((s) => s.remaining <= Math.max(3, s.capacity * 0.15));

  const recent = [...bookings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  // 7-day pulse — a quick-glance daily count, distinct from Analytics'
  // full 30-day trend chart. This answers "is today busy?" at a glance.
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

  if (loading) return <p className="text-sm text-brand-muted">Loading dashboard...</p>;
  if (error) return <p className="text-sm font-medium text-red-600">⚠ {error}</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-ink">Dashboard</h1>
      <p className="text-sm text-brand-muted">Live overview from real bookings and sessions</p>

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

      {/* Hero stat panel — one big number carries the page, everything else
          is supporting detail around it. Not four identical boxes. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8"
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold text-brand-muted">Total bookings</p>
            <p className="mt-1 text-6xl font-bold tracking-tight text-brand-ink">{totalBookings}</p>
            <p className="mt-2 text-sm text-brand-muted">across {sessions.length} active session{sessions.length === 1 ? '' : 's'}</p>
          </div>

          <div className="w-full max-w-xs md:w-64">
            <div className="flex justify-between text-xs text-brand-muted">
              <span>💻 Online · {onlineCount}</span>
              <span>📍 Offline · {offlineCount}</span>
            </div>
            <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${onlinePct}%` }}
                transition={{ ...springs.default, delay: 0.15 }}
                className="h-full bg-blue-500"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${100 - onlinePct}%` }}
                transition={{ ...springs.default, delay: 0.15 }}
                className="h-full bg-amber-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* 7-day pulse */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-brand-ink">Last 7 days</h3>
          <div className="mt-5 flex h-28 items-end gap-2.5">
            {dailyCounts.map((count, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(count / maxDaily) * 100}%` }}
                  transition={{ ...springs.default, delay: i * 0.05 }}
                  className={`w-full rounded-t-md ${i === 6 ? 'bg-brand-red' : 'bg-neutral-200'}`}
                  style={{ minHeight: count > 0 ? 4 : 0 }}
                  title={`${count}`}
                />
                <span className="text-[10px] text-brand-muted">{dayLabel(last7Days[i])}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Session capacity */}
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
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={springs.default}
                        className={`h-full rounded-full ${pct >= 85 ? 'bg-red-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
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