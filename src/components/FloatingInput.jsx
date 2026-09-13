import { useState, useId } from 'react';
import { motion } from 'motion/react';
import { springs } from '../styles/motion';

export default function FloatingInput({ label, value, onChange, error, type = 'text', required, prefix, className = '', ...props }) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const floated = focused || (value && value.length > 0);
  const labelLeft = prefix ? 86 : 13;

  return (
    <div className={className}>
      <div className={`relative h-[52px] rounded-lg border-[1.5px] bg-white transition-colors duration-150 ${
        error ? 'border-red-400' : focused ? 'border-brand-red' : 'border-neutral-300'
      }`}>
        {/* One flex row, one explicit height, one font-size applied to both
            the prefix and the input directly — this is what guarantees they
            share a baseline instead of hoping two separate elements agree */}
        <div className="flex h-full items-center pt-2.5">
          {prefix && (
            <span className="flex flex-shrink-0 items-center gap-1.5 pl-3 text-[15px] font-semibold leading-none text-brand-muted">
              {prefix}
            </span>
          )}
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="h-full w-full min-w-0 bg-transparent px-3 text-[15px] leading-none text-brand-ink outline-none"
            style={{ fontSize: '15px' }}
            {...props}
          />
        </div>

        <motion.label
          htmlFor={id}
          initial={false}
          animate={{
            top: floated ? 0 : '50%',
            scale: floated ? 0.76 : 1,
            paddingLeft: floated ? 4 : 0,
            paddingRight: floated ? 4 : 0,
            backgroundColor: floated ? '#ffffff' : 'rgba(255,255,255,0)',
            color: error ? '#dc2626' : focused ? '#c8102e' : '#8a8f98',
          }}
          transition={springs.snappy}
          style={{ left: labelLeft }}
          className="pointer-events-none absolute -translate-y-1/2 origin-left whitespace-nowrap text-sm"
        >
          {label}{required && <span className="text-brand-red"> *</span>}
        </motion.label>
      </div>

      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </motion.p>
      )}
    </div>
  );
}