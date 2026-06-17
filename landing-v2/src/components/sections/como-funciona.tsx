import * as React from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Search, Cpu, LineChart } from 'lucide-react';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { useSpotlight } from '@/lib/use-spotlight';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  {
    number: '01',
    title: 'Diagnóstico gratuito',
    description:
      'A gente mergulha no seu negócio, entende seu cliente e te mostra exatamente onde tá vazando venda. Você sai da primeira conversa já com um caminho claro, sem custo e sem compromisso.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Estratégia + execução sob medida',
    description:
      'Montamos sua máquina de vendas: tráfego pago, criativos que convertem, automações e atendimento com IA rodando 24/7. Tudo construído pro seu negócio. Nada de pacote genérico.',
    icon: Cpu,
  },
  {
    number: '03',
    title: 'Acompanhamento e escala',
    description:
      'Reuniões de alinhamento, relatórios transparentes e otimização toda semana. Você acompanha cada resultado e a gente ajusta junto. Nada de sumir depois de fechar.',
    icon: LineChart,
  },
];

const CTA_HREF = '#diagnostico';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const cardReveal = {
  hidden: { opacity: 0, y: 80, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const StepCard: React.FC<{
  step: (typeof steps)[number];
  index: number;
}> = ({ step, index }) => {
  const { handleMouseMove, handleMouseLeave, background } = useSpotlight({
    radius: 520,
    color: 'rgba(200,245,66,0.1)',
  });
  const IconComp = step.icon;

  return (
    <motion.article
      variants={cardReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: index * 0.18 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C0D0A]/80 p-8 sm:p-10 backdrop-blur-sm transition-colors duration-500 hover:border-eleva/30 hover:bg-[#0C0D0A]"
    >
      {/* Spotlight following cursor */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background }}
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
        <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-3">
          <div
            className="font-display text-5xl sm:text-6xl font-black leading-none tracking-tightest text-eleva transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3"
            style={{
              textShadow: '0 0 28px rgba(200,245,66,0.35)',
              transformOrigin: 'left center',
            }}
          >
            {step.number}
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-foreground/80 transition-colors duration-500 group-hover:border-eleva/40 group-hover:text-eleva">
            <IconComp className="h-5 w-5" strokeWidth={1.6} />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors duration-500 group-hover:text-eleva-glow">
            {step.title}
          </h3>
          <p className="mt-3 text-base sm:text-lg leading-relaxed text-foreground/70">
            {step.description}
          </p>
        </div>
      </div>
    </motion.article>
  );
};

export const ComoFunciona: React.FC = () => {
  const sectionRef = React.useRef<HTMLElement>(null);
  const giantTextRef = React.useRef<HTMLDivElement>(null);

  // GSAP timeline for the giant "MÉTODO" — IN as section enters, OUT as it leaves
  React.useEffect(() => {
    if (typeof window === 'undefined' || !giantTextRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
      tl.fromTo(
        giantTextRef.current,
        { y: '10vh', scale: 0.85, opacity: 0 },
        { y: '0vh', scale: 1, opacity: 1, ease: 'none' }
      ).to(
        giantTextRef.current,
        { y: '-10vh', scale: 1.08, opacity: 0, ease: 'none' }
      );
    }, sectionRef);

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="relative isolate w-full overflow-hidden bg-background pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24"
    >
      {/* Aurora glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[100px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(200,245,66,0.06) 0%, rgba(200,245,66,0.02) 40%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* Giant background text "MÉTODO" */}
      <div
        ref={giantTextRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none text-center font-display font-black leading-[0.8] tracking-tightest"
        style={{
          fontSize: '24vw',
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,255,255,0.04)',
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 70%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
        }}
      >
        MÉTODO
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Heading */}
        <div className="mb-20 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/70 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-eleva shadow-[0_0_8px_rgba(200,245,66,0.8)]" />
            Como funciona
          </motion.div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="font-display text-balance text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.05] tracking-tightest text-foreground"
          >
            Como a Eleva entrega <span className="text-eleva">de verdade</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-balance text-base sm:text-lg leading-relaxed text-foreground/70"
          >
            Sem fórmula mágica, sem pacote engessado. Três passos pra sair do
            achismo e construir uma máquina de vendas que funciona.
          </motion.p>
        </div>

        {/* Steps stack */}
        <div className="space-y-6 sm:space-y-8">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* CTA final */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 flex flex-col items-center gap-3 text-center"
        >
          <p className="text-sm text-foreground/55">
            Convencido? A próxima conversa é por nossa conta.
          </p>
          <MagneticButton
            as="a"
            href={CTA_HREF}
            strength={0.35}
            className="inline-flex h-14 items-center gap-2 rounded-lg bg-eleva px-8 text-base font-semibold tracking-tight text-primary-foreground shadow-[0_0_0_1px_rgba(200,245,66,0.4),0_8px_32px_-8px_rgba(200,245,66,0.5)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(200,245,66,0.6),0_12px_40px_-8px_rgba(200,245,66,0.7)]"
          >
            Quero meu diagnóstico gratuito
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
};
