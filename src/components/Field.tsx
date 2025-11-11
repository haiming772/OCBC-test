import { ReactNode, ReactElement, cloneElement, isValidElement } from 'react';
import clsx from 'clsx';

type FieldProps = {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, htmlFor, description, error, children, className }: FieldProps) {
  const describedBy = [description ? `${htmlFor}-desc` : undefined, error ? `${htmlFor}-error` : undefined]
    .filter(Boolean)
    .join(' ');

  let control: ReactNode = children;
  if (Array.isArray(children)) {
    control = children.map((child, index) => {
      if (index === 0 && isValidElement(child)) {
        return cloneElement(child as ReactElement, {
          'aria-describedby': describedBy || undefined
        } as Record<string, unknown>);
      }
      return child;
    });
  } else if (isValidElement(children)) {
    control = cloneElement(children as ReactElement, {
      'aria-describedby': describedBy || undefined
    } as Record<string, unknown>);
  }

  return (
    <div className={clsx('space-y-2', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      {description && (
        <p id={`${htmlFor}-desc`} className="text-sm text-gray-500">
          {description}
        </p>
      )}
      <div>{control}</div>
      {error && (
        <p id={`${htmlFor}-error`} role="status" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
