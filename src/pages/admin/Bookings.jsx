import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import EditBookingModal from '../../components/EditBookingModal';
import { getRegistrations, deleteRegistration } from '../../services/registrationService';

function initials(first, last) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
}
function fmtDate(ts) {
  return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  function refresh() {
    setLoading(true);
    getRegistrations()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  async function handleCancel(booking) {
    if (!confirm(`Cancel ${booking.first_name} ${booking.last_name}'s registration?`)) return;
    try {
      await deleteRegistration(booking.id);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  const columns = [
    {
      key: 'first_name',
      label: 'Name',
      render: (b) => (
        <div className="flex items-center gap-2.5 font-medium text-brand-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-[11px] font-bold text-brand-ink">
            {initials(b.first_name, b.last_name)}
          </span>
          {b.first_name} {b.last_name}
        </div>
      ),
      exportValue: (b) => `${b.first_name} ${b.last_name}`,
    },
    {
      key: 'civil_id',
      label: 'Civil ID',
      render: (b) => <span className="font-mono text-xs">{b.civil_id || '—'}</span>,
    },
    {
      key: 'email',
      label: 'Contact',
      render: (b) => (
        <div>
          <div className="text-brand-muted">{b.email}</div>
          <div className="text-xs text-brand-muted">+965 {b.phone}</div>
        </div>
      ),
      exportValue: (b) => `${b.email} / +965 ${b.phone}`,
    },
    { key: 'session_title', label: 'Session' },
    {
      key: 'format',
      label: 'Format',
      render: (b) => (
        <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs font-semibold text-brand-ink">
          {b.format === 'online' ? '💻 Online' : '📍 Offline'}
        </span>
      ),
      exportValue: (b) => (b.format === 'online' ? 'Online' : 'Offline'),
    },
    {
      key: 'housing_authority_registered',
      label: 'Housing Authority',
      render: (b) =>
        b.housing_authority_registered ? (
          <span className="text-xs font-semibold text-emerald-600">✓ Since {b.housing_authority_year || '—'}</span>
        ) : (
          <span className="text-xs text-brand-muted">—</span>
        ),
      exportValue: (b) => (b.housing_authority_registered ? `Yes (${b.housing_authority_year || 'year unknown'})` : 'No'),
    },
    { key: 'created_at', label: 'Booked', render: (b) => fmtDate(b.created_at), exportValue: (b) => new Date(b.created_at).toISOString() },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (b) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(b); }}
            className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-brand-muted transition-all hover:border-brand-ink hover:text-brand-ink"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleCancel(b); }}
            className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition-all hover:bg-red-50"
          >
            Cancel
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-ink">Bookings</h1>
      <p className="mb-5 text-sm text-brand-muted">Live registrations from the public site</p>

      <DataTable
        data={bookings}
        columns={columns}
        searchKeys={['first_name', 'last_name', 'email', 'phone', 'civil_id']}
        filters={[{ key: 'format', options: [{ value: 'all', label: 'All' }, { value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline' }] }]}
        exportFilename="bookings"
        loading={loading}
        error={error}
      />

      <EditBookingModal
        booking={editing}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={refresh}
      />
    </div>
  );
}