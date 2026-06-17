import * as React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const FOUNDER_NAME = 'Edmilson Lira';
const FOUNDER_ROLE = 'Fundador da Eleva Digital';
const FOUNDER_PHOTO = '/founder/lira.jpeg';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const photoReveal = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export const Fundador: React.FC = () => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <section
      id="fundador"
      className="relative isolate w-full overflow-hidden bg-background pt-12 pb-20 sm:pt-16 sm:pb-24 md:pt-20 md:pb-28"
    >
      {/* Aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[55vh] w-[75vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[110px]"
        style={{
          background:
            'radial-gradient(circle at 30% 50%, rgba(200,245,66,0.05) 0%, rgba(200,245,66,0.015) 40%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Eyebrow chip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex justify-center sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/70 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-eleva shadow-[0_0_8px_rgba(200,245,66,0.8)]" />
            Carta do fundador
          </div>
        </motion.div>

        {/* Grid: photo + content */}
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16 lg:gap-20">
          {/* Photo column */}
          <motion.div
            variants={photoReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-xs md:mx-0 md:max-w-none"
          >
            {/* Soft glow behind photo */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] blur-2xl"
              style={{
                background:
                  'radial-gradient(60% 60% at 30% 30%, rgba(200,245,66,0.18), transparent 70%)',
              }}
            />

            <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-[#0C0D0A] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
              {/* Aspect ratio frame */}
              <div className="relative aspect-[4/5] w-full">
                {imgError ? (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-eleva/20 to-[#0C0D0A] text-7xl font-bold text-eleva font-display">
                    {FOUNDER_NAME.charAt(0)}
                  </div>
                ) : (
                  <img
                    src={FOUNDER_PHOTO}
                    alt={`${FOUNDER_NAME}, ${FOUNDER_ROLE}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                    onError={() => setImgError(true)}
                  />
                )}

                {/* Edge fade overlay */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent 55%, rgba(10,11,7,0.5) 100%)',
                  }}
                />

                {/* Tag floating on photo */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#0A0B07]/85 px-4 py-3 backdrop-blur-md"
                >
                  <div className="min-w-0">
                    <div className="font-display text-sm font-semibold tracking-tight text-foreground">
                      {FOUNDER_NAME}
                    </div>
                    <div className="truncate text-[10px] uppercase tracking-[0.16em] text-eleva">
                      {FOUNDER_ROLE}
                    </div>
                  </div>
                  <div className="h-2 w-2 shrink-0 rounded-full bg-eleva shadow-[0_0_10px_rgba(200,245,66,0.9)]" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Content column */}
          <div className="relative">
            {/* Decorative quote */}
            <Quote
              className="pointer-events-none absolute -left-2 -top-6 h-16 w-16 text-eleva opacity-[0.12] md:-left-6 md:h-20 md:w-20"
              strokeWidth={1.4}
              aria-hidden
            />

            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative font-display text-balance text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.15] tracking-tight text-foreground"
            >
              Eu não sou só mais um <span className="text-eleva">fornecedor</span>.
            </motion.h2>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
              className="mt-7 space-y-5 text-base leading-relaxed text-foreground/75 sm:text-[1.05rem]"
            >
              <p>
                Criei a Eleva porque cansei de ver sempre o mesmo filme. O
                mercado tá lotado de gente que vende tráfego, aperta um botão,
                dispara um relatório automático e some. O cliente vira só mais
                um número numa planilha. Eu nunca acreditei nesse jeito de
                trabalhar.
              </p>
              <p>
                Pra mim, marketing bom é parceria de verdade. Não é você me
                pagar, eu entregar a tarefa e tchau. É a gente crescer junto.
                Por isso eu entro no seu negócio pra valer. Escuto, dou ideia,
                ajusto o que não tá indo e tô sempre olhando o que dá pra
                melhorar e trazer mais retorno pra você. Não tenho aquele
                horário fechado de agência. Teve uma ideia ou uma dúvida, pode
                me chamar.
              </p>
              <p>
                Quando você fecha com a Eleva, eu e meu time tratamos o seu
                negócio como se fosse o nosso. No fim das contas, o seu
                resultado é o que prova o nosso trabalho.
              </p>
            </motion.div>

            {/* Lema */}
            <motion.blockquote
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              className="relative mt-10 rounded-2xl border border-eleva/25 bg-eleva/[0.04] p-6 sm:p-7"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-60"
                style={{
                  background:
                    'radial-gradient(70% 100% at 0% 0%, rgba(200,245,66,0.08), transparent 70%)',
                }}
              />
              <p className="relative font-display text-lg sm:text-xl font-semibold leading-snug tracking-tight text-foreground">
                Aqui você não contrata um fornecedor.{' '}
                <span
                  className="text-eleva"
                  style={{ textShadow: '0 0 18px rgba(200,245,66,0.35)' }}
                >
                  Ganha um parceiro no crescimento.
                </span>
              </p>
            </motion.blockquote>

            {/* Signature */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
              className="mt-8 flex items-center gap-3"
            >
              <span className="h-px w-10 bg-eleva/50" aria-hidden />
              <div>
                <div className="font-display text-base font-semibold tracking-tight text-foreground">
                  {FOUNDER_NAME}
                </div>
                <div className="text-xs text-foreground/55">{FOUNDER_ROLE}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
