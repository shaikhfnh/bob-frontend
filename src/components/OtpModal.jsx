// import { useState } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { springs } from '../styles/motion';
// import { verifyOtp, sendOtp } from '../services/otpService';

// export default function OtpModal({ open, email, onVerified, onClose }) {
//   const [code, setCode] = useState('');
//   const [error, setError] = useState('');
//   const [verifying, setVerifying] = useState(false);
//   const [resending, setResending] = useState(false);

//   async function handleVerify(e) {
//     e.preventDefault();
//     setError('');
//     setVerifying(true);
//     try {
//       await verifyOtp(email, code);
//       onVerified();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setVerifying(false);
//     }
//   }

//   async function handleResend() {
//     setResending(true);
//     setError('');
//     try {
//       await sendOtp(email);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setResending(false);
//     }
//   }

//   return (
//     <AnimatePresence>
//       {open && (
//         <>
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <motion.form
//               onSubmit={handleVerify}
//               initial={{ opacity: 0, scale: 0.92, y: 12 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               transition={springs.default}
//               className="relative w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl"
//             >
//               <button
//                 type="button"
//                 onClick={onClose}
//                 aria-label="Close"
//                 className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200"
//               >
//                 ✕
//               </button>

//               <h3 className="text-lg font-bold text-brand-ink">Verify your email</h3>
//               <p className="mt-2 text-sm text-brand-muted">We sent a 6-digit code to <strong>{email}</strong></p>

//               <input
//                 type="text" maxLength={6} inputMode="numeric" autoFocus
//                 value={code}
//                 onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
//                 className="mt-5 w-full rounded-lg border border-neutral-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:border-brand-red focus:outline-none"
//                 placeholder="——————"
//               />

//               {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}

//               <button
//                 type="submit" disabled={code.length !== 6 || verifying}
//                 className="mt-5 w-full rounded-lg bg-brand-red py-2.5 text-sm font-bold text-white disabled:opacity-50"
//               >
//                 {verifying ? 'Verifying...' : 'Verify & Register'}
//               </button>

//               <div className="mt-3 flex justify-center gap-4 text-xs">
//                 <button type="button" onClick={handleResend} disabled={resending} className="font-medium text-brand-muted underline">
//                   {resending ? 'Sending...' : "Didn't get it? Resend"}
//                 </button>
//                 <button type="button" onClick={onClose} className="font-medium text-brand-muted underline">
//                   Cancel
//                 </button>
//               </div>
//             </motion.form>
//           </div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';

export default function OtpModal({ open, email, onVerified, onClose }) {
  const [code, setCode] = useState('');

  function handleVerify(e) {
    e.preventDefault();
    // TEST MODE: no real email sent, no real verification — any 6 digits
    // proceeds directly. Swap this back to the real sendOtp/verifyOtp calls
    // once a working email provider is confirmed.
    onVerified();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.form
              onSubmit={handleVerify}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springs.default}
              className="relative w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl"
            >
              <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200">✕</button>

              <h3 className="text-lg font-bold text-brand-ink">Verify your email</h3>
              <p className="mt-2 text-sm text-brand-muted">
                Enter any 6 digits to continue <span className="font-semibold text-amber-600">(test mode)</span>
              </p>

              <input
                type="text" maxLength={6} inputMode="numeric" autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="mt-5 w-full rounded-lg border border-neutral-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:border-brand-red focus:outline-none"
                placeholder="——————"
              />

              <button
                type="submit" disabled={code.length !== 6}
                className="mt-5 w-full rounded-lg bg-brand-red py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                Verify & Register
              </button>
            </motion.form>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}