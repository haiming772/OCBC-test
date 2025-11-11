import { ReactNode } from 'react';

export type TableHeader = {
  key: string;
  label: string;
  align?: 'left' | 'right';
};

type TableProps = {
  caption?: string;
  headers: TableHeader[];
  children: ReactNode;
};

export function Table({ caption, headers, children }: TableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200" role="region">
      <div className="max-h-[540px] overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm" role="table">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  scope="col"
                  className={`px-4 py-3 text-left font-semibold uppercase tracking-wide text-gray-500 ${
                    header.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
