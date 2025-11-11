import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { SideNav } from '@/components/SideNav';
import { Toast } from '@/components/Toast';
import { getUserFromCookies } from '@/lib/auth';
import { logoutAction } from './actions';

export default async function BankLayout({ children }: { children: ReactNode }) {
  const user = await getUserFromCookies();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[color:var(--ocbc-gray-bg)]">
      <NavBar
        userName={`Welcome, ${user.name}`}
        userMenu={
          <form action={logoutAction}>
            <button
              type="submit"
              className="btn-ghost text-white hover:bg-white/20"
              data-testid="btn-logout"
            >
              Logout
            </button>
          </form>
        }
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <SideNav />
        <main id="main-content" className="pb-12">
          {children}
          <p className="mt-8 text-sm text-gray-500">
            Need help? Visit our{' '}
            <Link href="/support" className="text-[color:var(--ocbc-red)]" data-testid="link-support-footer">
              support centre
            </Link>
            .
          </p>
        </main>
      </div>
      <Toast />
    </div>
  );
}
