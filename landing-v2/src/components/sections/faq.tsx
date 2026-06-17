import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpotlight } from '@/lib/use-spotlight';
import { MagneticButton } from '@/components/ui/magnetic-button';

type FAQ = {
  q: string;
  a: React.ReactNode;
};

const faqs: FAQ[] = [
  {
    q: 'O que vocês fazem, na prática?',
    a: (
      <>
        De tudo que faz o seu negócio vender mais online, e tudo conversando
        entre si. Na prática a gente cuida de tráfego pago no Meta e no Google
        pra trazer cliente, sites, landing pages e lojas virtuais feitos pra
        converter, automação e agentes de IA que atendem, qualificam e
        organizam seus leads no WhatsApp e no Instagram 24 horas por dia,
        edição de vídeo pra Reels, anúncio e VSL, criativos que prendem o olho,
        e trackeamento avançado de dados pra você enxergar cada real investido
        e saber o que de fato dá resultado.
        <br />
        <br />
        Você não precisa juntar cinco fornecedores que não se falam. Aqui é
        tudo num lugar só.
      </>
    ),
  },
  {
    q: 'Quanto custa?',
    a: (
      <>
        Vai depender do que o seu negócio precisa. A gente não trabalha com
        pacote pronto de prateleira. No diagnóstico gratuito a gente entende o
        seu momento e monta uma proposta sob medida, já com o valor na mesa,
        sem pegadinha. Você só decide depois de saber certinho o que vai
        receber.
      </>
    ),
  },
  {
    q: 'Em quanto tempo vejo resultado?',
    a: (
      <>
        Com tráfego pago, os primeiros movimentos costumam aparecer já nas
        primeiras semanas. Mas marketing de verdade é construção. O resultado
        que se sustenta vem da otimização mês a mês, e a gente fala isso
        aberto desde o começo. Aqui ninguém promete te deixar rico em 7 dias.
      </>
    ),
  },
  {
    q: 'Serve pro meu tipo de negócio?',
    a: (
      <>
        Se você vende pra pessoas, serve. Já escalamos negócio local de
        turismo, consultório, advocacia, e também e-commerce de nichos bem
        diferentes. O que muda é a estratégia, que a gente pensa pro seu
        mercado. Nada de copiar fórmula que deu certo pros outros.
      </>
    ),
  },
  {
    q: 'O que eu preciso ter pra começar?',
    a: (
      <>
        Um negócio funcionando e vontade de crescer. O resto a gente monta:
        anúncio, site, automação, IA, relatório. Se você já tem alguma coisa
        rodando, a gente aproveita e melhora. Se tá começando do zero,
        constrói junto com você.
      </>
    ),
  },
  {
    q: 'E se não der resultado?',
    a: (
      <>
        Marketing de verdade precisa de tempo pra mostrar resultado, então a
        gente trabalha com um período de mais ou menos 3 meses pra fazer a
        coisa acontecer direito. Não é mágica de uma semana. E durante todo
        esse tempo você acompanha tudo de perto, com relatório transparente e
        reunião de alinhamento. Nada de caixa preta.
        <br />
        <br />
        A gente só cresce quando você cresce, então o nosso interesse aqui é
        exatamente o mesmo que o seu.
      </>
    ),
  },
];

const CTA_HREF = '#diagnostico';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const FaqItem: React.FC<{
  faq: FAQ;
  open: boolean;
  onToggle: () => void;
  index: number;
}> = ({ faq, open, onToggle, index }) => {
  const { handleMouseMove, handleMouseLeave, background } = useSpotlight({
    radius: 380,
    color: 'rgba(200,245,66,0.08)',
  });

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-colors duration-500',
        open
          ? 'border-eleva/40 bg-[#0C0D0A]'
          : 'border-white/[0.08] bg-[#0C0D0A]/70 hover:border-white/20 hover:bg-[#0C0D0A]/90'
      )}
    >
      {/* Spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background }}
        aria-hidden
      />

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="relative z-10 flex w-full items-center justify-between gap-6 px-6 py-5 text-left sm:px-8 sm:py-6"
      >
        <span
          className={cn(
            'font-display text-base sm:text-lg md:text-xl font-semibold tracking-tight transition-colors duration-300',
            open ? 'text-eleva' : 'text-foreground group-hover:text-foreground'
          )}
        >
          {faq.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-300',
            open
              ? 'border-eleva/60 bg-eleva/15 text-eleva'
              : 'border-white/15 bg-white/[0.03] text-foreground/70 group-hover:border-white/30'
          )}
          aria-hidden
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.3, ease: 'easeOut', delay: open ? 0.08 : 0 },
            }}
            className="relative z-10 overflow-hidden"
          >
            <div className="px-6 pb-6 sm:px-8 sm:pb-7">
              <div className="border-t border-white/[0.06] pt-5 text-sm sm:text-base leading-relaxed text-foreground/75">
                {faq.a}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative isolate w-full overflow-hidden bg-background pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20"
    >
      {/* Aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[100px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(200,245,66,0.04) 0%, rgba(200,245,66,0.01) 40%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        {/* Heading */}
        <div className="mb-12 text-center sm:mb-16">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/70 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-eleva shadow-[0_0_8px_rgba(200,245,66,0.8)]" />
            Perguntas frequentes
          </motion.div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="font-display text-balance text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-tightest text-foreground"
          >
            As dúvidas que <span className="text-eleva">todo mundo tem</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-balance text-base sm:text-lg leading-relaxed text-foreground/75"
          >
            Antes de você perder tempo na reunião, aqui o que mais ouvimos.
          </motion.p>
        </div>

        {/* Accordion */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, i) => (
            <FaqItem
              key={i}
              faq={faq}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              index={i}
            />
          ))}
        </div>

        {/* Closing CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center gap-3 text-center sm:mt-12"
        >
          <p className="text-sm text-foreground/60">
            Ficou com alguma pergunta que não tá aqui?
            <br className="hidden sm:inline" />
            <span className="text-foreground/80">
              {' '}A primeira conversa é gratuita e por nossa conta.
            </span>
          </p>
          <MagneticButton
            as="a"
            href={CTA_HREF}
            strength={0.35}
            className="mt-2 inline-flex h-14 items-center gap-2 rounded-lg bg-eleva px-8 text-base font-semibold tracking-tight text-primary-foreground shadow-[0_0_0_1px_rgba(200,245,66,0.4),0_8px_32px_-8px_rgba(200,245,66,0.5)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(200,245,66,0.6),0_12px_40px_-8px_rgba(200,245,66,0.7)]"
          >
            Quero meu diagnóstico
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
};
