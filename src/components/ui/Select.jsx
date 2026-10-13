import React, { forwardRef } from "react";

export const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      helperText,
      required = false,
      className = "",
      placeholder = "Select an option",
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
        <select
          ref={ref}
          className={`w-full bg-white border text-sm text-slate-900 rounded-lg px-3.5 py-2.5 outline-none cursor-pointer transition-all duration-200 ${error
              ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-300 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
            } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt, idx) => (
            <option
              key={idx}
              value={typeof opt === "object" ? opt.value : opt}
            >
              {typeof opt === "object" ? opt.label : opt}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-slate-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
