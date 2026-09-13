import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import UserProfileModal from '../../components/UserProfileModal';
import { getUsers } from '../../services/userService';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);

  function refresh() {
    getUsers().then(setUsers).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }
  useEffect(() => { refresh(); }, []);

  const columns = [
    {
      key: 'first_name',
      label: 'Name',
      render: (u) => `${u.first_name || ''} ${u.last_name || ''}`.trim() || '—',
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', hideOnMobile: true },
    { key: 'civil_id', label: 'Civil ID', hideOnMobile: true },
    {
      key: 'registrations',
      label: 'Registrations',
      render: (u) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.registrations > 1 ? 'bg-amber-50 text-amber-700' : 'bg-neutral-100 text-brand-muted'}`}>
          {u.registrations}
        </span>
      ),
    },
    {
      key: 'first_seen',
      label: 'First Seen',
      hideOnMobile: true,
      render: (u) => new Date(u.first_seen).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (u) => (
        <button
          onClick={(e) => { e.stopPropagation(); setViewing(u); }}
          className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-brand-muted transition-all hover:border-brand-ink hover:text-brand-ink"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-ink">Users</h1>
      <p className="text-sm text-brand-muted">Real registrants, deduplicated by Civil ID</p>

      <div className="mt-6">
        <DataTable
          data={users}
          columns={columns}
          searchKeys={['first_name', 'last_name', 'email', 'phone', 'civil_id']}
          exportFilename="users"
          loading={loading}
          error={error}
          pageSize={10}
        />
      </div>

      <UserProfileModal user={viewing} open={!!viewing} onClose={() => setViewing(null)} onSaved={refresh} />
    </div>
  );
}