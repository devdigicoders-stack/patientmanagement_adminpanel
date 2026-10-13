import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Search, 
  User, 
  Lock, 
  LogOut, 
  Hospital, 
  X,
  ChevronLeft,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

export const Sidebar = ({ isOpen, onClose, isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const defaultAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop";
  const userAvatar = user?.avatar || defaultAvatar;
  const userName = user?.name || "Administrator";

  // Precise route active checker to prevent multiple simultaneous active items
  const checkIsActive = (path) => {
    // 1. Patients Directory - active on /patients and /patients/:id but NOT /patients/register or /patients/search
    if (path === "/patients") {
      return (
        location.pathname === "/patients" ||
        (location.pathname.startsWith("/patients/") &&
          !location.pathname.startsWith("/patients/register") &&
          !location.pathname.startsWith("/patients/search"))
      );
    }
    if (path === "/patients/register") {
      return location.pathname === "/patients/register";
    }
    if (path === "/patients/search") {
      return location.pathname === "/patients/search";
    }
    // 2. Reports Hub - active on /reports and all sub-reports (/reports/opd, /reports/ipd, etc.)
    if (path === "/reports") {
      return location.pathname.startsWith("/reports");
    }
    return location.pathname === path;
  };

  const mainNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/patients/register", label: "Register Patient", icon: UserPlus },
    { path: "/patients", label: "All Patients", icon: Users },
    { path: "/patients/search", label: "Patient Search", icon: Search },
    { path: "/reports", label: "Reports Hub", icon: FileText },
    { path: "/profile", label: "My Profile", icon: User },
    { path: "/change-password", label: "Change Password", icon: Lock },
  ];

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-40 lg:hidden animate-fade-in"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-slate-900/85 backdrop-blur-xl text-slate-300 flex flex-col border-r border-white/10 shadow-2xl transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"} w-72`}
      >
        {/* Scrollbar killer style */}
        <style>{`
          aside *::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          aside * {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
        `}</style>

        {/* Sidebar Header / Logo (h-20 matches Topbar height exactly for a seamless horizontal line) */}
        <div className={`h-20 flex items-center border-b border-white/10 bg-white/5 shrink-0 transition-all ${
          isCollapsed ? "px-2.5 justify-between" : "px-4.5 justify-between"
        }`}>
          {isCollapsed ? (
            <div className="w-full flex items-center justify-between">
              <div 
                title="Patient Record System"
                className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-sky-500/30 to-cyan-500/20 text-sky-400 border border-sky-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/10"
              >
                <Hospital className="w-4.5 h-4.5 shrink-0" />
              </div>
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Expand Sidebar"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/30 to-cyan-500/20 text-sky-400 border border-sky-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/10">
                  <Hospital className="w-4.5 h-4.5 shrink-0" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-white text-sm sm:text-base tracking-tight leading-tight">
                    Patient <span className="text-sky-400">Record System</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    Management System
                  </span>
                </div>
              </div>
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav (Scrollbar Hidden & Perfectly Centered in Collapsed Mode) */}
        <nav 
          className={`flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1 ${
            isCollapsed ? "px-2 py-3" : "px-3 py-2.5"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Main Menu
            </span>
          )}

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = checkIsActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={isCollapsed ? item.label : undefined}
                className={
                  `flex items-center ${
                    isCollapsed ? "justify-center py-2.5 px-0" : "gap-3 px-3 py-2"
                  } rounded-xl font-semibold text-xs sm:text-[13px] transition-all duration-200 group relative ${
                    active
                      ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-600/30 border border-white/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/10"
                  }`
                }
              >
                <Icon className={`${isCollapsed ? "w-5 h-5" : "w-4.5 h-4.5"} shrink-0`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}

        </nav>

        {/* User Card & Logout */}
        <div className={`border-t border-white/10 bg-black/20 shrink-0 ${
          isCollapsed ? "p-2" : "p-2.5"
        }`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-9 h-9 rounded-full object-cover border border-sky-400/40 shrink-0 shadow-sm"
                />
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-white truncate">{userName}</span>
                  <span className="text-[10px] text-slate-400 truncate">Hospital Administrator</span>
                </div>
              </div>

              <button
                onClick={handleLogoutClick}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <img
                src={userAvatar}
                alt={userName}
                title={`${userName} (Administrator)`}
                className="w-9 h-9 rounded-full object-cover border border-sky-400/40 shrink-0 shadow-sm cursor-pointer"
              />
              <button
                onClick={handleLogoutClick}
                title="Logout"
                className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Alert Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of the Patient Management System?"
        confirmText={isLoggingOut ? "Logging out..." : "Yes, Logout"}
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default Sidebar;
