import React, { useState, useMemo } from "react";
import {
  Lock,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  ShieldAlert,
  ArrowRight,
  Check,
  X,
  UserCheck,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Breadcrumb } from "../components/ui/Breadcrumb";

export const ChangePassword = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Check URL query param for default tab (e.g. /change-password?tab=id)
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") === "id" ? "id" : "password";
  const [activeTab, setActiveTab] = useState(initialTab);

  // -------------------------------------------------------------------------
  // PASSWORD CHANGE STATE
  // -------------------------------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // -------------------------------------------------------------------------
  // LOGIN ID (EMAIL) CHANGE STATE
  // -------------------------------------------------------------------------
  const [newEmail, setNewEmail] = useState("");
  const [idCurrentPassword, setIdCurrentPassword] = useState("");
  const [showIdCurrentPassword, setShowIdCurrentPassword] = useState(false);
  const [isSubmittingId, setIsSubmittingId] = useState(false);

  // -------------------------------------------------------------------------
  // PASSWORD REQUIREMENTS & STRENGTH
  // -------------------------------------------------------------------------
  const requirements = useMemo(() => {
    return [
      {
        id: "length",
        label: "At least 8 characters long",
        met: newPassword.length >= 8,
      },
      {
        id: "uppercase",
        label: "At least one uppercase letter (A-Z)",
        met: /[A-Z]/.test(newPassword),
      },
      {
        id: "lowercase",
        label: "At least one lowercase letter (a-z)",
        met: /[a-z]/.test(newPassword),
      },
      {
        id: "number",
        label: "At least one numeric digit (0-9)",
        met: /[0-9]/.test(newPassword),
      },
      {
        id: "special",
        label: "At least one special character (!@#$%^&*)",
        met: /[^A-Za-z0-9]/.test(newPassword),
      },
      {
        id: "match",
        label: "New and confirm passwords match",
        met: Boolean(newPassword && confirmPassword && newPassword === confirmPassword),
      },
    ];
  }, [newPassword, confirmPassword]);

  // Calculate Strength based on the 5 core rules (excluding match)
  const strengthInfo = useMemo(() => {
    if (!newPassword) {
      return { score: 0, label: "Not Entered", color: "bg-slate-200", textColor: "text-slate-400", width: "w-0" };
    }
    const metCount = [
      newPassword.length >= 8,
      /[A-Z]/.test(newPassword),
      /[a-z]/.test(newPassword),
      /[0-9]/.test(newPassword),
      /[^A-Za-z0-9]/.test(newPassword),
    ].filter(Boolean).length;

    switch (metCount) {
      case 1:
        return { score: 1, label: "Very Weak", color: "bg-rose-500", textColor: "text-rose-600", width: "w-1/5" };
      case 2:
        return { score: 2, label: "Weak", color: "bg-orange-500", textColor: "text-orange-600", width: "w-2/5" };
      case 3:
        return { score: 3, label: "Medium", color: "bg-amber-500", textColor: "text-amber-600", width: "w-3/5" };
      case 4:
        return { score: 4, label: "Strong", color: "bg-blue-500", textColor: "text-blue-600", width: "w-4/5" };
      case 5:
        return { score: 5, label: "Very Strong", color: "bg-emerald-500", textColor: "text-emerald-600", width: "w-full" };
      default:
        return { score: 0, label: "Very Weak", color: "bg-rose-500", textColor: "text-rose-600", width: "w-1/5" };
    }
  }, [newPassword]);

  // -------------------------------------------------------------------------
  // SUBMIT PASSWORD CHANGE
  // -------------------------------------------------------------------------
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast("Please enter your current password.", "error");
      return;
    }

    if (newPassword === currentPassword) {
      showToast("New password cannot be identical to your current password.", "error");
      return;
    }

    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters long.", "error");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      showToast("New password must contain at least one uppercase letter (A-Z).", "error");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      showToast("New password must contain at least one lowercase letter (a-z).", "error");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      showToast("New password must contain at least one numeric digit (0-9).", "error");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      showToast("New password must contain at least one special character.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Confirm password does not match new password!", "error");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        showToast("Password updated successfully! Your credentials are secure.", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Change password error:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to update password. Please check your current password.";
      showToast(errMsg, "error");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // -------------------------------------------------------------------------
  // SUBMIT ID (EMAIL) CHANGE -> IMMEDIATE LOGOUT
  // -------------------------------------------------------------------------
  const handleIdSubmit = async (e) => {
    e.preventDefault();

    const normalizedNewEmail = newEmail.trim().toLowerCase();

    if (!normalizedNewEmail) {
      showToast("Please enter a new Login ID / Email address.", "error");
      return;
    }

    // Basic email format regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedNewEmail)) {
      showToast("Please enter a valid email format (e.g. name@domain.com).", "error");
      return;
    }

    if (user?.email && user.email.toLowerCase() === normalizedNewEmail) {
      showToast("New Login ID is identical to your current Login ID.", "error");
      return;
    }

    if (!idCurrentPassword) {
      showToast("Please enter your current password to authorize ID change.", "error");
      return;
    }

    setIsSubmittingId(true);
    try {
      const res = await authService.changeEmail(normalizedNewEmail, idCurrentPassword);
      if (res.success) {
        showToast(
          `Login ID successfully changed to ${normalizedNewEmail}! Logging out now...`,
          "success"
        );
        // Immediately log out and redirect to login page
        await logout();
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Change ID error:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to update Login ID. Please verify your current password.";
      showToast(errMsg, "error");
      setIsSubmittingId(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pb-16">
      <Breadcrumb
        items={[
          { label: "User Account", path: "/profile" },
          { label: "Security & Credentials" },
        ]}
      />

      {/* =====================================================================
          HEADER & TAB SELECTOR
      ===================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#e8f2fe] text-[#0a6cf0] border border-blue-200/60 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Account Security Center
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manage Security Credentials
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your account password or change your system Login ID (Email).
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "password"
                  ? "bg-white text-[#0a6cf0] shadow-sm shadow-slate-200 font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("id")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "id"
                  ? "bg-white text-[#0a6cf0] shadow-sm shadow-slate-200 font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Change Login ID</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: CHANGE PASSWORD
      ===================================================================== */}
      {activeTab === "password" && (
        <Card
          title="Change Account Password"
          subtitle="Keep your hospital management account secure with a strong password"
        >
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6 pt-2">
            {/* 1. CURRENT PASSWORD */}
            <Input
              label="1. Current Password *"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              icon={Lock}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showCurrentPassword ? "Hide password" : "Show password"}
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* 2. NEW PASSWORD */}
            <div className="flex flex-col gap-2">
              <Input
                label="2. New Password *"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter your new secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={Key}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showNewPassword ? "Hide password" : "Show password"}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* 4. PASSWORD STRENGTH BAR & INDICATOR */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Password Strength:</span>
                  <span className={`font-black ${strengthInfo.textColor}`}>
                    {strengthInfo.label}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthInfo.color} ${strengthInfo.width}`}
                  />
                </div>
              </div>
            </div>

            {/* 3. CONFIRM PASSWORD */}
            <Input
              label="3. Confirm New Password *"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Key}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* 4. PASSWORD REQUIREMENTS CHECKLIST */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0a6cf0]" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Password Requirements
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-xl border transition-all ${
                      req.met
                        ? "bg-emerald-50/80 text-emerald-800 border-emerald-200/80 font-semibold"
                        : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {req.met ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      </div>
                    )}
                    <span className="truncate">{req.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("id")}
                className="text-xs font-bold text-[#0a6cf0] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <span>Want to change your Login ID (Email) instead?</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <Button
                type="submit"
                variant="primary"
                icon={isSubmittingPassword ? Loader2 : ShieldCheck}
                disabled={isSubmittingPassword}
                className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20 px-6"
              >
                {isSubmittingPassword ? "Updating Password..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* =====================================================================
          TAB 2: CHANGE LOGIN ID (EMAIL) -> TURANT LOGOUT
      ===================================================================== */}
      {activeTab === "id" && (
        <Card
          title="Change System Login ID"
          subtitle="Update your username/email address used to authenticate into this system"
        >
          {/* IMMEDIATE LOGOUT ALERT NOTICE */}
          <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 mb-6 text-amber-900 shadow-xs">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <strong className="text-sm font-bold text-amber-950 flex items-center gap-2">
                Important Security Action: Immediate Logout
              </strong>
              <p className="text-amber-800 leading-relaxed">
                Jaise hi aap apna <strong>Login ID / Email</strong> change karenge, aapka current session
                turant terminate ho jayega aur aap <strong>automatically logout</strong> ho jayenge.
                Iske baad aapko apne <strong>New Login ID</strong> aur existing password se dobara login karna hoga.
              </p>
            </div>
          </div>

          <form onSubmit={handleIdSubmit} className="flex flex-col gap-5">
            {/* CURRENT LOGIN ID (READ ONLY) */}
            <div>
              <Input
                label="Current Login ID (Email)"
                type="email"
                value={user?.email || ""}
                readOnly
                disabled
                icon={Mail}
                className="bg-slate-100 text-slate-500 cursor-not-allowed font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                This is your active login username.
              </span>
            </div>

            {/* NEW LOGIN ID */}
            <div>
              <Input
                label="New Login ID (Email) *"
                type="email"
                placeholder="Enter new email address (e.g. doctor.admin@hospital.com)"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                icon={Mail}
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Make sure you have access to this email address.
              </span>
            </div>

            {/* CURRENT PASSWORD FOR SECURITY VERIFICATION */}
            <div>
              <Input
                label="Confirm with Current Password *"
                type={showIdCurrentPassword ? "text" : "password"}
                placeholder="Enter current password to verify your identity"
                value={idCurrentPassword}
                onChange={(e) => setIdCurrentPassword(e.target.value)}
                icon={Lock}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowIdCurrentPassword(!showIdCurrentPassword)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showIdCurrentPassword ? "Hide password" : "Show password"}
                    aria-label={showIdCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showIdCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Password is required to prevent unauthorized username modifications.
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("password")}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Back to Change Password</span>
              </button>

              <Button
                type="submit"
                variant="primary"
                icon={isSubmittingId ? Loader2 : LogOut}
                disabled={isSubmittingId}
                className="cursor-pointer bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-md shadow-rose-500/20 px-6"
              >
                {isSubmittingId ? "Changing ID & Logging Out..." : "Change ID & Logout Immediately"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ChangePassword;
