import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';
import { getRegistrations } from '../services/registrationService';
import { getSessions } from '../services/sessionService';
import SessionViewModal from './SessionViewModal';

function fmtDate(ts) {
  return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function UserBookingsModal({ user, open, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingSession, setViewingSession] = useState(null);

useEffect(() => {
  if (!open || !user) return;
  setLoading(true);
  Promise.all([getRegistrations(), getSessions()])
    .then(([allBookings, allSessions]) => {
      setBookings(allBookings.filter((b) => b.civil_id === user.civil_id));
      setSessions(allSessions);
    })
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
}, [open, user]);

  return (
    <>
      <AnimatePresence>
        {open && user && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={springs.sheet}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-brand-ink">{user.first_name} {user.last_name}</h2>
                  <p className="text-xs text-brand-muted">{user.email}</p>
                </div>
                <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
              </div>

              <div className="mt-6">
                {loading && <p className="text-sm text-brand-muted">Loading...</p>}
                {error && <p className="text-sm font-medium text-red-600">⚠ {error}</p>}

                {!loading && !error && bookings.length === 0 && (
                  <p className="text-sm text-brand-muted">No bookings found for this person.</p>
                )}

                {!loading && !error && bookings.length > 0 && (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => openSessionView(b)}
                        className="w-full rounded-xl border border-neutral-200 p-4 text-left transition-all hover:border-brand-red hover:shadow-sm"
                      >
                        <p className="text-sm font-semibold text-brand-ink">{b.session_title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-brand-muted">
                          <span className="rounded-full border border-neutral-200 px-2 py-0.5 font-semibold text-brand-ink">
                            {b.format === 'online' ? '💻 Online' : '📍 Offline'}
                          </span>
                          <span>Booked {fmtDate(b.created_at)}</span>
                        </div>
                        {b.housing_authority_registered ? (
                          <p className="mt-2 text-xs font-semibold text-emerald-600">
                            ✓ Housing Authority since {b.housing_authority_year || '—'}
                          </p>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* No Edit button here — from a user's booking history, viewing the
          session is the natural action; editing the session itself is a
          Sessions-admin task, kept out of this context on purpose. */}
      <SessionViewModal session={viewingSession} open={!!viewingSession} onClose={() => setViewingSession(null)} />
    </>
  );
}