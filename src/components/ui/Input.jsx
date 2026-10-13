import React, { forwardRef } from "react";

export const Input = forwardRef(
  (
    {
      label,
      error,
      icon: Icon,
      helperText,
      required = false,
      className = "",
      rightElement,
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
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-white border text-sm text-slate-900 rounded-lg px-3.5 py-2.5 outline-none transition-all duration-200 placeholder:text-slate-400 ${
              Icon ? "pl-9" : ""
            } ${rightElement ? "pr-10" : ""} ${
              error
                ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-slate-300 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center text-slate-400">
              {rightElement}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-slate-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
