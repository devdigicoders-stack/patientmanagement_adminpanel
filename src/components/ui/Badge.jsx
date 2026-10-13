import React from "react";

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  dot = false,
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200/80 shadow-2xs",
    primary: "bg-blue-50 text-blue-700 border-blue-200/80 shadow-2xs",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80 shadow-2xs",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80 shadow-2xs",
    info: "bg-cyan-50 text-cyan-800 border-cyan-200/80 shadow-2xs",
    dark: "bg-slate-900 text-slate-100 border-slate-800 shadow-2xs",
  };

  const dots = {
    default: "bg-slate-500",
    primary: "bg-blue-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500 animate-pulse",
    info: "bg-cyan-500",
    dark: "bg-slate-300",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-semibold",
    md: "px-2.5 py-0.5 text-xs font-semibold",
    lg: "px-3 py-1 text-sm font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[variant] || dots.default}`} />}
      <span className="truncate">{children}</span>
    </span>
  );
};

export default Badge;
