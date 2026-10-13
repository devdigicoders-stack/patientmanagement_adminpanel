import React from "react";
import { Loader2 } from "lucide-react";

export const actionBtnStyles = {
  view: "w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-200/90 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md hover:shadow-blue-500/30 active:scale-90 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center cursor-pointer select-none",
  show: "w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-200/90 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md hover:shadow-blue-500/30 active:scale-90 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center cursor-pointer select-none",
  edit: "w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-200/90 hover:bg-purple-600 hover:text-white hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/30 active:scale-90 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center cursor-pointer select-none",
  delete: "w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-200/90 hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-md hover:shadow-rose-500/30 active:scale-90 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center cursor-pointer select-none",
  print: "w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-200/90 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-500/30 active:scale-90 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center cursor-pointer select-none",
  history: "w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-200/90 hover:bg-amber-600 hover:text-white hover:border-amber-600 hover:shadow-md hover:shadow-amber-500/30 active:scale-90 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center cursor-pointer select-none",
};

export const actionBadgeBtnStyles = {
  view: "h-8 px-3 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-xs font-bold shadow-2xs hover:shadow-md hover:shadow-blue-500/30 active:scale-95 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer select-none",
  show: "h-8 px-3 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-xs font-bold shadow-2xs hover:shadow-md hover:shadow-blue-500/30 active:scale-95 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer select-none",
  edit: "h-8 px-3 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 text-xs font-bold shadow-2xs hover:shadow-md hover:shadow-purple-500/30 active:scale-95 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer select-none",
  delete: "h-8 px-3 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 text-xs font-bold shadow-2xs hover:shadow-md hover:shadow-rose-500/30 active:scale-95 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer select-none",
  print: "h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-xs font-bold shadow-2xs hover:shadow-md hover:shadow-emerald-500/30 active:scale-95 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer select-none",
  history: "h-8 px-3 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-200 hover:bg-amber-600 hover:text-white hover:border-amber-600 text-xs font-bold shadow-2xs hover:shadow-md hover:shadow-amber-500/30 active:scale-95 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer select-none",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = "",
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-sky-600 hover:bg-sky-700 text-white shadow-sm hover:shadow-md hover:shadow-sky-600/20 active:scale-[0.98]",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 active:scale-[0.98]",
    outline:
      "bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 active:scale-[0.98]",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-red-600/20 active:scale-[0.98]",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-600/20 active:scale-[0.98]",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",

    // Colorful consistent action button variants
    view:
      "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/90 shadow-xs hover:shadow-md hover:shadow-blue-500/25 active:scale-95",
    show:
      "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/90 shadow-xs hover:shadow-md hover:shadow-blue-500/25 active:scale-95",
    edit:
      "bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white border border-purple-200/90 shadow-xs hover:shadow-md hover:shadow-purple-500/25 active:scale-95",
    delete:
      "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/90 shadow-xs hover:shadow-md hover:shadow-rose-500/25 active:scale-95",
    print:
      "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200/90 shadow-xs hover:shadow-md hover:shadow-emerald-500/25 active:scale-95",
    history:
      "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white border border-amber-200/90 shadow-xs hover:shadow-md hover:shadow-amber-500/25 active:scale-95",
  };

  const sizes = {
    icon: "p-1.5 text-xs rounded-lg",
    xs: "px-2.5 py-1 text-xs gap-1 rounded-lg",
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
