'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateNameAction } from '../actions';
import { Field } from '@/components/Field';

const initialState: { error?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" data-testid="btn-update-name" disabled={pending}>
      {pending ? 'Saving�' : 'Save name'}
    </button>
  );
}

export default function NameForm({ defaultName, email }: { defaultName: string; email: string }) {
  const [state, action] = useFormState(updateNameAction, initialState);

  return (
    <form action={action} className="rounded-2xl border border-gray-200 bg-white/80 p-6" aria-live="polite">
      <h2 className="text-lg font-semibold">Contact details</h2>
      <p className="mb-4 text-sm text-gray-500">Email {email}</p>
      <Field label="Preferred name" htmlFor="name">
        <input
          id="name"
          name="name"
          defaultValue={defaultName}
          required
          data-testid="input-name-update"
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
