import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';

function TopicsList({ raw, dir = 'ltr' }) {
  if (!raw) return null;
  let topics;
  try { topics = JSON.parse(raw); } catch { return null; }
  if (!Array.isArray(topics) || topics.length === 0) return null;
  return (
    <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2" dir={dir}>
      {topics.map((t, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-brand-ink">
          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-red" />
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function SessionViewModal({ session, open, onClose, onEdit }) {
  return (
    <AnimatePresence>
      {open && session && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={springs.default}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              >
              <div className="flex items-start justify-between border-b border-neutral-100 p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-red">
                    {session.format === 'online' ? '💻 Online' : `📍 ${session.location || 'Offline'}`}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-brand-ink">{session.title}</h2>
                  {session.title_ar && (
                    <h2 className="mt-1 text-lg font-bold text-brand-muted" dir="rtl">{session.title_ar}</h2>
                  )}
                </div>
                <button onClick={onClose} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200">✕</button>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-4 text-sm text-brand-muted">
                  <span>📅 {session.date}</span>
                  <span>⏱ {session.duration_minutes || 90} min</span>
                  <span>👤 {session.speaker_name || session.host || '—'}</span>
                  {session.format === 'offline' && <span>🎟 Capacity: {session.capacity}</span>}
                  {session.seats_limited === 1 && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">Limited Seating</span>
                  )}
                </div>

                {session.description && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-brand-muted">Description</p>
                    <p className="mt-1 text-sm text-brand-ink">{session.description}</p>
                    {session.description_ar && (
                      <p className="mt-2 text-sm text-brand-ink" dir="rtl">{session.description_ar}</p>
                    )}
                  </div>
                )}

                {session.topics && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-brand-muted">Topics Covered</p>
                    <TopicsList raw={session.topics} />
                    {session.topics_ar && <TopicsList raw={session.topics_ar} dir="rtl" />}
                  </div>
                )}
              </div>

              {onEdit && (
                <div className="flex justify-end gap-3 border-t border-neutral-100 p-6">
                  <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-muted hover:bg-neutral-100">
                    Close
                  </button>
                  <button
                    onClick={() => { onClose(); onEdit(session); }}
                    className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white hover:bg-brand-red-dark"
                  >
                    Edit Session
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}