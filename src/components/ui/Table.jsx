import React from "react";

export const Table = ({ headers = [], children, className = "" }) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-200 ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
      </table>
    </div>
  );
};
