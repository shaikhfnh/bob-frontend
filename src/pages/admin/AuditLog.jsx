import { useState, useEffect } from 'react';
import { getAuditLog } from '../../services/auditService';
import { getUsers } from '../../services/userService';
import AuditDetailModal from '../../components/AuditDetailModal';
import UserProfileModal from '../../components/UserProfileModal';

const ACTION_LABELS = {
  edit_booking: '✏️ Edited a booking',
  cancel_booking: '🗑 Cancelled a booking',
  edit_user: '👤 Edited user details',
  create_session: '➕ Created a session',
  edit_session: '✏️ Edited a session',
  delete_session: '🗑 Deleted a session',
};

function fmtDate(ts) {
  return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AuditLog() {
  const [log, setLog] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingDetail, setViewingDetail] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  function refresh() {
    getUsers().then(setUsers).catch(() => {});
  }

  useEffect(() => {
    Promise.all([getAuditLog(), getUsers()])
      .then(([logData, usersData]) => { setLog(logData); setUsers(usersData); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function getCivilId(entry) {
    try {
      const details = JSON.parse(entry.details || '{}');
      return details._civilId || entry.target_id;
    } catch {
      return entry.target_id;
    }
  }

  function handleNameClick(entry) {
    const civilId = getCivilId(entry);
    const match = users.find((u) => u.civil_id === civilId);
    if (match) setViewingUser(match);
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-ink">Audit Log</h1>
      <p className="mb-5 text-sm text-brand-muted">Every admin action, most recent first</p>

      {loading && <p className="text-sm text-brand-muted">Loading...</p>}
      {error && <p className="text-sm font-medium text-red-600">⚠ {error}</p>}

      {!loading && !error && (
        <div className="space-y-2">
          {log.length === 0 && <p className="text-sm text-brand-muted">No admin actions recorded yet.</p>}
          {log.map((entry) => {
            const canOpenProfile = (entry.target_type === 'registrant' || entry.target_type === 'user') && users.some((u) => u.civil_id === getCivilId(entry));
            return (
              <div
                key={entry.id}
                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 p-4 transition-all hover:shadow-sm"
              >
                <button onClick={() => setViewingDetail(entry)} className="flex-1 text-left">
                  <p className="text-sm font-semibold text-brand-ink">
                    {ACTION_LABELS[entry.action] || entry.action}
                  </p>
                  <p className="text-xs text-brand-muted">
                    by {entry.admin_email} ·{' '}
                    {canOpenProfile ? (
                      <span
                        onClick={(e) => { e.stopPropagation(); handleNameClick(entry); }}
                        className="font-semibold text-brand-red underline hover:no-underline"
                      >
                        {entry.target_name || `${entry.target_type} #${entry.target_id}`}
                      </span>
                    ) : (
                      entry.target_name || `${entry.target_type} #${entry.target_id}`
                    )}
                  </p>
                </button>
                <span className="flex-shrink-0 text-xs text-brand-muted">{fmtDate(entry.created_at)}</span>
              </div>
            );
          })}
        </div>
      )}

      <AuditDetailModal entry={viewingDetail} open={!!viewingDetail} onClose={() => setViewingDetail(null)} />
      <UserProfileModal user={viewingUser} open={!!viewingUser} onClose={() => setViewingUser(null)} onSaved={refresh} />
    </div>
  );
}