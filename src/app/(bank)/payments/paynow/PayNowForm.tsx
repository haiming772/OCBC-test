'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { payNowAction } from '../../actions';
import { Field } from '@/components/Field';

type AccountOption = { id: number; name: string };
type PayeeOption = { id: number; name: string; alias: string };

const initialState: { error?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" data-testid="btn-paynow-submit" disabled={pending}>
      {pending ? 'Processing�' : 'Send now'}
    </button>
  );
}

export default function PayNowForm({ accounts, payees }: { accounts: AccountOption[]; payees: PayeeOption[] }) {
  const [state, action] = useFormState(payNowAction, initialState);

  return (
    <form action={action} className="space-y-6 rounded-2xl border border-gray-200 bg-white/80 p-6">
      <Field label="From account" htmlFor="accountId">
        <select
          id="accountId"
          name="accountId"
          required
          data-testid="select-paynow-account"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Recipient" htmlFor="recipient" description="Pick from saved payees or enter an alias.">
        <input
          list="payees"
          id="recipient"
          name="recipient"
          required
          data-testid="input-paynow-recipient"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
        <datalist id="payees">
          {payees.map((payee) => (
            <option key={payee.id} value={payee.name}>
              {payee.alias}
            </option>
          ))}
        </datalist>
      </Field>
      <Field label="Amount" htmlFor="amount">
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          data-testid="input-paynow-amount"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </Field>
      <Field label="Message" htmlFor="message">
        <input
          id="message"
          name="message"
          data-testid="input-paynow-message"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          maxLength={140}
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
