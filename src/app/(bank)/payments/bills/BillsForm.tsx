'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { billPayAction } from '../../actions';
import { Field } from '@/components/Field';

const billers = ['SP Group', 'Singtel', 'Town Council'];

const initialState: { error?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" data-testid="btn-bill-submit" disabled={pending}>
      {pending ? 'Submitting�' : 'Submit payment'}
    </button>
  );
}

export default function BillsForm({ accounts }: { accounts: { id: number; name: string }[] }) {
  const [state, action] = useFormState(billPayAction, initialState);
  return (
    <form action={action} className="space-y-6 rounded-2xl border border-gray-200 bg-white/80 p-6">
      <Field label="From account" htmlFor="accountId">
        <select
          id="accountId"
          name="accountId"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          data-testid="select-bill-account"
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Biller" htmlFor="biller">
        <select
          id="biller"
          name="biller"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          data-testid="select-biller"
        >
          {billers.map((biller) => (
            <option key={biller}>{biller}</option>
          ))}
        </select>
      </Field>
      <Field label="Reference" htmlFor="reference">
        <input
          id="reference"
          name="reference"
          required
          data-testid="input-bill-reference"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </Field>
      <Field label="Amount" htmlFor="amount">
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          data-testid="input-bill-amount"
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
