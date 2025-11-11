import { ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ title, description, actions, children, className }: CardProps) {
  return (
    <section
      className={clsx(
        'rounded-xl border border-white/60 bg-white/90 p-6 shadow-card backdrop-blur-sm transition hover:border-[color:var(--ocbc-red)]/40',
        className
      )}
    >
      {(title || description || actions) && (
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}
