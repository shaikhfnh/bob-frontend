import { useState, useEffect } from 'react';
import GlassCard from '../../components/GlassCard';
import Switch from '../../components/Switch';
import { getSettings, updateSetting } from '../../services/settingsService';

const LABELS = {
  manual_review: {
    title: 'Require manual review before auto-accept',
    sub: 'When on, new registrations wait for approval instead of confirming instantly',
  },
  admin_email_on_booking: {
    title: 'Email admin on every new booking',
    sub: 'Sent to the account email on file',
  },
  attendee_confirmation_email: {
    title: 'Send confirmation email to attendee',
    sub: 'Auto-sent immediately after booking',
  },
};

export default function Notifications() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSettings().then(setSettings).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  async function toggle(key) {
    const newValue = !settings[key];
    setSettings((s) => ({ ...s, [key]: newValue })); // optimistic update
    try {
      await updateSetting(key, newValue);
    } catch (err) {
      setSettings((s) => ({ ...s, [key]: !newValue })); // revert on failure
      setError('Failed to save — reverted.');
    }
  }

  if (loading) return <p className="text-sm text-brand-muted">Loading settings...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-ink">Notifications</h1>
      <p className="text-sm text-brand-muted">Real settings — changes persist and take effect immediately</p>
      {error && <p className="mt-2 text-xs font-medium text-red-600">⚠ {error}</p>}

      <GlassCard className="mt-6 divide-y divide-neutral-100">
        {Object.entries(LABELS).map(([key, { title, sub }]) => (
          <div key={key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-brand-ink">{title}</p>
              <p className="text-xs text-brand-muted">{sub}</p>
            </div>
            <Switch checked={!!settings[key]} onChange={() => toggle(key)} label={title} />
          </div>
        ))}
      </GlassCard>
    </div>
  );
}