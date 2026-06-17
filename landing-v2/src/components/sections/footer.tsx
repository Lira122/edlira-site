import * as React from 'react';
import { Instagram, Linkedin, MessageCircle, Youtube } from 'lucide-react';

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const navLinks: FooterLink[] = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Cases', href: '#prova-social' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Diagnóstico', href: '#diagnostico' },
];

const socialLinks: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/o.liraads',
    icon: Instagram,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/edmilson-lira-020829354/',
    icon: Linkedin,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@lira_a.i',
    icon: Youtube,
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/5512981680894',
    icon: MessageCircle,
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full border-t border-white/[0.06] bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 sm:px-8 sm:pt-20">
        {/* Top grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-9 w-9 place-items-center rounded-lg bg-eleva font-display text-lg font-bold text-primary-foreground"
                style={{ boxShadow: '0 0 24px rgba(200,245,66,0.35)' }}
              >
                E
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Eleva <span className="text-eleva">Digital</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/55">
              Feito com obsessão por números. Taubaté, SP.
            </p>

            {/* Social row */}
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group grid h-10 w-10 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-eleva/40 hover:bg-eleva/[0.06] hover:text-eleva hover:shadow-[0_8px_24px_-8px_rgba(200,245,66,0.4)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div>
            <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
              Navegar
            </div>
            <ul className="flex flex-col gap-3">
              {navLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="group inline-flex items-center text-sm text-foreground/65 transition-colors duration-300 hover:text-eleva"
                  >
                    <span className="relative">
                      {label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-eleva transition-all duration-300 group-hover:w-full" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
              Contato
            </div>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a
                  href="https://wa.me/5512981680894"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/65 transition-colors duration-300 hover:text-eleva"
                >
                  (12) 98168-0894
                </a>
              </li>
              <li>
                <a
                  href="mailto:junior@elevabrands.com.br"
                  className="text-foreground/65 transition-colors duration-300 hover:text-eleva"
                >
                  junior@elevabrands.com.br
                </a>
              </li>
              <li className="text-foreground/45">Taubaté, SP</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-14 h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent sm:mt-16" />

        {/* Bottom row */}
        <div className="mt-7 flex flex-col gap-3 text-xs text-foreground/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Eleva Digital. EDMILSON ROSA LIRA JUNIOR. CNPJ
            65.375.742/0001-47.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a
              href="https://elevabrands.com.br/privacidade.html"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-eleva"
            >
              Privacidade
            </a>
            <a
              href="https://elevabrands.com.br/termos.html"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-eleva"
            >
              Termos
            </a>
            <a
              href="https://elevabrands.com.br/exclusao-dados.html"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-eleva"
            >
              Exclusão de dados
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
