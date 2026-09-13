import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';
import { getRegistrations } from '../services/registrationService';
import { getSessions } from '../services/sessionService';
import { updateUser } from '../services/userService';
import SessionViewModal from './SessionViewModal';

function fmtDate(ts) {
  return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function UserProfileModal({ user, open, onClose, onSaved }) {
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingSession, setViewingSession] = useState(null);

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!open || !user) return;
    setForm({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setEditing(false);
    setSaveError('');

    setLoading(true);
    Promise.all([getRegistrations(), getSessions()])
      .then(([allBookings, allSessions]) => {
        setBookings(allBookings.filter((b) => b.civil_id === user.civil_id));
        setSessions(allSessions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, user]);

  function openSessionView(booking) {
    const fullSession = sessions.find((s) => s.id === booking.session_id);
    setViewingSession(fullSession || { title: booking.session_title, format: booking.format, date: booking.session_date });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await updateUser(user.civil_id, form);
      onSaved();
      setEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

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
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-brand-ink">{user.first_name} {user.last_name}</h2>
                  <p className="text-xs font-mono text-brand-muted">{user.civil_id}</p>
                </div>
                <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
              </div>

              {/* Details section — view or edit, toggled in place */}
              <div className="mt-6 rounded-xl border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Details</p>
                  {!editing && (
                    <button onClick={() => setEditing(true)} className="text-xs font-semibold text-brand-red hover:underline">
                      Edit
                    </button>
                  )}
                </div>

                {!editing ? (
                  <div className="space-y-1.5 text-sm">
                    <p><span className="text-brand-muted">Email:</span> {user.email}</p>
                    <p><span className="text-brand-muted">Phone:</span> +965 {user.phone}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-2.5">
                    <div className="flex gap-2">
                      <input
                        placeholder="First Name" value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className="w-1/2 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                      />
                      <input
                        placeholder="Last Name" value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        className="w-1/2 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                      />
                    </div>
                    <input
                      placeholder="Email" type="email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                    />
                    <input
                      placeholder="Phone" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                    />
                    {saveError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">⚠ {saveError}</p>}
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => setEditing(false)} className="flex-1 rounded-lg border border-neutral-200 py-2 text-xs font-semibold text-brand-muted hover:bg-neutral-50">
                        Cancel
                      </button>
                      <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-brand-red py-2 text-xs font-bold text-white disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Bookings list */}
              <div className="mt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-muted">
                  Bookings ({bookings.length})
                </p>

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

      <SessionViewModal session={viewingSession} open={!!viewingSession} onClose={() => setViewingSession(null)} />
    </>
  );
}