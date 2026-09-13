import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';

const ACTION_LABELS = {
  edit_booking: 'Edited a booking',
  cancel_booking: 'Cancelled a booking',
  edit_user: 'Edited user details',
  create_session: 'Created a session',
  edit_session: 'Edited a session',
  delete_session: 'Deleted a session',
};

function fmtDate(ts) {
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AuditDetailModal({ entry, open, onClose }) {
  let details = null;
  try { details = entry?.details ? JSON.parse(entry.details) : null; } catch { details = null; }

  return (
    <AnimatePresence>
      {open && entry && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={springs.default}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-red">
                    {ACTION_LABELS[entry.action] || entry.action}
                  </p>
                  <p className="mt-1 text-sm text-brand-muted">by {entry.admin_email}</p>
                </div>
                <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
              </div>

              <div className="mt-4 space-y-2 rounded-xl bg-neutral-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Target</span>
                  <span className="font-medium text-brand-ink">{entry.target_type} #{entry.target_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">When</span>
                  <span className="font-medium text-brand-ink">{fmtDate(entry.created_at)}</span>
                </div>
              </div>

              {details && Object.keys(details).length > 0 ? (
  <div className="mt-4">
    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-muted">What changed</p>
    <div className="space-y-2.5">
      {Object.entries(details).filter(([key]) => key !== '_civilId').map(([key, change]) => (
        <div key={key} className="rounded-lg bg-neutral-50 p-3">
          <p className="text-xs font-semibold capitalize text-brand-ink">{key.replace(/([A-Z])/g, ' $1')}</p>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="rounded bg-red-50 px-2 py-0.5 text-red-600 line-through">{String(change.from ?? '—')}</span>
            <span className="text-brand-muted">→</span>
            <span className="rounded bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">{String(change.to ?? '—')}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
  <p className="mt-4 text-sm text-brand-muted">No field changes recorded — this was likely a no-op save.</p>
)}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}