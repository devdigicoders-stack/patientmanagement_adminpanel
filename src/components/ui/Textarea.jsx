import React, { forwardRef } from "react";

export const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      rows = 3,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full bg-white border text-sm text-slate-900 rounded-lg px-3.5 py-2.5 outline-none transition-all duration-200 placeholder:text-slate-400 resize-y ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-300 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-slate-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
