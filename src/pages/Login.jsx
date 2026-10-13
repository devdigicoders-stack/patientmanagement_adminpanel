import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  X,
  ArrowRight,
  Headphones,
  Phone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";

/* ---------- Script typography for "Welcome Back" & "Healthcare Made Simple" ---------- */
const scriptStyle = {
  fontFamily: "'Great Vibes', 'Dancing Script', cursive",
};

/* Custom Brand Logo icon */
const LogoIcon = ({ className = "w-[44px] h-[38px] sm:w-[50px] sm:h-[44px]", gradientId = "heartGradDefault" }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00c6ff" />
        <stop offset="55%" stopColor="#0088ff" />
        <stop offset="100%" stopColor="#0a5af0" />
      </linearGradient>
    </defs>
    <path
      d="M32 56 C32 56 6 36 6 20 C6 11.16 13.16 4 22 4 C27.16 4 31.7 6.45 32 10.2 C32.3 6.45 36.84 4 42 4 C50.84 4 58 11.16 58 20 C58 36 32 56 32 56 Z"
      fill={`url(#${gradientId})`}
    />
    <path
      d="M 12 28 L 22 28 L 26 21 L 30 35 L 35 15 L 40 33 L 44 28 L 52 28"
      stroke="#ffffff"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* Custom Mail icon */
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#2f86e8" className="shrink-0">
    <path d="M3 5h18a1 1 0 011 1v.5l-10 6.5L2 6.5V6a1 1 0 011-1zM2 9l10 6.5L22 9v9a1 1 0 01-1 1H3a1 1 0 01-1-1V9z" />
  </svg>
);

/* Custom Lock icon */
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#2f86e8" className="shrink-0">
    <path d="M6 10V8a6 6 0 1112 0v2h1a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V11a1 1 0 011-1h1zM8 10h8V8a4 4 0 10-8 0v2z" />
  </svg>
);

const inputCls =
  "w-full h-[46px] sm:h-[50px] bg-white border border-[#dfe8f5] text-[#0f2b5c] text-sm sm:text-[15px] rounded-xl sm:rounded-2xl outline-none shadow-[0_2px_8px_rgba(10,108,240,0.04)] focus:border-[#0a7bf5] focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-slate-400 font-normal";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Fast demo fill helper
  const fillDemoCredentials = () => {
    setEmail("admin@digicoders-health.com");
    setPassword("Admin@2026!");
    setError("");
    setEmailError("");
    setPasswordError("");
    showToast("Admin credentials filled!", "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setError("");

    if (!email) {
      setEmailError("Email address is required.");
      showToast("Please enter your email address.", "error");
      return;
    }
    if (!password) {
      setPasswordError("Password is required.");
      showToast("Please enter your password.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res?.success) {
        showToast("Welcome back! Login successful.", "success");
        navigate("/dashboard");
      }
    } catch (err) {
      const respData = err.response?.data;
      const msg =
        respData?.message ||
        (err.message === "Network Error"
          ? "Unable to connect to backend server. Please check if server is running on port 5000."
          : "Invalid email or password credentials.");

      showToast(msg, "error");
      setError(msg);

      if (respData?.errors?.email || (msg && msg.toLowerCase().includes("email"))) {
        setEmailError(msg);
        setPasswordError("");
      } else if (respData?.errors?.password || (msg && msg.toLowerCase().includes("password"))) {
        setPasswordError(msg);
        setEmailError("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 h-screen h-[100dvh] w-screen w-[100dvw] flex flex-col justify-between p-2.5 sm:p-3.5 lg:p-4.5 font-sans overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(circle at 10% 20%, rgba(10, 108, 240, 0.12) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(18, 198, 192, 0.12) 0%, transparent 45%), linear-gradient(135deg, #dbeafe 0%, #edf5fd 50%, #d4e7fc 100%)",
      }}
    >
      {/* Strict non-scrollable styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&display=swap');
        html, body, #root {
          overflow: hidden !important;
          height: 100% !important;
          max-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>

      {/* Decorative ambient glowing orbs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* ---------- HEADER ---------- */}
      <header className="relative z-20 w-full max-w-[1400px] mx-auto flex items-center justify-between shrink-0 py-0.5">
        {/* On mobile/tablet: show brand in header. On desktop (lg+): brand is placed above the hero illustration */}
        <div className="lg:hidden flex items-center gap-2.5 sm:gap-3">
          <LogoIcon gradientId="mobileHeaderHeartGrad" />
          <div>
            <h1 className="text-base sm:text-lg font-bold leading-[1.1] text-[#0b2a5b]">Patient Record</h1>
            <h1 className="text-base sm:text-lg font-bold leading-[1.1] text-[#0a6cf0]">Management System</h1>
            <p className="text-[9px] sm:text-[10px] text-slate-500 tracking-tight">
              Smarter Records &nbsp;|&nbsp; Better Care &nbsp;|&nbsp; Healthier Tomorrow
            </p>
          </div>
        </div>

      </header>

      {/* ---------- MAIN: Desktop = (Left: Content + PNG seamlessly underneath, Right: Form) | Mobile & Tab = (Only Form, Centered) ---------- */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-[1400px] mx-auto flex items-center justify-center my-auto py-1">
        <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10">
          {/* LEFT COLUMN: Content + PNG seamlessly underneath without separate background card */}
          <section className="hidden lg:flex lg:w-1/2 xl:w-[50%] flex-col justify-center items-center text-center max-h-[490px] xl:max-h-[510px] px-3 xl:px-6 shrink-0 gap-2.5 xl:gap-3.5 my-auto">
            <div className="flex flex-col items-center text-center">
              {/* Brand Logo & System Name (Moved from top to center above PNG) */}
              <div className="flex items-center justify-center gap-3.5 mb-2">
                <LogoIcon
                  gradientId="heroCenterHeartGrad"
                  className="w-[52px] h-[46px] xl:w-[60px] xl:h-[52px]"
                />
                <div className="text-left">
                  <h1 className="text-2xl xl:text-3xl 2xl:text-[32px] font-extrabold leading-[1.08] text-[#0b2a5b] tracking-tight">
                    Patient Record
                  </h1>
                  <h1 className="text-2xl xl:text-3xl 2xl:text-[32px] font-extrabold leading-[1.08] text-[#0a6cf0] tracking-tight">
                    Management System
                  </h1>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-xs sm:text-[13px] font-semibold text-slate-500 tracking-wide mt-0.5">
                Smarter Records &nbsp;|&nbsp; Better Care &nbsp;|&nbsp; Healthier Tomorrow
              </p>

              {/* Description */}
              <p className="mt-1.5 max-w-[460px] text-xs sm:text-[13px] leading-relaxed text-slate-600 text-center mx-auto">
                A complete digital solution for managing patient records, visits, medical history and hospital
                operations — all in one place.
              </p>
            </div>

            {/* PNG Illustration directly underneath without separate background container */}
            <div className="w-full flex items-center justify-center">
              <img
                src="/login_illustration.png"
                alt="Patient Management System Illustration"
                className="w-full h-auto max-h-[250px] xl:max-h-[280px] 2xl:max-h-[300px] object-contain select-none transition-transform duration-500 ease-out hover:scale-[1.02]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/doctor_bg.jpg";
                }}
              />
            </div>
          </section>

          {/* RIGHT COLUMN: LOGIN FORM (Fits 100% on any screen without scrolling) */}
          <section className="w-full lg:w-1/2 xl:w-[48%] max-w-[450px] sm:max-w-[480px] flex items-center justify-center my-auto">
            <div className="relative w-full bg-white/95 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] px-6 sm:px-9 py-6 sm:py-8 lg:py-9 border border-white shadow-[0_20px_50px_-12px_rgba(10,60,138,0.22)] overflow-hidden">
              {/* Top-Right Curved Cyan-Blue Accent with Pulse Icon */}
              <div className="absolute top-0 right-0 w-[105px] h-[105px] sm:w-[120px] sm:h-[120px] rounded-bl-[75px] sm:rounded-bl-[90px] bg-gradient-to-bl from-[#12c6c0] via-[#0a7bf5] to-[#0a5af0] pointer-events-none flex items-start justify-end p-3.5 sm:p-4.5">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow" strokeWidth={2.4} />
              </div>

              {/* Header Text */}
              <div className="relative mb-5 sm:mb-6 pr-14">
                <p style={scriptStyle} className="text-[32px] sm:text-[38px] leading-none text-[#0a6cf0] select-none">
                  Welcome Back
                </p>
                <h2 className="mt-1 text-[21px] sm:text-[24px] font-bold text-[#0b2a5b] tracking-tight leading-tight">
                  Login to Your Account
                </h2>
                <p className="mt-1 text-xs sm:text-[13px] leading-snug text-slate-500">
                  Access your credentials to continue to the Patient Record Management System.
                </p>
              </div>


              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4.5">
                {/* Email Address */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="text-xs sm:text-[13px] font-semibold text-[#0b2a5b]">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <MailIcon />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      style={{ paddingLeft: "44px", paddingRight: "14px" }}
                      className={`${inputCls} ${
                        emailError
                          ? "!border-rose-500 !ring-4 !ring-rose-500/15"
                          : ""
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="password" className="text-xs sm:text-[13px] font-semibold text-[#0b2a5b]">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <LockIcon />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      style={{ paddingLeft: "44px", paddingRight: "44px" }}
                      className={`${inputCls} ${
                        passwordError
                          ? "!border-rose-500 !ring-4 !ring-rose-500/15"
                          : ""
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[46px] sm:h-[50px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0a7bf5] to-[#4f6df5] text-white text-sm sm:text-base font-bold shadow-[0_10px_22px_rgba(10,108,240,0.32)] flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                      <span>Login to System</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="relative z-20 w-full max-w-[1400px] mx-auto flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 shrink-0 py-0.5 border-t border-blue-200/50">
        <span>&copy; 2025 Patient Record Management System. All rights reserved.</span>
        <span style={scriptStyle} className="text-[17px] sm:text-[20px] text-[#0aa5c0] select-none">
          Healthcare Made Simple —
        </span>
      </footer>

      {/* ---------- FORGOT PASSWORD / HELP MODAL ---------- */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-center shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0a7bf5] flex items-center justify-center mx-auto mb-3 border border-blue-100">
              <KeyRound className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-1">Account Assistance</h3>
            <p className="text-[11px] text-slate-500 mb-3.5 leading-relaxed">
              Please contact your hospital system administrator to issue credentials or perform password resets.
            </p>

            <div className="bg-slate-50 rounded-xl p-3 mb-4 text-[11px] border border-slate-200/80 text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Admin Email:</span>
                <span className="font-semibold text-blue-600">admin@digicoders-health.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Helpline:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-500" /> +91 98765 00000
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  fillDemoCredentials();
                  setShowForgotModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0a6cf0] text-[11px] font-bold transition-all border border-blue-200 cursor-pointer"
              >
                Auto-fill Demo
              </button>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;