'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastTone = 'success' | 'error' | 'warning' | 'info';
interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}
interface ToastApi {
  push: (tone: ToastTone, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastApi | undefined>(undefined);

const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
const TONE_CLASS: Record<ToastTone, string> = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-metal',
};
const BAR_CLASS: Record<ToastTone, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-accent',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const remove = useCallback((id: number) => {
    setItems((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = Date.now() + Math.random();
      setItems((cur) => [...cur.slice(-3), { id, tone, title, description }]);
      window.setTimeout(() => remove(id), 5000);
    },
    [remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      push,
      success: (t, d) => push('success', t, d),
      error: (t, d) => push('error', t, d),
      info: (t, d) => push('info', t, d),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2 p-4 sm:items-end">
            <AnimatePresence>
              {items.map((t) => {
                const Icon = ICONS[t.tone];
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, x: 24, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 24, scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg border border-border bg-surface-raised p-3 pe-9 shadow-2xl shadow-black/40"
                  >
                    <span className={cn('absolute inset-y-0 start-0 w-1', BAR_CLASS[t.tone])} />
                    <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', TONE_CLASS[t.tone])} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{t.title}</p>
                      {t.description && (
                        <p className="mt-0.5 whitespace-pre-line break-words text-xs text-muted-foreground">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => remove(t.id)}
                      className="absolute end-2 top-2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
