import * as React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface FloatingIcon {
  id: number;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  className: string;
  size?: number;
}

export interface FloatingIconsHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  icons: FloatingIcon[];
  trustItems?: React.ReactNode[];
}

type MouseRef = React.MutableRefObject<{ x: number; y: number }>;

// Pseudo-random but stable per index — gives each icon its own rhythm
const rng = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const Icon = ({
  mouse,
  data,
  index,
}: {
  mouse: MouseRef;
  data: FloatingIcon;
  index: number;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  // Mouse repulsion offsets
  const repelX = useMotionValue(0);
  const repelY = useMotionValue(0);
  const springRX = useSpring(repelX, { stiffness: 220, damping: 18 });
  const springRY = useSpring(repelY, { stiffness: 220, damping: 18 });

  // Per-icon float parameters (stable across renders)
  const amp = 24 + rng(index + 1) * 22; // 24 - 46 px vertical
  const dur = 3.5 + rng(index + 7) * 3; // 3.5 - 6.5 s
  const delay = rng(index + 13) * 2; // 0 - 2 s offset
  const drift = (rng(index + 23) - 0.5) * 28; // -14 - +14 px horizontal sway
  const rot = (rng(index + 31) - 0.5) * 10; // -5 - +5 deg tilt

  React.useEffect(() => {
    let rafId = 0;
    const tick = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouse.current.x - cx;
        const dy = mouse.current.y - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = 180;

        if (distance < radius && distance > 0) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - distance / radius) * 55;
          repelX.set(-Math.cos(angle) * force);
          repelY.set(-Math.sin(angle) * force);
        } else {
          repelX.set(0);
          repelY.set(0);
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [mouse, repelX, repelY]);

  const Comp = data.icon;

  return (
    <motion.div
      ref={ref}
      style={{ x: springRX, y: springRY }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.04, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn('absolute z-0', data.className)}
    >
      {/* Idle float wrapper — bobs continuously */}
      <motion.div
        animate={{
          y: [0, -amp, 0, amp * 0.6, 0],
          x: [0, drift, drift * 0.5, -drift * 0.5, 0],
          rotate: [0, rot, 0, -rot * 0.6, 0],
        }}
        transition={{
          duration: dur,
          delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={cn(
          'group grid place-items-center cursor-pointer',
          'h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16',
          'rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[#0F0F10]/80 backdrop-blur-sm',
          'shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.04)]',
          'transition-all duration-300',
          'hover:scale-110 hover:border-eleva/40 hover:shadow-[0_12px_36px_-8px_rgba(200,245,66,0.25)] hover:-translate-y-1'
        )}
      >
        <Comp className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 transition-transform duration-300 group-hover:scale-110" />
      </motion.div>
    </motion.div>
  );
};

export const FloatingIconsHero: React.FC<FloatingIconsHeroProps> = ({
  eyebrow,
  title,
  subtitle,
  ctaText,
  ctaHref,
  ctaSecondaryText,
  ctaSecondaryHref,
  icons,
  trustItems,
}) => {
  const mouse = React.useRef({ x: -9999, y: -9999 });

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const onLeave = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section className="relative isolate min-h-[92vh] w-full overflow-hidden bg-background">
      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(70% 55% at 50% 50%, rgba(255,255,255,0.025), transparent 75%)',
        }}
      />

      {/* Floating icons layer — dimmed on mobile so text stays readable */}
      <div className="absolute inset-0 opacity-30 sm:opacity-100" aria-hidden>
        <div className="relative h-full w-full">
          {icons.map((data, i) => (
            <Icon key={data.id} mouse={mouse} data={data} index={i} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 pointer-events-none mx-auto flex min-h-[92vh] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        {eyebrow ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/70 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-eleva shadow-[0_0_8px_rgba(200,245,66,0.8)]" />
            {eyebrow}
          </motion.div>
        ) : null}

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="font-display text-balance text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tightest text-foreground"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          className="mt-8 max-w-2xl text-balance text-base sm:text-lg leading-relaxed text-foreground/80"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-3 pointer-events-auto"
        >
          <a href={ctaHref} target={ctaHref.startsWith('http') ? '_blank' : undefined} rel="noopener">
            <Button size="lg" variant="primary">
              {ctaText}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          {ctaSecondaryText && ctaSecondaryHref ? (
            <a href={ctaSecondaryHref}>
              <Button size="lg" variant="ghost">
                {ctaSecondaryText}
              </Button>
            </a>
          ) : null}
        </motion.div>

        {trustItems && trustItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-foreground/55"
          >
            {trustItems.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-foreground/25" aria-hidden />
                )}
                <span className="inline-flex items-center gap-1.5">{item}</span>
              </React.Fragment>
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
};
