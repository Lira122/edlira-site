import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CardStack, type CardStackItem } from '@/components/ui/card-stack';
import { MagneticButton } from '@/components/ui/magnetic-button';

type Service = CardStackItem & {
  tag: string;
};

const services: Service[] = [
  {
    id: 1,
    tag: 'Tráfego pago',
    title: 'Cliente certo, todo dia',
    description: 'Chega de queimar grana com anúncio que não vende.',
    imageSrc: '/services/trafego.png',
  },
  {
    id: 2,
    tag: 'IA + automação',
    title: 'Venda até dormindo',
    description: 'IA que atende, qualifica e fecha 24h por dia.',
    imageSrc: '/services/ia.png',
  },
  {
    id: 3,
    tag: 'Site que converte',
    title: 'Site que vira máquina de venda',
    description: 'Bonito não paga conta. O seu vai converter.',
    imageSrc: '/services/sites.png',
  },
  {
    id: 4,
    tag: 'Criativos',
    title: 'Pare o dedo do cliente',
    description: 'Criativos que prendem o olho e forçam o clique.',
    imageSrc: '/services/criativos.png',
  },
  {
    id: 5,
    tag: 'Edição de vídeo',
    title: 'Vídeo nível agência grande',
    description: 'Reels e VSL que prendem do primeiro segundo.',
    imageSrc: '/services/edicao-video.png',
  },
  {
    id: 6,
    tag: 'Tracking avançado',
    title: 'Pare de apostar no escuro',
    description: 'Rastreio que revela o que dá dinheiro e o que queima.',
    imageSrc: '/services/trackeamento.png',
  },
  {
    id: 7,
    tag: 'Crescimento',
    title: 'Resultado no caixa, não na promessa',
    description: 'Crescimento que você mede em dinheiro.',
    imageSrc: '/services/resultado.png',
  },
];

const CTA_HREF = '#diagnostico';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const renderServiceCard = (item: CardStackItem, state: { active: boolean }) => {
  const s = item as Service;
  return (
    <div className="relative h-full w-full bg-[#0A0B07]">
      {s.imageSrc ? (
        <img
          src={s.imageSrc}
          alt={s.title}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
          loading="eager"
        />
      ) : null}

      {/* dark gradient pra texto legível */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
      {/* leve tinte Eleva no canto inferior esquerdo no card ativo */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          state.active ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(60% 80% at 0% 100%, rgba(200,245,66,0.18), transparent 60%)',
        }}
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6">
        <span className="inline-block rounded-full border border-eleva/40 bg-eleva/10 px-2.5 py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-eleva backdrop-blur-sm">
          {s.tag}
        </span>
        <h3 className="mt-3 font-display text-lg sm:text-xl md:text-2xl font-bold tracking-tight leading-[1.15] text-white">
          {s.title}
        </h3>
        {s.description ? (
          <p className="mt-1.5 text-xs sm:text-sm text-white/75 leading-snug">
            {s.description}
          </p>
        ) : null}
      </div>
    </div>
  );
};

function useCardSize() {
  const [size, setSize] = React.useState({ width: 440, height: 300 });

  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setSize({ width: 300, height: 220 });
      else if (w < 640) setSize({ width: 340, height: 240 });
      else if (w < 1024) setSize({ width: 400, height: 280 });
      else setSize({ width: 460, height: 320 });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}

export const Ofertas: React.FC = () => {
  const cardSize = useCardSize();

  return (
    <section
      id="servicos"
      className="relative isolate w-full overflow-hidden bg-background pt-12 pb-24 sm:pt-16 sm:pb-28 md:pt-20 md:pb-32"
    >
      {/* Aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[100px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(200,245,66,0.05) 0%, rgba(200,245,66,0.015) 40%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mb-8 text-center sm:mb-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/70 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-eleva shadow-[0_0_8px_rgba(200,245,66,0.8)]" />
            O que a Eleva entrega
          </motion.div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="font-display text-balance text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.05] tracking-tightest text-foreground"
          >
            Tudo o que sua empresa precisa <span className="text-eleva">num só lugar</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-balance text-base sm:text-lg leading-relaxed text-foreground/75"
          >
            Você não precisa juntar quatro fornecedores que nem se falam.
            Aqui é tudo integrado, no mesmo time, com a mesma cara.
          </motion.p>
        </div>

        {/* Card stack */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <CardStack<Service>
            items={services}
            initialIndex={0}
            cardWidth={cardSize.width}
            cardHeight={cardSize.height}
            overlap={0.42}
            spreadDeg={36}
            activeLiftPx={18}
            activeScale={1.03}
            inactiveScale={0.88}
            autoAdvance
            intervalMs={3800}
            pauseOnHover
            showDots
            renderCard={renderServiceCard}
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 flex flex-col items-center gap-3 text-center sm:mt-20"
        >
          <p className="text-sm text-foreground/55">
            Quer descobrir qual combinação funciona pro seu negócio?
          </p>
          <MagneticButton
            as="a"
            href={CTA_HREF}
            strength={0.35}
            className="inline-flex h-14 items-center gap-2 rounded-lg bg-eleva px-8 text-base font-semibold tracking-tight text-primary-foreground shadow-[0_0_0_1px_rgba(200,245,66,0.4),0_8px_32px_-8px_rgba(200,245,66,0.5)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(200,245,66,0.6),0_12px_40px_-8px_rgba(200,245,66,0.7)]"
          >
            Montar meu pacote ideal
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
};
