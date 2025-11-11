'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { registerAction } from '../actions';
import { Field } from '@/components/Field';

const initialState: { error?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn-primary w-full"
      data-testid="btn-register-submit"
      disabled={pending}
    >
      {pending ? 'Registering�' : 'Create account'}
    </button>
  );
}

export default function RegisterPage() {
  const [state, action] = useFormState(registerAction, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Create an account</h1>
        <p className="mb-6 text-sm text-gray-600">For demo access only. Use a valid email address.</p>
        <form action={action} className="space-y-5" aria-describedby={state.error ? 'register-error' : undefined}>
          <Field label="Full name" htmlFor="name">
            <input
              id="name"
              name="name"
              type="text"
              required
              data-testid="input-name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[color:var(--ocbc-red)] focus:outline-none"
            />
          </Field>
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
          <Field label="Password" htmlFor="password" description="Minimum 8 characters with at least one number.">
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
            <p id="register-error" role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}
          <SubmitButton />
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-[color:var(--ocbc-red)] underline" data-testid="link-login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
