import React, { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Math.random().toString(36).substring(7);

    // Hardware vibration on supported devices (mobile/tablets)
    if (typeof window !== "undefined" && navigator?.vibrate) {
      try {
        if (type === "error") {
          navigator.vibrate([100, 50, 100, 50, 100]);
        } else {
          navigator.vibrate(80);
        }
      } catch (e) {
        // Ignore if restricted by browser permissions
      }
    }

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Global CSS for Toast Vibration and Glassmorphism Animations */}
      <style>{`
        @keyframes toastVibrateShake {
          0% {
            opacity: 0;
            transform: translateX(110%) scale(0.9);
          }
          30% {
            opacity: 1;
            transform: translateX(0) scale(1.03);
          }
          40% {
            transform: translateX(-12px) rotate(-1.8deg);
          }
          50% {
            transform: translateX(10px) rotate(1.8deg);
          }
          60% {
            transform: translateX(-8px) rotate(-1.2deg);
          }
          70% {
            transform: translateX(6px) rotate(1deg);
          }
          80% {
            transform: translateX(-3px) rotate(-0.5deg);
          }
          90% {
            transform: translateX(2px) rotate(0.2deg);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotate(0deg);
          }
        }

        @keyframes toastProgressCountdown {
          0% { width: 100%; }
          100% { width: 0%; }
        }

        .animate-toast-vibrate {
          animation: toastVibrateShake 0.65s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .animate-toast-progress {
          animation: toastProgressCountdown 4.5s linear forwards;
        }
      `}</style>

      {/* Toast Container (Top-Right, Highly Visible) */}
      <div className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[9999] flex flex-col gap-3 max-w-[390px] w-full pointer-events-none px-3 sm:px-0">
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isSuccess = toast.type === "success";

          return (
            <div
              key={toast.id}
              className="pointer-events-auto relative overflow-hidden rounded-2xl p-4 pb-4.5 shadow-[0_16px_40px_-8px_rgba(15,35,80,0.22),0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] animate-toast-vibrate select-none"
              style={{
                background: isError
                  ? "linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(254, 242, 242, 0.94) 100%)"
                  : isSuccess
                  ? "linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 253, 244, 0.94) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(239, 246, 255, 0.94) 100%)",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: isError
                  ? "rgba(239, 68, 68, 0.35)"
                  : isSuccess
                  ? "rgba(16, 185, 129, 0.35)"
                  : "rgba(10, 108, 240, 0.35)",
                borderLeftWidth: "6px",
                borderLeftColor: isError
                  ? "#ef4444"
                  : isSuccess
                  ? "#10b981"
                  : "#0a6cf0",
                borderRadius: "1rem",
              }}
            >
              <div className="flex items-start gap-3">
                {/* Frosted Icon Orb */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border ${
                    isError
                      ? "bg-red-100/90 text-red-600 border-red-200/80 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                      : isSuccess
                      ? "bg-emerald-100/90 text-emerald-600 border-emerald-200/80 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      : "bg-blue-100/90 text-blue-600 border-blue-200/80 shadow-[0_0_15px_rgba(10,108,240,0.25)]"
                  }`}
                >
                  {isError ? (
                    <AlertCircle className="w-5 h-5 animate-pulse" strokeWidth={2.4} />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-5 h-5" strokeWidth={2.4} />
                  ) : (
                    <Info className="w-5 h-5" strokeWidth={2.4} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-[11px] font-extrabold uppercase tracking-wider ${
                        isError
                          ? "text-red-600"
                          : isSuccess
                          ? "text-emerald-600"
                          : "text-blue-600"
                      }`}
                    >
                      {isError ? "Attention Required" : isSuccess ? "Success" : "Information"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-semibold text-[#0b2a5b] leading-snug break-words">
                    {toast.message}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="w-7 h-7 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Animated Progress Countdown */}
              <div className="absolute bottom-1.5 left-4 right-4 h-1 bg-black/[0.04] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full animate-toast-progress ${
                    isError
                      ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                      : isSuccess
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-[0_0_8px_rgba(10,108,240,0.4)]"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
