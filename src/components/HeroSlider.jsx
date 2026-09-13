import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { springs } from '../styles/motion';

const SLIDES = [
 
  {
    id: 2,
    desktopImage: 'https://www.mamababyexpo.com/wp-content/uploads/2026/09/Artboard-1.png',
    mobileImage: 'https://www.mamababyexpo.com/wp-content/uploads/2026/09/Artboard-2.png',
  },
  {
    id: 3,
    desktopImage: 'https://www.mamababyexpo.com/wp-content/uploads/2026/09/Artboard-3.png',
    mobileImage: 'https://www.mamababyexpo.com/wp-content/uploads/2026/09/Artboard-2-copy-2.png',
  },
];

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 400;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const dragX = useMotionValue(0);
  const timerRef = useRef(null);

  function goTo(newIndex, dir) {
    setDirection(dir);
    setIndex((newIndex + SLIDES.length) % SLIDES.length);
    resetAutoplay();
  }
  function next() { goTo(index + 1, 1); }
  function prev() { goTo(index - 1, -1); }

  function resetAutoplay() {
    clearInterval(timerRef.current);
    if (!paused) {
      timerRef.current = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    }
  }
  useState(() => { resetAutoplay(); return () => clearInterval(timerRef.current); });

  function handleDragEnd(e, info) {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) next();
    else if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) prev();
    dragX.set(0);
  }

  const slide = SLIDES[index];
  const imageX = useTransform(dragX, (v) => v * 0.4);

  return (
    <div
      className="group relative w-full overflow-hidden bg-neutral-900 aspect-[4/5] md:aspect-[21/9]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); resetAutoplay(); }}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={slide.id}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? '15%' : '-15%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? '-15%' : '15%' }}
          transition={springs.default}
          drag="x"
          dragElastic={0}
          dragConstraints={{ left: 0, right: 0 }}
          onDrag={(e, info) => dragX.set(info.offset.x)}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <motion.div style={{ x: imageX }} className="absolute inset-0 bg-neutral-800">
            <picture>
              <source media="(min-width: 768px)" srcSet={slide.desktopImage} />
              <img
              draggable={false}
                src={slide.mobileImage}
                alt=""
                // object-contain = the WHOLE image always shows, both
                // dimensions, no cropping at all. If the shape doesn't
                // perfectly match the container, the gap shows the
                // background color instead of cutting anything off.
                className="h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </picture>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 hover:bg-white/30 md:block"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 hover:bg-white/30 md:block"
        aria-label="Next slide"
      >
        →
      </button>
    </div>
  );
}