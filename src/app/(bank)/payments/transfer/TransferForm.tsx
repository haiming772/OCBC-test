'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { transferAction } from '../../actions';
import { Field } from '@/components/Field';

const initialState: { error?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" data-testid="btn-transfer-submit" disabled={pending}>
      {pending ? 'Transferring�' : 'Transfer funds'}
    </button>
  );
}

export default function TransferForm({ accounts }: { accounts: { id: number; name: string }[] }) {
  const [state, action] = useFormState(transferAction, initialState);
  return (
    <form action={action} className="space-y-6 rounded-2xl border border-gray-200 bg-white/80 p-6">
      <Field label="From" htmlFor="fromAccountId">
        <select
          id="fromAccountId"
          name="fromAccountId"
          data-testid="select-transfer-from"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          required
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="To" htmlFor="toAccountId">
        <select
          id="toAccountId"
          name="toAccountId"
          data-testid="select-transfer-to"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          required
        >
          {accounts.map((acc) => (
            <option key={`to-${acc.id}`} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Amount" htmlFor="amount">
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          data-testid="input-transfer-amount"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </Field>
      <Field label="Narrative" htmlFor="note">
        <input
          id="note"
          name="note"
          maxLength={100}
          data-testid="input-transfer-note"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </Field>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
