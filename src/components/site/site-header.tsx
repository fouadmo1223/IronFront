'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/magnetic';

export function SiteHeader() {
  const t = useTranslations('nav');
  const tm = useTranslations('meta');
  const pathname = usePathname();
  const { user } = useAuth();
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const links = [
    { href: '/plans', label: t('plans') },
    { href: '/about', label: t('about') },
    { href: '/facilities', label: t('facilities') },
    { href: '/trainers', label: t('trainers') },
    { href: '/contact', label: t('contact') },
  ] as const;

  // Shrink on scroll; hide on scroll-down, reveal on scroll-up. Plain scroll
  // listener + CSS transform transition (no rAF dependency).
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > last && y > 240 && !open);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color,backdrop-filter] duration-300 will-change-transform',
        hidden ? '-translate-y-full' : 'translate-y-0',
        scrolled
          ? 'border-b border-border/70 bg-background/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div
        className={cn(
          'container flex items-center justify-between gap-6 transition-[height] duration-300',
          scrolled ? 'h-14' : 'h-20',
        )}
      >
        <Link
          href="/"
          className={cn(
            'font-display font-bold uppercase leading-none transition-all duration-300',
            scrolled ? 'text-lg tracking-tightest' : 'text-2xl tracking-tight',
          )}
        >
          {tm('siteName')}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="group relative py-1 text-xs font-semibold uppercase tracking-editorial text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex items-center gap-1.5">
                  {active && <span className="h-1 w-1 rounded-full bg-accent" />}
                  {l.label}
                </span>
                <span className="absolute -bottom-0.5 left-1/2 h-px w-0 -translate-x-1/2 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher className="hidden sm:flex" />
          {user ? (
            <Magnetic className="hidden sm:inline-block">
              <Link href="/portal">
                <Button size="sm">{t('portal')}</Button>
              </Link>
            </Magnetic>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-xs font-semibold uppercase tracking-editorial text-muted-foreground transition-colors hover:text-foreground lg:block"
              >
                {t('login')}
              </Link>
              <Magnetic className="hidden sm:inline-block">
                <Link href="/register">
                  <Button size="sm">{t('register')}</Button>
                </Link>
              </Magnetic>
            </>
          )}
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-1.5 text-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ backgroundColor: 'hsl(var(--background))' }}
                className="fixed inset-0 z-[100] flex flex-col overflow-y-auto md:hidden"
              >
                <div className="container flex h-20 shrink-0 items-center justify-between">
                  <span className="font-display text-2xl font-bold uppercase">{tm('siteName')}</span>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="rounded-md p-1.5 text-foreground"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <motion.nav
                  className="container flex flex-1 flex-col justify-center gap-1 py-6"
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } } }}
                >
                  {[
                    ...links,
                    user
                      ? { href: '/portal', label: t('portal') }
                      : { href: '/login', label: t('login') },
                  ].map((l) => (
                    <motion.div
                      key={l.href}
                      variants={{
                        hidden: { opacity: 0, y: 26 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                        },
                      }}
                    >
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="block border-b border-border/60 py-3.5 font-display text-3xl font-bold uppercase leading-tight tracking-tight transition-colors hover:text-accent sm:text-4xl"
                      >
                        {l.label}
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>

                <motion.div
                  className="container flex shrink-0 items-center justify-between gap-4 pb-10 pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <LanguageSwitcher />
                  <Link
                    href={user ? '/portal' : '/register'}
                    onClick={() => setOpen(false)}
                  >
                    <Button size="lg">{user ? t('portal') : t('register')}</Button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </header>
  );
}
