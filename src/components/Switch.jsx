import { motion } from 'motion/react';
import { springs } from '../styles/motion';

export default function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        all: 'unset',                 // strip whatever global reset was hiding the track
        boxSizing: 'border-box',
        cursor: 'pointer',
        position: 'relative',
        display: 'inline-block',
        flexShrink: 0,
        width: '46px',
        height: '27px',
        borderRadius: '999px',
        backgroundColor: checked ? '#34c759' : '#e5e5ea',  // real iOS toggle colors
        transition: 'background-color 0.2s ease',
      }}
    >
      <motion.span
        layout
        transition={springs.snappy}
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '21px' : '2px',
          width: '23px',
          height: '23px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 3px 8px rgba(0,0,0,0.25), 0 1px 1px rgba(0,0,0,0.15)',
        }}
        whileTap={{ scale: 0.88 }}
      />
    </button>
  );
}