'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

export function Toast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<'success' | 'error'>('success');
  const paramsString = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(paramsString);
    const success = params.get('success');
    const error = params.get('error');
    if (!success && !error) {
      return;
    }

    setMessage(success || error);
    setVariant(success ? 'success' : 'error');
    setVisible(true);

    const timeout = setTimeout(() => {
      setVisible(false);
      params.delete('success');
      params.delete('error');
      router.replace(`${pathname}${params.size ? `?${params.toString()}` : ''}`);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [paramsString, pathname, router]);

  if (!visible || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'fixed right-6 top-6 z-50 flex max-w-sm items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lg',
        variant === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
      )}
    >
      {message}
    </div>
  );
}
