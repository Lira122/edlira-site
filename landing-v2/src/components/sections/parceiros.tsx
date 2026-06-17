import * as React from 'react';
import { Marquee } from '@/components/ui/marquee';

const logos = [
  { src: '/logos/adriane.png', alt: 'Adriane', invert: false },
  { src: '/logos/dr-vitor-campos.png', alt: 'Dr. Vitor Campos', invert: false },
  { src: '/logos/guilherme.png', alt: 'Guilherme', invert: false },
  { src: '/logos/desjoyaux.png', alt: 'Desjoyaux Piscinas', invert: false },
  { src: '/logos/spetialist.jpg', alt: 'Spetialist', invert: false },
  { src: '/logos/aderis-festin.jpeg', alt: 'Aderis Le Festin', invert: false },
  { src: '/logos/amo-make.jpeg', alt: 'Amo Make', invert: false },
];

const LogoCard: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div className="group mx-3 flex h-20 w-44 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-eleva/30 hover:bg-white/[0.06] hover:shadow-[0_8px_28px_-8px_rgba(200,245,66,0.25)]">
    <img
      src={src}
      alt={alt}
      loading="eager"
      decoding="async"
      width="120"
      height="48"
      className="max-h-12 w-auto object-contain opacity-80 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
      style={{ mixBlendMode: 'screen' }}
    />
  </div>
);

export const Parceiros: React.FC = () => {
  return (
    <section
      aria-label="Parceiros"
      className="relative w-full overflow-hidden bg-background py-16 sm:py-20"
    >
      {/* Top divider */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto mb-10 max-w-5xl px-6 text-center">
        <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.28em] text-foreground/45">
          Quem já escala com a Eleva
        </p>
      </div>

      <Marquee speed={28} fade pauseOnHover>
        {logos.map((logo, i) => (
          <LogoCard key={`${logo.alt}-${i}`} src={logo.src} alt={logo.alt} />
        ))}
      </Marquee>

      {/* Bottom divider */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
};
