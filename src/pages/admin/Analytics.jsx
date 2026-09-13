import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../../styles/motion';
import Heatmap from '../../components/Heatmap';
import { getRegistrations } from '../../services/registrationService';
import {
  getFunnelSummary, getTimeToComplete, getSessionLeaderboard, getPeakHours,
  getDropoff, getSources, getLanguageSplit, getDeviceSplit, getTrend,
} from '../../services/funnelService';
import DonutChart from '../../components/DonutChart';

const TABS = ['overview', 'funnel', 'insights', 'heatmap'];

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-neutral-200 bg-white p-6 ${className}`}>{children}</div>;
}

function EmptyState({ icon = '📊', title = 'No data yet', sub = 'Numbers will appear here once activity comes in.' }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-xl">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-brand-ink">{title}</p>
      <p className="mt-1 text-xs text-brand-muted">{sub}</p>
    </div>
  );
}

function SkeletonBlock({ h = 'h-24' }) {
  return <div className={`mt-4 w-full animate-pulse rounded-lg bg-neutral-100 ${h}`} />;
}

function BarRow({ label, value, max, color = 'bg-brand-red', delay = 0 }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="truncate text-brand-ink">{label}</span>
        <span className="flex-shrink-0 font-semibold text-brand-ink">{value}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ ...springs.default, delay }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [tab, setTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [funnel, setFunnel] = useState(null);
  const [timeToComplete, setTimeToComplete] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [dropoff, setDropoff] = useState([]);
  const [sources, setSources] = useState([]);
  const [langSplit, setLangSplit] = useState([]);
  const [deviceSplit, setDeviceSplit] = useState([]);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    getRegistrations().then(setBookings).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getFunnelSummary().then(setFunnel);
    getTimeToComplete().then(setTimeToComplete);
    getSessionLeaderboard().then((data) => setLeaderboard(data.sort((a, b) => b.registrations - a.registrations)));
    getPeakHours().then(setPeakHours);
    getDropoff().then(setDropoff);
    getSources().then(setSources);
    getLanguageSplit().then(setLangSplit);
    getDeviceSplit().then(setDeviceSplit);
    getTrend().then(setTrend);
  }, []);

  const online = bookings.filter((b) => b.format === 'online').length;
  const offline = bookings.filter((b) => b.format === 'offline').length;
  const maxTrend = Math.max(...trend.map((t) => t.count), 1);
  const maxPeak = Math.max(...peakHours, 1);
  const peakHourIndex = peakHours.indexOf(maxPeak);
  const maxDropoff = Math.max(...dropoff.map((d) => d.count), 1);
  const maxSource = Math.max(...sources.map((s) => s.clicks), 1);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-ink">Analytics</h1>
      <p className="mb-5 text-sm text-brand-muted">Built from real bookings, funnel, and click data</p>

      <div className="mb-5 flex w-fit gap-2 rounded-lg bg-neutral-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold capitalize transition-all ${
              tab === t ? 'bg-white text-brand-ink shadow-sm' : 'text-brand-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'overview' && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <h3 className="text-sm font-bold text-brand-ink">Format split</h3>
                {loading ? <SkeletonBlock /> : bookings.length === 0 ? (
                  <EmptyState icon="🥯" title="No bookings yet" sub="Format split appears once people register." />
                ) : (
                  <div className="mt-4">
                    <DonutChart data={[
                      { label: 'Online', value: online, color: '#3b82f6' },
                      { label: 'Offline', value: offline, color: '#f59e0b' },
                    ]} />
                  </div>
                )}
              </Card>

              <Card>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-brand-ink">Registrations over time</h3>
                  {trend.length > 0 && (
                    <p className="text-xs text-brand-muted">Last {trend.length} day{trend.length === 1 ? '' : 's'}</p>
                  )}
                </div>
                {trend.length === 0 ? (
                  <EmptyState icon="📈" title="No trend yet" sub="A daily line builds up as registrations come in." />
                ) : (
                  <div className="mt-5 flex h-32 items-end gap-1">
                    {trend.map((t, i) => (
                      <motion.div
                        key={t.day}
                        initial={{ height: 0 }}
                        animate={{ height: `${(t.count / maxTrend) * 100}%` }}
                        transition={{ ...springs.default, delay: i * 0.02 }}
                        className="flex-1 rounded-t bg-brand-red"
                        style={{ minHeight: t.count > 0 ? 3 : 0 }}
                        title={`${t.day}: ${t.count}`}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {tab === 'funnel' && (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Real funnel shape — each stage is genuinely narrower than the
                  last, since this content actually is a sequence, not a
                  decorative choice. */}
              <Card>
                <h3 className="text-sm font-bold text-brand-ink">Conversion funnel</h3>
                {!funnel ? <SkeletonBlock /> : funnel.pageViews === 0 ? (
                  <EmptyState icon="🔻" title="No visits yet" sub="The funnel fills in as people reach the site." />
                ) : (
                  <div className="mt-5 flex flex-col items-center gap-1.5">
                    {[
                      { label: 'Visited the site', value: funnel.pageViews },
                      { label: 'Started the form', value: funnel.started },
                      { label: 'Completed registration', value: funnel.completed },
                    ].map((stage, i) => {
                      const widthPct = funnel.pageViews ? (stage.value / funnel.pageViews) * 100 : 0;
                      return (
                        <motion.div
                          key={stage.label}
                          initial={{ opacity: 0, scaleX: 0.8 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ ...springs.default, delay: i * 0.08 }}
                          className="flex w-full flex-col items-center"
                        >
                          <div
                            className="flex items-center justify-between rounded-lg bg-brand-red px-4 py-2.5 text-white"
                            style={{ width: `${Math.max(widthPct, 24)}%` }}
                          >
                            <span className="truncate text-xs font-semibold">{stage.label}</span>
                            <span className="ml-2 flex-shrink-0 text-sm font-bold">{stage.value}</span>
                          </div>
                          {i < 2 && <div className="h-1.5 w-px bg-neutral-200" />}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>

              <Card>
                <h3 className="text-sm font-bold text-brand-ink">Avg. time to complete</h3>
                {!timeToComplete ? <SkeletonBlock h="h-16" /> : !timeToComplete.avgSeconds ? (
                  <EmptyState icon="⏱" title="Not enough data" sub="Needs a completed registration within a started session." />
                ) : (
                  <div className="mt-4">
                    <p className="text-5xl font-bold tracking-tight text-brand-ink">
                      {Math.round(timeToComplete.avgSeconds)}<span className="text-lg font-semibold text-brand-muted">s</span>
                    </p>
                    <p className="mt-1 text-xs text-brand-muted">average across {timeToComplete.sampleSize} sample{timeToComplete.sampleSize === 1 ? '' : 's'}</p>
                  </div>
                )}
              </Card>

              <Card>
                <h3 className="text-sm font-bold text-brand-ink">Session performance</h3>
                {leaderboard.length === 0 ? (
                  <EmptyState icon="🏆" title="No sessions tracked yet" />
                ) : (
                  <div className="mt-4 space-y-3">
                    {leaderboard.map((s, i) => (
                      <BarRow key={s.id} label={s.title} value={s.registrations} max={Math.max(...leaderboard.map((l) => l.registrations), 1)} delay={i * 0.05} />
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-brand-ink">Peak registration hours</h3>
                  {maxPeak > 0 && (
                    <p className="text-xs font-semibold text-brand-red">{peakHourIndex}:00 is busiest</p>
                  )}
                </div>
                {peakHours.every((c) => c === 0) ? (
                  <EmptyState icon="🕑" title="No hourly data yet" />
                ) : (
                  <>
                    <div className="mt-4 flex h-24 items-end gap-1">
                      {peakHours.map((count, hour) => (
                        <motion.div
                          key={hour}
                          initial={{ height: 0 }}
                          animate={{ height: `${(count / maxPeak) * 100}%` }}
                          transition={{ ...springs.default, delay: hour * 0.015 }}
                          className={`flex-1 rounded-t ${hour === peakHourIndex ? 'bg-brand-red' : 'bg-neutral-200'}`}
                          style={{ minHeight: count > 0 ? 3 : 0 }}
                          title={`${hour}:00 — ${count}`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-brand-muted">Hours 0–23, left to right</p>
                  </>
                )}
              </Card>
            </div>
          )}

          {tab === 'insights' && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <h3 className="text-sm font-bold text-brand-ink">Where people drop off</h3>
                <p className="mb-4 text-xs text-brand-muted">Last field touched before abandoning, among people who never completed.</p>
                {dropoff.length === 0 ? (
                  <EmptyState icon="🚪" title="No drop-off data yet" sub="Needs someone to start and not finish the form." />
                ) : (
                  <div className="space-y-3">
                    {dropoff.map((d, i) => (
                      <BarRow key={d.field_name} label={d.field_name} value={d.count} max={maxDropoff} color="bg-amber-500" delay={i * 0.05} />
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <h3 className="text-sm font-bold text-brand-ink">Registration sources</h3>
                <p className="mb-4 text-xs text-brand-muted">Which "Register Now" button people actually click.</p>
                {sources.length === 0 ? (
                  <EmptyState icon="🖱️" title="No click data yet" />
                ) : (
                  <div className="space-y-3">
                    {sources.map((s, i) => (
                      <BarRow key={s.source} label={s.source} value={s.clicks} max={maxSource} color="bg-blue-500" delay={i * 0.05} />
                    ))}
                  </div>
                )}
              </Card>

              {/* Language + device as compact side-by-side stat pairs instead
                  of two more full donuts — Overview already owns the donut
                  treatment, repeating it here would just be decoration. */}
              <Card className="lg:col-span-2">
                <h3 className="text-sm font-bold text-brand-ink">Language &amp; device</h3>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-brand-muted">Language</p>
                    {langSplit.length === 0 ? <p className="mt-2 text-sm text-brand-muted">No data yet.</p> : (
                      <div className="mt-2 space-y-2">
                        {langSplit.map((l) => (
                          <BarRow
                            key={l.language}
                            label={l.language === 'ar' ? 'Arabic' : 'English'}
                            value={l.count}
                            max={Math.max(...langSplit.map((x) => x.count), 1)}
                            color={l.language === 'ar' ? 'bg-emerald-500' : 'bg-indigo-500'}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-muted">Device</p>
                    {deviceSplit.length === 0 ? <p className="mt-2 text-sm text-brand-muted">No data yet.</p> : (
                      <div className="mt-2 space-y-2">
                        {deviceSplit.map((d) => (
                          <BarRow
                            key={d.device}
                            label={d.device === 'mobile' ? 'Mobile' : 'Desktop'}
                            value={d.count}
                            max={Math.max(...deviceSplit.map((x) => x.count), 1)}
                            color={d.device === 'mobile' ? 'bg-amber-500' : 'bg-blue-500'}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {tab === 'heatmap' && (
            <Card>
              <h3 className="mb-3 text-sm font-bold text-brand-ink">Click density — homepage</h3>
              <Heatmap page="/" />
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}