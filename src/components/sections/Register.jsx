import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { springs } from '../../styles/motion';
import { useInView } from '../../hooks/useInView';
import { getSessions } from '../../services/sessionService';
import { submitRegistration } from '../../services/registrationService';
import FloatingInput from '../FloatingInput';
import SessionPicker from '../SessionPicker';
import KuwaitFlag from '../KuwaitFlag';
import Toast from '../Toast';
import Button from '../Button';
import { logFunnelEvent, logFieldFocus } from '../../services/funnelService';
import { isValidCivilId } from '../../utils/civilId';
import ConfirmationModal from '../ConfirmationModal';
import { useLanguage } from '../../context/LanguageContext';
import OtpModal from '../OtpModal';

const EMPTY_FORM = { firstName: '', lastName: '', phone: '', email: '', civilId: '', sessionId: '', consent: false, housingRegistered: false, housingYear: '' };

export default function Register() {
  const [ref, inView] = useInView();
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [started, setStarted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const { t } = useLanguage();
  const [shake, setShake] = useState(false);

  useEffect(() => {
    getSessions().then((data) => {
      setSessions(data);
      if (data.length) setForm((f) => ({ ...f, sessionId: data[0].id }));
    });
  }, []);

  const selectedSession = sessions.find((s) => s.id === form.sessionId);
  const isHybrid = selectedSession?.format === 'hybrid';

  useEffect(() => {
    if (selectedSession && !isHybrid) {
      setForm((f) => ({ ...f, format: selectedSession.format }));
    }
  }, [form.sessionId, isHybrid, selectedSession]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  }

  function markStarted() {
    if (!started) {
      setStarted(true);
      logFunnelEvent('form_started');
    }
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required.';
    if (form.phone.replace(/\D/g, '').length !== 8) e.phone = 'Invalid mobile number.';
    if (!form.email.includes('@')) e.email = 'Enter a valid email.';
    if (!isValidCivilId(form.civilId)) e.civilId = 'Invalid Civil ID number.';
    if (!form.consent) e.consent = 'You must agree to continue.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  let toastTimer;
  function showToast(message, type = 'success') {
    clearTimeout(toastTimer);
    setToast({ show: true, message, type });
    toastTimer = setTimeout(() => setToast((t) => ({ ...t, show: false })), 5000);
  }

  // TEST MODE: no real OTP email is sent — this just validates the form,
  // then shows the OTP screen so the flow still demos visually. Any 6
  // digits typed into that screen proceeds straight to real registration.
  function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setShowOtp(true);
  }

  async function handleOtpVerified() {
    setShowOtp(false);
    setSubmitting(true);
    try {
      await submitRegistration(form);
      logFunnelEvent('registration_completed', form.sessionId);
      const keepSessionId = form.sessionId;
      setForm({ ...EMPTY_FORM, sessionId: keepSessionId });
      setShowConfirmation(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="register" ref={ref} className="w-full bg-white px-6 py-20 md:px-16 md:py-28 lg:px-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={springs.default}
        className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-neutral-200 md:grid-cols-2"
      >
        <div className="flex flex-col justify-between bg-gradient-to-br from-brand-red to-brand-red-dark p-10 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/80">{t('register.reserveSpot')}</p>
            <h3 className="mt-3 text-2xl font-bold">{t('register.heading')}</h3>
            <p className="mt-2 text-sm text-white/85">{t('register.subheading')}</p>

            <div className="mt-8 space-y-5">
              {[
                { icon: '🔓', title: t('register.freeTitle'), sub: t('register.freeSub') },
                { icon: '🎥', title: t('register.recordingTitle'), sub: t('register.recordingSub') },
                { icon: '💬', title: t('register.qaTitle'), sub: t('register.qaSub') },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-base">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-white/70">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 border-t border-white/20 pt-5">
            <p className="text-2xl font-bold">340+</p>
            <p className="text-xs text-white/70">{t('register.registeredStat')}</p>
          </div>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <div className="flex gap-3">
              <FloatingInput className="flex-1 min-w-0" label={t('register.firstName')} required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} onFocus={() => { markStarted(); logFieldFocus('firstName'); }} error={errors.firstName} />
              <FloatingInput onFocus={() => logFieldFocus('lastName')} className="flex-1 min-w-0" label={t('register.lastName')} value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
            </div>

            <FloatingInput
              label={t('register.civilId')} onFocus={() => logFieldFocus('civilId')} required maxLength={12}
              value={form.civilId} onChange={(e) => update('civilId', e.target.value.replace(/\D/g, ''))}
              error={errors.civilId}
            />

            <FloatingInput
              label={t('register.mobile')} required maxLength={8} onFocus={() => logFieldFocus('phone')}
              prefix={<><KuwaitFlag /><span>+965</span></>}
              value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
              error={errors.phone}
            />

            <FloatingInput label={t('register.email')} onFocus={() => logFieldFocus('email')} required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />

            <SessionPicker sessions={sessions} value={form.sessionId} onChange={(id) => update('sessionId', id)} />

            {isHybrid ? (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">{t('register.format')}</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => update('format', 'online')}
                    className={`flex-1 rounded-lg border-[1.5px] py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                      form.format === 'online' ? 'border-brand-red bg-red-50 text-brand-red' : 'border-neutral-300 text-brand-muted'
                    }`}
                  >
                    💻 {t('speaker.online')}
                  </button>
                  <button
                    type="button"
                    onClick={() => update('format', 'offline')}
                    className={`flex-1 rounded-lg border-[1.5px] py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                      form.format === 'offline' ? 'border-brand-red bg-red-50 text-brand-red' : 'border-neutral-300 text-brand-muted'
                    }`}
                  >
                    📍 {t('speaker.inPerson')}
                  </button>
                </div>
              </div>
            ) : selectedSession && (
              <p className="rounded-lg bg-neutral-50 px-3 py-2.5 text-xs font-medium text-brand-muted">
                {selectedSession.format === 'online' ? `🌐 ${t('register.onlineOnly')}` : `📍 ${t('register.offlineOnly')}`}
              </p>
            )}

            <label className="flex items-start gap-2 rounded-lg bg-neutral-50 p-3 text-xs text-brand-muted">
              <input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} className="mt-0.5" />
              {t('register.consent')}
            </label>
            {errors.consent && <p className="text-xs font-medium text-red-600">{errors.consent}</p>}

            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs font-semibold text-brand-ink">{t('register.housingAuthorityQ')}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => update('housingRegistered', true)}
                  className={`flex-1 rounded-lg border-[1.5px] py-2 text-xs font-semibold transition-all active:scale-[0.98] ${
                    form.housingRegistered ? 'border-brand-red bg-red-50 text-brand-red' : 'border-neutral-300 text-brand-muted'
                  }`}
                >
                  {t('register.yes')}
                </button>
                <button
                  type="button"
                  onClick={() => update('housingRegistered', false)}
                  className={`flex-1 rounded-lg border-[1.5px] py-2 text-xs font-semibold transition-all active:scale-[0.98] ${
                    !form.housingRegistered ? 'border-brand-red bg-red-50 text-brand-red' : 'border-neutral-300 text-brand-muted'
                  }`}
                >
                  {t('register.no')}
                </button>
              </div>

              {form.housingRegistered && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 overflow-hidden">
                  <label className="mb-1 block text-xs font-semibold text-brand-muted">{t('register.housingYearQ')}</label>
                  <select
                    value={form.housingYear}
                    onChange={(e) => update('housingYear', e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                  >
                    <option value="">—</option>
                    {Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </motion.div>
              )}
            </div>

            {submitError && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
                ⚠ {submitError}
              </motion.div>
            )}

            <Button type="submit" variant="primary" className="w-full justify-center" disabled={submitting}>
              {submitting ? t('register.submitting') : t('register.proceed')}
            </Button>
          </form>
        </div>
      </motion.div>

      <ConfirmationModal open={showConfirmation} onClose={() => setShowConfirmation(false)} />
      <OtpModal open={showOtp} email={form.email} onVerified={handleOtpVerified} onClose={() => setShowOtp(false)} />
      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </section>
  );
}