import { MotionConfig } from 'framer-motion';
import { FloatingIconsHero, type FloatingIcon } from '@/components/ui/floating-icons-hero-section';
import { Parceiros } from '@/components/sections/parceiros';
import { ComoFunciona } from '@/components/sections/como-funciona';
import { ProvaSocial } from '@/components/sections/prova-social';
import { Fundador } from '@/components/sections/fundador';
import { Ofertas } from '@/components/sections/ofertas';
import { Faq } from '@/components/sections/faq';
import { Diagnostico } from '@/components/sections/diagnostico';
import { Footer } from '@/components/sections/footer';
import {
  IconMeta,
  IconGoogle,
  IconInstagram,
  IconWhatsApp,
  IconTikTok,
  IconYouTube,
  IconSpotify,
  IconOpenAI,
  IconSupabase,
  IconVercel,
  IconClaude,
  IconN8n,
} from '@/components/icons/brand-icons';

const heroIcons: FloatingIcon[] = [
  { id: 1, icon: IconMeta, className: 'top-[12%] left-[8%]', size: 38 },
  { id: 2, icon: IconGoogle, className: 'top-[22%] right-[10%]', size: 36 },
  { id: 3, icon: IconInstagram, className: 'top-[68%] left-[12%]', size: 36 },
  { id: 4, icon: IconWhatsApp, className: 'bottom-[14%] right-[12%]', size: 38 },
  { id: 5, icon: IconTikTok, className: 'top-[8%] left-[34%]', size: 34 },
  { id: 6, icon: IconYouTube, className: 'top-[10%] right-[32%]', size: 38 },
  { id: 7, icon: IconSpotify, className: 'bottom-[10%] left-[28%]', size: 36 },
  { id: 8, icon: IconOpenAI, className: 'top-[44%] left-[6%]', size: 36 },
  { id: 9, icon: IconSupabase, className: 'top-[52%] right-[6%]', size: 36 },
  { id: 10, icon: IconVercel, className: 'bottom-[8%] right-[36%]', size: 34 },
  { id: 11, icon: IconClaude, className: 'top-[78%] right-[24%]', size: 34 },
  { id: 12, icon: IconN8n, className: 'top-[34%] right-[22%]', size: 34 },
];

const CTA_HREF = '#diagnostico';

const trustItems = [
  <>
    <span className="text-eleva">⚡</span> +10 empresas escaladas
  </>,
  <>Acompanhamento próximo</>,
  <>Relatórios transparentes</>,
];

export default function App() {
  return (
    <MotionConfig reducedMotion="never">
      <main>
        <FloatingIconsHero
          eyebrow="Eleva Digital · marketing com IA"
          title={
            <>
              Cansado de queimar dinheiro
              <br />
              em agência que <span className="text-eleva">não entrega</span>?
            </>
          }
          subtitle="A Eleva faz marketing digital com dados, IA e foco em resultado. Estratégia, criativos e tráfego pago feitos pra escalar sem enrolação."
          ctaText="Quero meu diagnóstico gratuito"
          ctaHref={CTA_HREF}
          ctaSecondaryText="Como funciona"
          ctaSecondaryHref="#como-funciona"
          icons={heroIcons}
          trustItems={trustItems}
        />
        <Parceiros />
        <ComoFunciona />
        <ProvaSocial />
        <Fundador />
        <Ofertas />
        <Faq />
        <Diagnostico />
      </main>
      <Footer />
    </MotionConfig>
  );
}
