import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
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

  function refresh() { getUsers().then(setUsers).catch(() => {}); }

  useEffect(() => {
    Promise.all([getAuditLog(), getUsers()])
      .then(([logData, usersData]) => { setLog(logData); setUsers(usersData); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function getCivilId(entry) {
    try { return JSON.parse(entry.details || '{}')._civilId || entry.target_id; } catch { return entry.target_id; }
  }

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: (e) => ACTION_LABELS[e.action] || e.action,
    },
    {
      key: 'target_name',
      label: 'Target',
      render: (e) => {
        const civilId = getCivilId(e);
        const match = users.find((u) => u.civil_id === civilId);
        const name = e.target_name || `${e.target_type} #${e.target_id}`;
        return match ? (
          <button onClick={(ev) => { ev.stopPropagation(); setViewingUser(match); }} className="font-semibold text-brand-red underline hover:no-underline">
            {name}
          </button>
        ) : name;
      },
    },
    { key: 'admin_email', label: 'Admin' },
    { key: 'created_at', label: 'When', render: (e) => fmtDate(e.created_at), exportValue: (e) => new Date(e.created_at).toISOString() },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-ink">Audit Log</h1>
      <p className="mb-5 text-sm text-brand-muted">Every admin action, searchable and filterable</p>

      <DataTable
        data={log}
        columns={columns}
        searchKeys={['admin_email', 'target_name', 'action']}
        filters={[{
          key: 'action',
          options: [
            { value: 'all', label: 'All' },
            { value: 'edit_booking', label: 'Edited Bookings' },
            { value: 'cancel_booking', label: 'Cancellations' },
            { value: 'edit_user', label: 'User Edits' },
            { value: 'edit_session', label: 'Session Edits' },
          ],
        }]}
        exportFilename="audit-log"
        loading={loading}
        error={error}
        onRowClick={(entry) => setViewingDetail(entry)}
      />

      <AuditDetailModal entry={viewingDetail} open={!!viewingDetail} onClose={() => setViewingDetail(null)} />
      <UserProfileModal user={viewingUser} open={!!viewingUser} onClose={() => setViewingUser(null)} onSaved={refresh} />
    </div>
  );
}