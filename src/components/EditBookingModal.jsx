import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';
import { updateRegistration } from '../services/registrationService';
import { getSessions } from '../services/sessionService';

export default function EditBookingModal({ booking, open, onClose, onSaved }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', civilId: '', sessionId: '' });
  const [sessions, setSessions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) getSessions().then(setSessions).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (booking) {
      setForm({
        firstName: booking.first_name || '',
        lastName: booking.last_name || '',
        email: booking.email || '',
        phone: booking.phone || '',
        civilId: booking.civil_id || '',
        sessionId: booking.session_id || '',
      });
      setError('');
    }
  }, [booking, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateRegistration(booking.id, form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && booking && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.form
              onSubmit={handleSubmit}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springs.default}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-brand-ink">Edit Booking</h3>
                <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
              </div>

              <div className="mt-4 space-y-3">
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
                  placeholder="Civil ID" value={form.civilId}
                  onChange={(e) => setForm({ ...form, civilId: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                />
                <input
                  placeholder="Mobile" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                />
                <input
                  placeholder="Email" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                />

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Session</label>
                  <select
                    value={form.sessionId}
                    onChange={(e) => setForm({ ...form, sessionId: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">⚠ {error}</p>}

              <button type="submit" disabled={saving} className="mt-4 w-full rounded-lg bg-brand-red py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.form>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}