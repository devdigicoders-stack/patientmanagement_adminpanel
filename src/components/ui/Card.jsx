import React from "react";

export const Card = ({
  children,
  className = "",
  title,
  subtitle,
  action,
  headerClassName = "",
  bodyClassName = "",
  variant = "glass", // glass, dark, subtle
}) => {
  const variants = {
    glass:
      "bg-white/75 backdrop-blur-md border border-white/60 shadow-lg shadow-slate-200/50 hover:bg-white/90 hover:shadow-xl hover:shadow-sky-500/5 hover:border-white/90",
    dark:
      "bg-slate-900/85 backdrop-blur-md text-white border border-white/10 shadow-xl shadow-slate-950/20",
    subtle:
      "bg-slate-50/70 backdrop-blur-sm border border-slate-200/60",
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${variants[variant]} ${className}`}
    >
      {(title || action) && (
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            variant === "dark" ? "border-slate-800/80" : "border-slate-100/80"
          } ${headerClassName}`}
        >
          <div>
            {title && (
              <h3
                className={`text-base font-bold ${
                  variant === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className={`text-xs mt-0.5 ${
                  variant === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
