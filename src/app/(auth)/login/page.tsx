'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { loginAction } from '../actions';
import { Field } from '@/components/Field';

const initialState: { error?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn-primary w-full"
      data-testid="btn-login-submit"
      disabled={pending}
    >
      {pending ? 'Signing in�' : 'Sign in'}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useFormState(loginAction, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Sign in</h1>
        <p className="mb-6 text-sm text-gray-600">Enter your credentials to continue.</p>
        <form action={action} className="space-y-5" aria-describedby={state.error ? 'login-error' : undefined}>
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              required
              data-testid="input-email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[color:var(--ocbc-red)] focus:outline-none"
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <input
              id="password"
              name="password"
              type="password"
              required
              data-testid="input-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[color:var(--ocbc-red)] focus:outline-none"
            />
          </Field>
          {state.error && (
            <p id="login-error" role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}
          <SubmitButton />
        </form>
        <p className="mt-4 text-sm text-gray-600">
          New here?{' '}
          <Link href="/register" className="text-[color:var(--ocbc-red)] underline" data-testid="link-register">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
