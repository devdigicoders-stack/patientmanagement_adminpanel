import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ size = "md", label = "Loading medical records..." }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
      <Loader2 className={`${sizes[size]} text-sky-600 animate-spin`} />
      {label && <p className="text-xs font-semibold text-slate-500">{label}</p>}
    </div>
  );
};
