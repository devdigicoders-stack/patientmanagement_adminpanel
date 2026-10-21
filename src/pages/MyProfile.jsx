import React, { useState, useEffect, useRef } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Save, 
  CheckCircle2, 
  Shield, 
  Camera, 
  Loader2, 
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Upload,
  Trash2,
  Image as ImageIcon,
  KeyRound,
  Eye,
  EyeOff,
  ShieldAlert,
  LogOut,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { useToast } from "../hooks/useToast";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { Badge } from "../components/ui/Badge";
import { AdminPhotoModal } from "../components/ui/AdminPhotoModal";

export const MyProfile = () => {
  const { user, setUser, logout, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "ADMINISTRATOR",
    department: "Hospital Administration",
    avatar: "",
  });

  // -------------------------------------------------------------------------
  // CHANGE LOGIN ID (EMAIL) MODAL STATE
  // -------------------------------------------------------------------------
  const [showChangeIdModal, setShowChangeIdModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [idConfirmPassword, setIdConfirmPassword] = useState("");
  const [showIdConfirmPassword, setShowIdConfirmPassword] = useState(false);
  const [isChangingId, setIsChangingId] = useState(false);

  // Populate from authenticated user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "Administrator",
        email: user.email || "",
        phone: user.phone || "",
        role: "ADMINISTRATOR",
        department: user.department || "Hospital Administration",
        avatar: user.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop",
      });
    }
  }, [user]);

  // Handle local image file upload & preview conversion
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file (PNG, JPG, JPEG, WEBP)", "error");
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image file size must be less than 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
        setSelectedFileName(file.name);
        showToast("Profile image loaded! Click 'Save Profile Changes' to persist.", "info");
      }
    };
    reader.onerror = () => {
      showToast("Failed to read image file. Please try again.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    const defaultAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop";
    setFormData((prev) => ({
      ...prev,
      avatar: defaultAvatar,
    }));
    setSelectedFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    showToast("Reverted to default hospital avatar", "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation for Name
    if (!formData.name.trim()) {
      showToast("Full Name is required", "error");
      return;
    }

    // 2. Validation for Phone (Strict 10 digits starting with 6,7,8,9 if provided)
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      showToast("Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        avatar: formData.avatar,
      };

      const res = await authService.updateProfile(payload);
      if (res.success && res.data) {
        setUser((prev) => ({ ...prev, ...res.data }));
        showToast("Profile details updated successfully!", "success");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      const errMsg = err.response?.data?.message || "Failed to update profile";
      showToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // CHANGE LOGIN ID SUBMIT -> IMMEDIATE LOGOUT
  // -------------------------------------------------------------------------
  const handleChangeIdSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = newEmailInput.trim().toLowerCase();

    if (!normalizedEmail) {
      showToast("Please enter a new Login ID / Email address.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      showToast("Please enter a valid email format (e.g. name@domain.com).", "error");
      return;
    }

    if (user?.email && user.email.toLowerCase() === normalizedEmail) {
      showToast("New Login ID is identical to your current Login ID.", "error");
      return;
    }

    if (!idConfirmPassword) {
      showToast("Please enter your current password to authorize this ID change.", "error");
      return;
    }

    setIsChangingId(true);
    try {
      const res = await authService.changeEmail(normalizedEmail, idConfirmPassword);
      if (res.success) {
        showToast(
          `Login ID successfully changed to ${normalizedEmail}! Logging out now...`,
          "success"
        );
        setShowChangeIdModal(false);
        // Immediate logout on frontend and redirect to login page
        await logout();
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Change ID error:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to update Login ID. Please verify your current password.";
      showToast(errMsg, "error");
    } finally {
      setIsChangingId(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-3">
        <Loader2 className="w-10 h-10 text-[#0a6cf0] animate-spin" />
        <span className="font-bold text-slate-800 text-sm">Loading User Profile...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      <Breadcrumb items={[{ label: "User Account", path: "/dashboard" }, { label: "My Profile" }]} />

      {/* =========================================================================
          HERO PROFILE BANNER
      ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={formData.avatar}
            alt={formData.name || "User Avatar"}
            onClick={() => setShowPhotoModal(true)}
            title="Click to view full photo"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-[#e8f2fe] shadow-lg shadow-blue-500/10 group-hover:brightness-95 transition-all cursor-pointer hover:scale-102"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload profile photo"
            aria-label="Upload profile photo"
            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-gradient-to-br from-[#0a6cf0] to-[#0095ff] text-white flex items-center justify-center shadow-md shadow-blue-500/20 border-2 border-white hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#e8f2fe] text-[#0a6cf0] border border-blue-200/60 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" /> Authenticated Hospital Staff
            </span>
            <Badge variant="primary">
              {formData.role}
            </Badge>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {formData.name || "Authenticated User"}
          </h1>

          <p className="text-xs text-slate-500 font-medium">
            <span>{formData.department}</span> • <span>{formData.email}</span>
            {formData.phone && <span> • <strong className="font-mono text-slate-700">{formData.phone}</strong></span>}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-[#0a6cf0]" /> Change Photo
            </button>
            <Link
              to="/change-password"
              className="text-xs font-bold text-[#0a6cf0] hover:underline flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" /> Change Password
            </Link>
            <button
              type="button"
              onClick={() => {
                setNewEmailInput("");
                setIdConfirmPassword("");
                setShowChangeIdModal(true);
              }}
              className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Change Login ID
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PROFILE EDIT FORM
      ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col gap-6">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">Professional Profile Information</h2>
            <p className="text-xs text-slate-500">Update your personal contact & clinical department affiliation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <Input
              label="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              icon={User}
              placeholder="e.g. Dr. Rajesh Sharma"
              required
            />

            {/* Email Address (Login ID) with Change Option */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Login ID / Email Address
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNewEmailInput("");
                    setIdConfirmPassword("");
                    setShowChangeIdModal(true);
                  }}
                  className="text-[11px] font-bold text-[#0a6cf0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3 h-3" /> Change ID
                </button>
              </div>
              <Input
                type="email"
                value={formData.email}
                readOnly
                disabled
                icon={Mail}
                className="bg-slate-100/90 text-slate-600 font-mono font-medium cursor-not-allowed"
                rightElement={
                  <button
                    type="button"
                    onClick={() => {
                      setNewEmailInput("");
                      setIdConfirmPassword("");
                      setShowChangeIdModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-[#0a6cf0] hover:bg-blue-50 shadow-xs cursor-pointer transition-colors"
                  >
                    Change ID
                  </button>
                }
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Changing your ID will immediately log you out. Re-login with new ID required.
              </span>
            </div>

            {/* Phone Number (Strict 10 digits starting with 6,7,8,9) */}
            <div>
              <Input
                label="Mobile Phone Number"
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, phone: val });
                }}
                icon={Phone}
                placeholder="e.g. 9876543210 (10 digits)"
              />
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                10 numeric digits starting with 6, 7, 8, or 9
              </span>
            </div>

            {/* Department */}
            <Input
              label="Hospital Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              icon={Building2}
              placeholder="e.g. Cardiology"
            />

            {/* Designation / Role (Read only) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Designation / Access Level
              </label>
              <input
                type="text"
                value="HOSPITAL ADMINISTRATOR"
                disabled
                readOnly
                className="w-full bg-slate-100/90 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-600 font-bold cursor-not-allowed outline-none uppercase"
              />
            </div>

            {/* Profile Photo File Upload Field */}
            <div className="sm:col-span-2 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-800">
                    Profile Photo / Avatar Image
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Upload an image file from your device (PNG, JPG, JPEG, WEBP — Max 5MB)
                  </p>
                </div>
                {selectedFileName && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> New File Ready
                  </span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="profile-avatar-file-input"
              />

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-sm">
                <img
                  src={formData.avatar}
                  alt="Avatar Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#e8f2fe] shadow-sm flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop";
                  }}
                />

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {selectedFileName ? selectedFileName : "Active Profile Photo"}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {selectedFileName 
                      ? "File selected! Click 'Save Profile Changes' below to persist." 
                      : "Click 'Choose Image File' to select a photo from your computer."}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <label
                    htmlFor="profile-avatar-file-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#e8f2fe] text-[#0a6cf0] hover:bg-blue-100 transition-colors border border-blue-200/60"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Choose Image File
                  </label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={handleRemovePhoto}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              icon={isSubmitting ? Loader2 : Save}
              disabled={isSubmitting}
              className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20 px-6"
            >
              {isSubmitting ? "Saving Profile..." : "Save Profile Changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* =========================================================================
          CHANGE LOGIN ID MODAL (TURANT LOGOUT ON SUCCESS)
      ========================================================================= */}
      {showChangeIdModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative animate-scale-in flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Change System Login ID</h3>
                  <p className="text-xs text-slate-500">Update the email address used to log into this system</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChangeIdModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Immediate Logout Warning Banner */}
            <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <strong className="font-bold text-amber-950">Security Rule: Immediate Logout</strong>
                <p className="leading-relaxed text-amber-800">
                  Jaise hi aap apna <strong>Login ID</strong> change karenge, aap turant <strong>logout</strong> ho jayenge.
                  Uske baad aapko apne <strong>New Login ID</strong> se dobara login karna hoga.
                </p>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleChangeIdSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Current Login ID (Read-only)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-500 font-mono cursor-not-allowed outline-none"
                />
              </div>

              <Input
                label="New Login ID (Email) *"
                type="email"
                placeholder="e.g. new.admin@hospital.com"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                icon={Mail}
                required
              />

              <Input
                label="Confirm with Current Password *"
                type={showIdConfirmPassword ? "text" : "password"}
                placeholder="Enter your current password to authorize"
                value={idConfirmPassword}
                onChange={(e) => setIdConfirmPassword(e.target.value)}
                icon={Lock}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowIdConfirmPassword(!showIdConfirmPassword)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showIdConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showIdConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowChangeIdModal(false)}
                  disabled={isChangingId}
                  className="text-xs text-slate-600 cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  icon={isChangingId ? Loader2 : LogOut}
                  disabled={isChangingId}
                  className="cursor-pointer bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-md shadow-rose-500/20 text-xs px-5"
                >
                  {isChangingId ? "Changing & Logging Out..." : "Change ID & Logout Immediately"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Admin Full Photo Modal */}
      <AdminPhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        src={formData.avatar}
        name={formData.name || user?.name || "Admin"}
        role={formData.role || user?.role || "Hospital Administrator"}
        email={formData.email || user?.email}
      />
    </div>
  );
};

export default MyProfile;
