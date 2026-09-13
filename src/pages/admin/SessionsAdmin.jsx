import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import SessionFormPanel from '../../components/SessionFormPanel';
import SessionViewModal from '../../components/SessionViewModal';
import Button from '../../components/Button';
import { getSessions, createSession, updateSession, deleteSession } from '../../services/sessionService';

export default function SessionsAdmin() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  async function refresh() {
    try {
      setSessions(await getSessions());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  function openAdd() {
    setEditingSession(null);
    setPanelOpen(true);
  }
  function openEdit(session) {
    setEditingSession(session);
    setPanelOpen(true);
  }
  async function handleSave(form, id) {
    if (id) await updateSession(id, form);
    else await createSession(form);
    refresh();
  }
  async function handleDelete(id) {
    await deleteSession(id);
    refresh();
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'date', label: 'Date', hideOnMobile: true },
    { key: 'speaker_name', label: 'Host', hideOnMobile: true, render: (s) => s.speaker_name || s.host || '—' },
    {
      key: 'format',
      label: 'Format',
      render: (s) => (
        <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs font-semibold text-brand-ink">
          {s.format === 'online' ? '💻 Online' : `📍 ${s.location || 'Offline'}`}
        </span>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      hideOnMobile: true,
      render: (s) => (s.format === 'online' ? 'Unlimited' : `${s.booked || 0} / ${s.capacity}`),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-ink">Manage Sessions</h1>
          <p className="text-sm text-brand-muted">Changes here reflect live on the public site immediately</p>
        </div>
        <Button variant="primary" onClick={openAdd}>+ Add Session</Button>
      </div>

      <div className="mt-6">
        <DataTable
          data={sessions}
          columns={columns}
          searchKeys={['title', 'speaker_name', 'host']}
          filters={[{ key: 'format', options: [{ value: 'all', label: 'All' }, { value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline' }] }]}
          exportFilename="sessions"
          loading={loading}
          error={error}
          onRowClick={(s) => setViewing(s)}
          pageSize={8}
        />
      </div>

      <SessionViewModal
        session={viewing}
        open={!!viewing}
        onClose={() => setViewing(null)}
        onEdit={openEdit}
      />

      <SessionFormPanel
        session={editingSession}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}