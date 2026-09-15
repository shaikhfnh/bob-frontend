import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { springs } from '../styles/motion';
import Desktopfirstslide from '../assets/images/HeroSlider/desktop1.png';
import Desktopsecondslide from '../assets/images/HeroSlider/desktop2.png';
import Desktopthirdslide from '../assets/images/HeroSlider/desktop3.png';
import Desktopfourthslide from '../assets/images/HeroSlider/desktop4.png';
import Mobilefirstslide from '../assets/images/HeroSlider/mobile1.png';
import Mobilesecondslide from '../assets/images/HeroSlider/mobile2.png';
import Mobilethirdslide from '../assets/images/HeroSlider/mobile3.png';
import Mobilefourthslide from '../assets/images/HeroSlider/mobile4.png';

const SLIDES = [
  { id: 1, desktopImage: Desktopfirstslide, mobileImage: Mobilefirstslide },
  { id: 2, desktopImage: Desktopsecondslide, mobileImage: Mobilesecondslide },
  { id: 3, desktopImage: Desktopthirdslide, mobileImage: Mobilethirdslide },
  { id: 4, desktopImage: Desktopfourthslide, mobileImage: Mobilefourthslide },
];

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 400;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const dragX = useMotionValue(0);
  const timerRef = useRef(null);
  const sectionRef = useRef(null);

  // Performance fix: stop autoplaying (and the decode/paint work that comes
  // with each slide change) once this section scrolls out of view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function goTo(newIndex, dir) {
    setDirection(dir);
    setIndex((newIndex + SLIDES.length) % SLIDES.length);
    resetAutoplay();
  }
  function next() { goTo(index + 1, 1); }
  function prev() { goTo(index - 1, -1); }

  function resetAutoplay() {
    clearInterval(timerRef.current);
    if (!paused && inView) {
      timerRef.current = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    }
  }

  useEffect(() => {
    resetAutoplay();
    return () => clearInterval(timerRef.current);
  }, [paused, inView]);

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
      ref={sectionRef}
      className="group relative w-full overflow-hidden bg-neutral-900 aspect-[4/5] md:aspect-[21/9]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
                className="h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
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