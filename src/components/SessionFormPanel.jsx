import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';

const EMPTY = {
  title: '', title_ar: '',
  description: '', description_ar: '',
  date: '', host: '',
  speakerName: '', speaker_name_ar: '',
  durationMinutes: 90, seatsLimited: false,
  format: 'online', location: '', capacity: 100,
  topics: '', topics_ar: '',
  waitlistLimit: '',
};

export default function SessionFormPanel({ session, open, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(session ? {
      title: session.title || '',
      title_ar: session.title_ar || '',
      description: session.description || '',
      description_ar: session.description_ar || '',
      date: session.date || '',
      host: session.host || '',
      speakerName: session.speaker_name || session.host || '',
      speaker_name_ar: session.speaker_name_ar || '',
      durationMinutes: session.duration_minutes || 90,
      seatsLimited: !!session.seats_limited,
      format: session.format || 'online',
      location: session.location || '',
      capacity: session.capacity || 100,
      topics: session.topics ? JSON.parse(session.topics).join('\n') : '',
      topics_ar: session.topics_ar ? JSON.parse(session.topics_ar).join('\n') : '',
    } : EMPTY);
    setError('');
  }, [session, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Convert newline-separated topics back into a JSON array string
      const payload = {
        ...form,
        topics: form.topics.trim() ? JSON.stringify(form.topics.split('\n').map((t) => t.trim()).filter(Boolean)) : null,
        topics_ar: form.topics_ar.trim() ? JSON.stringify(form.topics_ar.split('\n').map((t) => t.trim()).filter(Boolean)) : null,
      };
      await onSave(payload, session?.id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this session? It will no longer appear on the public site.')) return;
    setSaving(true);
    try {
      await onDelete(session.id);
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
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
              <h2 className="text-lg font-bold text-brand-ink">{session ? 'Edit Session' : 'Add Session'}</h2>
              <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Title (English)</label>
                <input
                  required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Title (Arabic)</label>
                <input
                  dir="rtl" value={form.title_ar}
                  onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Description (English)</label>
                <textarea
                  rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Description (Arabic)</label>
                <textarea
                  dir="rtl" rows={3} value={form.description_ar}
                  onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Date</label>
                  <input
                    type="date" required value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Duration (min)</label>
                  <input
                    type="number" value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Speaker Name (English)</label>
                <input
                  value={form.speakerName}
                  onChange={(e) => setForm({ ...form, speakerName: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Speaker Name (Arabic)</label>
                <input
                  dir="rtl" value={form.speaker_name_ar}
                  onChange={(e) => setForm({ ...form, speaker_name_ar: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Format</label>
                <select
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {form.format === 'offline' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Location</label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Capacity</label>
                    <input
                      type="number" value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                    />
                  </div>
                  <div>
  <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Waitlist Limit (leave blank for no waitlist)</label>
  <input
    type="number" value={form.waitlistLimit}
    onChange={(e) => setForm({ ...form, waitlistLimit: e.target.value })}
    placeholder="e.g. 5, 8, 12"
    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
  />
</div>
                </>
              )}

              <label className="flex items-center gap-2 rounded-lg bg-neutral-50 p-3 text-sm text-brand-ink">
                <input
                  type="checkbox" checked={form.seatsLimited}
                  onChange={(e) => setForm({ ...form, seatsLimited: e.target.checked })}
                />
                Show "Limited Seating" badge
              </label>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Topics Covered (English) — one per line</label>
                <textarea
                  rows={5} value={form.topics}
                  onChange={(e) => setForm({ ...form, topics: e.target.value })}
                  placeholder={'Preparing for your journey\nConstruction and execution\n...'}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Topics Covered (Arabic) — one per line</label>
                <textarea
                  dir="rtl" rows={5} value={form.topics_ar}
                  onChange={(e) => setForm({ ...form, topics_ar: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                />
              </div>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">⚠ {error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-brand-red py-2.5 text-sm font-bold text-white disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Session'}
                </button>
                {session && (
                  <button type="button" onClick={handleDelete} disabled={saving} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}