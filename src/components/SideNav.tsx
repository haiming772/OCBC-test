'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { label: 'Overview', href: '/', Icon: HomeIcon, testId: 'nav-overview' },
  { label: 'Accounts', href: '/accounts', Icon: CreditCardIcon, testId: 'nav-accounts' },
  { label: 'Payments', href: '/payments/paynow', Icon: CurrencyDollarIcon, testId: 'nav-payments' },
  { label: 'Statements', href: '/statements', Icon: DocumentTextIcon, testId: 'nav-statements-side' },
  { label: 'Profile', href: '/profile', Icon: UserIcon, testId: 'nav-profile-side' },
  { label: 'Support', href: '/support', Icon: LifebuoyIcon, testId: 'nav-support' }
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-6 flex w-full flex-col gap-1" aria-label="Primary">
      {navItems.map(({ label, href, Icon, testId }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            data-testid={testId}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ocbc-red)]',
              isActive ? 'bg-white text-[color:var(--ocbc-red)] shadow-sm' : 'text-gray-600 hover:bg-white'
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
