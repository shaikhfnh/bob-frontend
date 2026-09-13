// Apple's "Designing Fluid Interfaces" translated to Motion's spring API.
// Every animated component in this app imports from here — never inline a
// random duration/easing value in a component file.

export const springs = {
  // Default for anything that isn't gesture-driven — menus, fades, layout shifts.
  // Critically damped: settles smoothly, no bounce. This is the 90% case.
  default: { type: 'spring', bounce: 0, duration: 0.4 },

  // Slightly snappier version of default, for small UI (toggles, chips).
  snappy: { type: 'spring', bounce: 0, duration: 0.3 },

  // ONLY for things that follow a flick/drag/throw — a gesture that carried
  // momentum. Never use this on something that just appeared on its own.
  momentum: { type: 'spring', bounce: 0.2, duration: 0.4 },

  // Drawers, sheets, bottom modals.
  sheet: { type: 'spring', bounce: 0.15, duration: 0.35 },
};

// Respond on press, not release — instant feedback per the skill's rule #1.
export const pressTap = { scale: 0.97 };