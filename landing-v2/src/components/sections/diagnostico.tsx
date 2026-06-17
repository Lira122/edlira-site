import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SB_URL = 'https://flzpblpegoqjxaacjvhf.supabase.co';
const WHATSAPP_FALLBACK = '(12) 98168-0894';

type FormData = {
  nome: string;
  empresa: string;
  whatsapp: string;
  email: string;
  servico: string;
  faturamento: string;
  mensagem: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

type Status = 'idle' | 'submitting' | 'success' | 'error';

const initialData: FormData = {
  nome: '',
  empresa: '',
  whatsapp: '',
  email: '',
  servico: '',
  faturamento: '',
  mensagem: '',
};

const SERVICOS = [
  'Tráfego pago (Google / Meta / TikTok)',
  'IA e Automação',
  'Site / Landing Page',
  'Edição de vídeo e criativos',
  'Pacote completo',
  'Ainda não sei, quero o diagnóstico',
];

const FATURAMENTOS = [
  'Até R$ 50 mil',
  'R$ 50 a 150 mil',
  'R$ 150 a 500 mil',
  'R$ 500 mil a 1 milhão',
  'Acima de R$ 1 milhão',
];

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validate(data: FormData): FormErrors {
  const e: FormErrors = {};
  if (data.nome.trim().length < 2) e.nome = 'Nome muito curto';
  if (data.empresa.trim().length < 2) e.empresa = 'Empresa muito curta';
  const phoneDigits = data.whatsapp.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 11) e.whatsapp = 'WhatsApp inválido';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'E-mail inválido';
  if (!data.servico) e.servico = 'Selecione uma opção';
  if (!data.faturamento) e.faturamento = 'Selecione uma opção';
  return e;
}

const FloatingField: React.FC<{
  name: keyof FormData;
  label: string;
  type?: string;
  value: string;
  error?: string;
  required?: boolean;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  maxLength?: number;
  onChange: (v: string) => void;
}> = ({ name, label, type = 'text', value, error, required, inputMode, autoComplete, maxLength, onChange }) => {
  const [focused, setFocused] = React.useState(false);
  const filled = value.length > 0;
  const float = focused || filled;
  const valid = filled && !error;

  return (
    <div className="relative">
      <div
        className={cn(
          'relative rounded-xl border bg-[#0B0C09] transition-all duration-300',
          error
            ? 'border-red-500/50'
            : focused
            ? 'border-eleva/60 shadow-[0_0_0_4px_rgba(200,245,66,0.12)]'
            : filled
            ? 'border-white/20'
            : 'border-white/[0.1] hover:border-white/20'
        )}
      >
        <label
          htmlFor={name}
          className={cn(
            'pointer-events-none absolute left-4 transition-all duration-200',
            float
              ? 'top-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]'
              : 'top-1/2 -translate-y-1/2 text-[14px]',
            error ? 'text-red-400' : focused ? 'text-eleva' : 'text-foreground/55'
          )}
        >
          {label}
          {required ? <span className={focused ? 'text-eleva' : 'text-eleva/70'}> *</span> : null}
        </label>

        <input
          id={name}
          name={name}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-4 pb-2.5 pt-6 text-[15px] text-foreground outline-none placeholder:text-foreground/30"
        />

        <AnimatePresence>
          {valid && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-eleva"
              aria-hidden
            >
              <Check className="h-4 w-4" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FloatingSelect: React.FC<{
  name: keyof FormData;
  label: string;
  options: string[];
  value: string;
  error?: string;
  required?: boolean;
  onChange: (v: string) => void;
}> = ({ name, label, options, value, error, required, onChange }) => {
  const [focused, setFocused] = React.useState(false);
  const filled = value.length > 0;
  const float = focused || filled;

  return (
    <div className="relative">
      <div
        className={cn(
          'relative rounded-xl border bg-[#0B0C09] transition-all duration-300',
          error
            ? 'border-red-500/50'
            : focused
            ? 'border-eleva/60 shadow-[0_0_0_4px_rgba(200,245,66,0.12)]'
            : filled
            ? 'border-white/20'
            : 'border-white/[0.1] hover:border-white/20'
        )}
      >
        <label
          htmlFor={name}
          className={cn(
            'pointer-events-none absolute left-4 transition-all duration-200',
            float
              ? 'top-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]'
              : 'top-1/2 -translate-y-1/2 text-[14px]',
            error ? 'text-red-400' : focused ? 'text-eleva' : 'text-foreground/55'
          )}
        >
          {label}
          {required ? <span className={focused ? 'text-eleva' : 'text-eleva/70'}> *</span> : null}
        </label>

        <select
          id={name}
          name={name}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent px-4 pb-2.5 pt-6 pr-10 text-[15px] text-foreground outline-none"
        >
          <option value="" disabled hidden></option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#0B0C09] text-foreground">
              {o}
            </option>
          ))}
        </select>

        <ChevronDown
          className={cn(
            'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200',
            focused ? 'text-eleva' : 'text-foreground/55'
          )}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SuccessView: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 16 }}
        className="relative grid h-24 w-24 place-items-center"
      >
        {[0, 0.3, 0.6].map((delay) => (
          <motion.div
            key={delay}
            className="absolute inset-0 rounded-full border-2 border-eleva/40"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: [1, 1.8, 1.8], opacity: [0.6, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay, ease: 'easeOut' }}
          />
        ))}
        <div
          className="relative grid h-24 w-24 place-items-center rounded-full bg-eleva"
          style={{ boxShadow: '0 0 60px rgba(200,245,66,0.5)' }}
        >
          <motion.svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.svg>
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
      >
        Pedido recebido
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-3 max-w-md text-base text-foreground/65 leading-relaxed"
      >
        A Sofia, nossa IA, já está te chamando no WhatsApp pra agendar o seu
        diagnóstico. Fica de olho no celular.
      </motion.p>
    </motion.div>
  );
};

export const Diagnostico: React.FC = () => {
  const [data, setData] = React.useState<FormData>(initialData);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [status, setStatus] = React.useState<Status>('idle');
  const [globalError, setGlobalError] = React.useState<string>('');

  const set = (k: keyof FormData) => (v: string) => {
    setData((d) => ({ ...d, [k]: k === 'whatsapp' ? maskPhone(v) : v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    const v = validate(data);
    setErrors(v);
    if (Object.keys(v).length > 0) {
      const firstError = Object.keys(v)[0];
      const el = document.getElementById(firstError);
      el?.focus();
      return;
    }

    setStatus('submitting');

    const phoneDigits = data.whatsapp.replace(/\D/g, '');
    const segment = [
      `Serviço: ${data.servico}`,
      `Faturamento: ${data.faturamento}`,
      data.mensagem ? `Mensagem: ${data.mensagem}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    try {
      const res = await fetch(`${SB_URL}/functions/v1/form-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.nome,
          company: data.empresa,
          whatsapp: phoneDigits,
          email: data.email,
          segment,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || 'Falha ao enviar');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setGlobalError(
        `Não foi possível enviar agora. Tenta de novo ou nos chame no WhatsApp: ${WHATSAPP_FALLBACK}`
      );
    }
  };

  return (
    <section
      id="diagnostico"
      className="relative isolate w-full overflow-hidden bg-background pt-10 pb-24 sm:pt-12 sm:pb-28 md:pt-16 md:pb-32"
    >
      {/* Aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[100px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(200,245,66,0.06) 0%, rgba(200,245,66,0.02) 40%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        {/* Heading */}
        <div className="mb-10 text-center sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-eleva/30 bg-eleva/[0.06] px-4 py-1.5 text-xs font-medium tracking-wide text-eleva backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-eleva shadow-[0_0_8px_rgba(200,245,66,0.8)]" />
            Diagnóstico gratuito
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="font-display text-balance text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tightest text-foreground"
          >
            Agende seu <span className="text-eleva">diagnóstico</span> gratuito
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-balance text-base sm:text-lg leading-relaxed text-foreground/75"
          >
            Preenche em 30 segundos. A gente te chama no WhatsApp.
          </motion.p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl border border-white/[0.08] bg-[#0A0B07]/85 backdrop-blur-md"
          style={{
            boxShadow: '0 40px 100px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Soft inner glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              background:
                'radial-gradient(60% 50% at 50% 0%, rgba(200,245,66,0.05), transparent 70%)',
            }}
            aria-hidden
          />

          <div className="relative p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <SuccessView key="success" />
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={onSubmit}
                  noValidate
                >
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                    <FloatingField
                      name="nome"
                      label="Seu nome"
                      value={data.nome}
                      error={errors.nome}
                      required
                      autoComplete="name"
                      maxLength={80}
                      onChange={set('nome')}
                    />
                    <FloatingField
                      name="empresa"
                      label="Nome da empresa"
                      value={data.empresa}
                      error={errors.empresa}
                      required
                      autoComplete="organization"
                      maxLength={80}
                      onChange={set('empresa')}
                    />
                    <FloatingField
                      name="whatsapp"
                      label="WhatsApp"
                      type="tel"
                      value={data.whatsapp}
                      error={errors.whatsapp}
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={20}
                      onChange={set('whatsapp')}
                    />
                    <FloatingField
                      name="email"
                      label="E-mail"
                      type="email"
                      value={data.email}
                      error={errors.email}
                      required
                      autoComplete="email"
                      maxLength={120}
                      onChange={set('email')}
                    />
                    <FloatingSelect
                      name="servico"
                      label="Qual serviço interessa"
                      options={SERVICOS}
                      value={data.servico}
                      error={errors.servico}
                      required
                      onChange={set('servico')}
                    />
                    <FloatingSelect
                      name="faturamento"
                      label="Faturamento mensal"
                      options={FATURAMENTOS}
                      value={data.faturamento}
                      error={errors.faturamento}
                      required
                      onChange={set('faturamento')}
                    />
                  </div>

                  {/* Textarea */}
                  <div className="mt-4 sm:mt-5">
                    <div
                      className={cn(
                        'relative rounded-xl border bg-[#0B0C09] transition-all duration-300',
                        'border-white/[0.1] focus-within:border-eleva/60 focus-within:shadow-[0_0_0_4px_rgba(200,245,66,0.12)] hover:border-white/20'
                      )}
                    >
                      <label
                        htmlFor="mensagem"
                        className="pointer-events-none absolute left-4 top-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/55"
                      >
                        Mensagem <span className="text-foreground/40 normal-case">(opcional)</span>
                      </label>
                      <textarea
                        id="mensagem"
                        name="mensagem"
                        rows={3}
                        maxLength={500}
                        value={data.mensagem}
                        onChange={(e) => set('mensagem')(e.target.value)}
                        placeholder="Conte rapidamente seu maior desafio hoje"
                        className="w-full resize-y bg-transparent px-4 pb-3 pt-8 text-[15px] text-foreground outline-none placeholder:text-foreground/30"
                      />
                    </div>
                  </div>

                  {/* Privacy line */}
                  <p className="mt-5 text-xs leading-relaxed text-foreground/40">
                    Ao enviar, você concorda com nossa política de privacidade. Não fazemos spam.
                  </p>

                  {/* Global error */}
                  <AnimatePresence>
                    {status === 'error' && globalError ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-3 text-sm text-red-300">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{globalError}</span>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {/* Submit */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className={cn(
                        'group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-eleva px-8 text-base font-semibold tracking-tight text-primary-foreground',
                        'shadow-[0_0_0_1px_rgba(200,245,66,0.4),0_12px_36px_-8px_rgba(200,245,66,0.55)]',
                        'transition-all duration-300 sm:w-auto sm:min-w-[280px]',
                        'hover:shadow-[0_0_0_1px_rgba(200,245,66,0.6),0_16px_48px_-8px_rgba(200,245,66,0.75)] hover:-translate-y-0.5',
                        'disabled:cursor-not-allowed disabled:opacity-90'
                      )}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {status === 'submitting' ? (
                          <motion.span
                            key="loading"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2"
                          >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando
                          </motion.span>
                        ) : (
                          <motion.span
                            key="idle"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2"
                          >
                            Quero meu diagnóstico
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
