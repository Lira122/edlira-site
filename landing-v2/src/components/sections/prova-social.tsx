import * as React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ArrowRight } from 'lucide-react';
import { useSpotlight } from '@/lib/use-spotlight';
import { MagneticButton } from '@/components/ui/magnetic-button';

const CTA_HREF = '#diagnostico';

type Testimonial = {
  id: string;
  name: string;
  role: string;
  photo: string;
  quote: string;
  initials: string;
  highlight: string;
};

const testimonials: Testimonial[] = [
  {
    id: 'adriane',
    name: 'Adriane',
    role: 'Excursões e Viagens',
    photo: '/people/adriane.png',
    initials: 'A',
    quote:
      'Já tinha tentado marketing antes e não deu em nada, mas com a Eleva Digital foi diferente. Montaram o tráfego pago no Google e o movimento subiu de verdade, começou a chegar bem mais gente. E a inteligência artificial filtra os curiosos, responde na hora e separa quem só quer saber preço de quem realmente quer fechar. Sobrou tempo pra mim e o resultado apareceu no caixa. Recomendo demais.',
    highlight: 'o resultado apareceu no caixa',
  },
  {
    id: 'guilherme',
    name: 'Dr. Guilherme Mesquita',
    role: 'Advogado · São Bernardo do Campo, SP',
    photo: '/people/guilherme.jpg',
    initials: 'GM',
    quote:
      'Eu era desconfiado com marketing pra advocacia, achava que cliente bom só vinha por indicação. A Eleva Digital me provou o contrário. Criaram meu site, o guilhermemesquita.adv.br, com a cara séria que a profissão pede, e colocaram o tráfego pago no Google rodando. A IA vai filtrando os curiosos e me entrega quem tem caso de verdade, e o CRM organiza tudo, não escapa mais nenhum cliente. Valeu cada centavo.',
    highlight: 'não escapa mais nenhum cliente',
  },
  {
    id: 'vitor',
    name: 'Dr. Vitor Campos',
    role: 'Cirurgião-dentista',
    photo: '/people/dr-vitor-campos.jpeg',
    initials: 'VC',
    quote:
      'Olha, eu nunca fui muito de entender essas coisas de internet, sempre deixei pra lá. Aí resolvi confiar e foi a melhor decisão. O CRM que montaram junto com os anúncios online virou uma verdadeira máquina aqui no consultório. Antes minha agenda tinha buraco, dia que ficava parado. Hoje chega paciente novo direto, e o sistema já vai organizando tudo, lembra de retorno, não deixa ninguém esquecido. O pessoal que entra em contato curioso a própria ferramenta vai filtrando, então quando chega em mim já é gente querendo marcar mesmo. Minha cadeira não fica mais vazia. Recomendo de olhos fechados.',
    highlight: 'Minha cadeira não fica mais vazia',
  },
];

const metrics: { value: React.ReactNode; label: string; sub: string }[] = [
  {
    value: '24/7',
    label: 'IA atendendo',
    sub: 'enquanto você dorme',
  },
  {
    value: (
      <>
        &lt;<span className="ml-1">1min</span>
      </>
    ),
    label: 'Primeira resposta',
    sub: 'no WhatsApp e DM',
  },
  {
    value: '0',
    label: 'Pacote genérico',
    sub: 'tudo feito sob medida',
  },
];

const renderHighlightedQuote = (quote: string, highlight: string): React.ReactNode => {
  if (!highlight) return quote;
  const idx = quote.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return quote;
  const before = quote.slice(0, idx);
  const match = quote.slice(idx, idx + highlight.length);
  const after = quote.slice(idx + highlight.length);
  return (
    <>
      {before}
      <strong
        className="font-semibold text-eleva"
        style={{ textShadow: '0 0 14px rgba(200,245,66,0.25)' }}
      >
        {match}
      </strong>
      {after}
    </>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const cardReveal = {
  hidden: { opacity: 0, y: 80, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const TestimonialCard: React.FC<{ t: Testimonial; index: number }> = ({ t, index }) => {
  const [imgError, setImgError] = React.useState(false);
  const { handleMouseMove, handleMouseLeave, background } = useSpotlight({
    radius: 480,
    color: 'rgba(200,245,66,0.1)',
  });

  return (
    <motion.article
      variants={cardReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: index * 0.18 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C0D0A]/80 p-7 sm:p-9 backdrop-blur-sm transition-colors duration-500 hover:border-eleva/30 hover:bg-[#0C0D0A]"
    >
      <Quote
        className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-eleva opacity-[0.06] transition-all duration-700 ease-out group-hover:rotate-6 group-hover:scale-110 group-hover:opacity-[0.12] sm:-right-6 sm:-top-6 sm:h-40 sm:w-40"
        strokeWidth={1.4}
        aria-hidden
      />

      {/* Spotlight following cursor */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-0.5 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:scale-105" aria-label="5 estrelas">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-eleva text-eleva transition-transform duration-500"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(200,245,66,0.4))',
                transitionDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>

        <blockquote className="mt-6 flex-1 text-[0.98rem] sm:text-base leading-relaxed text-foreground/85">
          {renderHighlightedQuote(t.quote, t.highlight)}
        </blockquote>

        <div className="mt-8 flex items-center gap-4 border-t border-white/[0.06] pt-6">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-eleva/30 ring-offset-2 ring-offset-[#0C0D0A] transition-all duration-500 group-hover:ring-eleva/70 group-hover:ring-2">
            {imgError ? (
              <div className="grid h-full w-full place-items-center bg-eleva/20 text-sm font-bold text-eleva">
                {t.initials}
              </div>
            ) : (
              <img
                src={t.photo}
                alt={t.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                onError={() => setImgError(true)}
              />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-display text-base font-semibold tracking-tight text-foreground transition-colors duration-500 group-hover:text-eleva-glow">
              {t.name}
            </div>
            <div className="truncate text-xs text-foreground/55">{t.role}</div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export const ProvaSocial: React.FC = () => {
  return (
    <section
      id="prova-social"
      className="relative isolate w-full overflow-hidden bg-background pt-16 pb-8 sm:pt-20 sm:pb-10 md:pt-24 md:pb-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[100px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(200,245,66,0.04) 0%, rgba(200,245,66,0.01) 40%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center sm:mb-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/70 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-eleva shadow-[0_0_8px_rgba(200,245,66,0.8)]" />
            Prova social
          </motion.div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="font-display text-balance text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.05] tracking-tightest text-foreground"
          >
            Quem confiou, <span className="text-eleva">escalou</span>.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-balance text-base sm:text-lg leading-relaxed text-foreground/70"
          >
            Negócios reais. Resultados reais. Sem case fabricado pra encher
            slide.
          </motion.p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.id} t={t} index={i} />
          ))}
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 grid grid-cols-3 gap-3 rounded-2xl border border-white/[0.06] bg-[#0C0D0A]/60 p-6 backdrop-blur-sm sm:mt-20 sm:gap-6 sm:p-8"
        >
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="group flex cursor-default flex-col items-center justify-center text-center"
            >
              <div
                className="font-display text-3xl sm:text-4xl md:text-5xl font-black leading-none tracking-tightest text-eleva transition-all duration-500 group-hover:scale-110"
                style={{ textShadow: '0 0 24px rgba(200,245,66,0.25)' }}
              >
                {m.value}
              </div>
              <div className="mt-2 text-xs sm:text-sm font-semibold text-foreground/90 transition-colors duration-500 group-hover:text-eleva-glow">
                {m.label}
              </div>
              <div className="mt-1 text-[10px] sm:text-xs text-foreground/45 transition-colors duration-500 group-hover:text-foreground/70">
                {m.sub}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA final da prova social */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-col items-center gap-3 text-center sm:mt-14"
        >
          <p className="text-sm text-foreground/55">
            Quer ser o próximo case de sucesso da Eleva?
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
