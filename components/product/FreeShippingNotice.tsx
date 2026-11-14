"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Truck } from 'lucide-react';

const MinimumContext = createContext<number | null>(null);
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function FreeShippingProvider({ children }: { children: ReactNode }) {
  const [minimumCents, setMinimumCents] = useState<number | null>(null);

  useEffect(() => {
    let stopped = false;
    let busy = false;
    let controller: AbortController | undefined;
    async function load() {
      if (busy || stopped) return;
      busy = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 10000);
      try {
        const response = await fetch('/api/shipping/policy', { cache: 'no-store', signal: controller.signal });
        const data = await response.json();
        const valid = response.ok && Number.isSafeInteger(data.minimumCents) && data.minimumCents > 0;
        if (!stopped) setMinimumCents(valid ? data.minimumCents : null);
      } catch {
        if (!stopped) setMinimumCents(null);
      } finally {
        clearTimeout(timeout);
        busy = false;
      }
    }
    function refresh() { if (document.visibilityState === 'visible') void load(); }
    void load();
    window.addEventListener('focus', refresh);
    const interval = setInterval(refresh, 60000);
    return () => {
      stopped = true;
      controller?.abort();
      clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return <MinimumContext.Provider value={minimumCents}>{children}</MinimumContext.Provider>;
}

export function FreeShippingNotice({ subtotal = 0, banner = false }: { subtotal?: number; banner?: boolean }) {
  const minimumCents = useContext(MinimumContext);
  if (!minimumCents) return null;

  if (banner) return <div className="flex items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground sm:text-sm">
    <Truck className="size-4 shrink-0" aria-hidden="true" />
    <p>Frete grátis nas compras a partir de <strong>{currency.format(minimumCents / 100)}</strong></p>
  </div>;

  const subtotalCents = Number.isFinite(subtotal) ? Math.max(0, Math.round(subtotal * 100)) : 0;
  const remainingCents = Math.max(0, minimumCents - subtotalCents);
  const progress = Math.min(100, subtotalCents / minimumCents * 100);
  const message = remainingCents === 0
    ? 'Você atingiu o valor para frete grátis!'
    : `Faltam ${currency.format(remainingCents / 100)} para ganhar frete grátis`;

  return <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
    <p aria-live="polite" className="flex items-center gap-2 text-xs font-medium leading-relaxed text-foreground">
      <Truck className="size-4 shrink-0 text-primary" aria-hidden="true" /><span>{message}</span>
    </p>
    <div role="progressbar" aria-label="Valor para frete grátis" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-valuetext={message} className="h-2 overflow-hidden rounded-full bg-primary/15">
      <div className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
    </div>
  </div>;
}
