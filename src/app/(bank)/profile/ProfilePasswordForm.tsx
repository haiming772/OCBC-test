'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updatePasswordAction } from '../actions';
import { Field } from '@/components/Field';

const initialState: { error?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" data-testid="btn-update-password" disabled={pending}>
      {pending ? 'Saving�' : 'Update password'}
    </button>
  );
}

export default function PasswordForm() {
  const [state, action] = useFormState(updatePasswordAction, initialState);
  return (
    <form action={action} className="rounded-2xl border border-gray-200 bg-white/80 p-6" aria-live="polite">
      <h2 className="text-lg font-semibold">Security</h2>
      <p className="mb-4 text-sm text-gray-500">Update your password regularly.</p>
      <Field label="Current password" htmlFor="currentPassword">
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          data-testid="input-current-password"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </Field>
      <Field label="New password" htmlFor="newPassword" description="Minimum 8 characters, include a number.">
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          data-testid="input-new-password"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </Field>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div className="mt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
