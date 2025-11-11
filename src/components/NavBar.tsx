import { ReactNode } from 'react';
import Link from 'next/link';

interface NavBarProps {
  userName: string;
  userMenu?: ReactNode;
}

export function NavBar({ userName, userMenu }: NavBarProps) {
  return (
    <header className="bg-[color:var(--ocbc-red)] text-white shadow" role="banner">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4" aria-label="Global">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-wide" data-testid="nav-logo">
          <span className="text-sm uppercase">AccessPilot</span>
          <span className="text-xs rounded-full border border-white/40 px-2 py-0.5">Mock</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-medium md:block" aria-live="polite">
            {userName}
          </span>
          <div className="flex items-center gap-2" role="group" aria-label="User menu">
            <Link
              href="/profile"
              className="btn-ghost text-white hover:bg-white/10"
              data-testid="nav-profile"
            >
              Profile
            </Link>
            <Link
              href="/statements"
              className="btn-ghost text-white hover:bg-white/10"
              data-testid="nav-statements"
            >
              Statements
            </Link>
            {userMenu}
          </div>
        </div>
      </nav>
    </header>
  );
}
