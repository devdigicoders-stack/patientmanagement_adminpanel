import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, 
  Search, 
  Calendar, 
  User, 
  Stethoscope, 
  ChevronRight,
  ChevronDown,
  Lock,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import reportService from "../services/reportService";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

export const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
      setShowProfileDropdown(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const defaultAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop";
  const userAvatar = user?.avatar || defaultAvatar;
  const userName = user?.name || "Dr. Rajesh Kumar";

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Debounced Global Search Handler
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await reportService.getGlobalSearch(searchQuery.trim());
        if (res.success) {
          setSearchResults(res.data);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/patients/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-20 bg-[#f0f6fe] border-b border-blue-200/60 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
      {/* Left: Mobile Toggle & Pill Search Box matching screenshot */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-full border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSearchDropdown(true)}
              placeholder="Search patients, CR number, or visit number..."
              className="w-full bg-white/95 backdrop-blur-sm border border-slate-200/90 text-xs sm:text-sm text-slate-900 rounded-full pl-11 pr-4 py-2.5 outline-none focus:border-[#0a6cf0] focus:ring-4 focus:ring-blue-500/10 transition-all shadow-[0_2px_8px_rgba(10,80,180,0.04)] placeholder:text-slate-400"
            />
            {isSearching && (
              <span className="absolute right-4 w-4 h-4 border-2 border-[#0a6cf0] border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchResults && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in max-h-96 overflow-y-auto">
              {searchResults.patients?.length > 0 && (
                <div className="p-2 border-b border-slate-100">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-sky-700 uppercase flex items-center gap-1">
                    <User className="w-3 h-3" /> Patients
                  </div>
                  {searchResults.patients.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        navigate(`/patients/${p._id}`);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 flex items-center justify-between text-xs text-slate-800 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{p.personalDetails?.name}</span>
                        <span className="ml-2 font-mono text-[11px] text-sky-600">CR: {p.crNo}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {p.doctorDetails?.departmentName || "General"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.visits?.length > 0 && (
                <div className="p-2 border-b border-slate-100">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-purple-700 uppercase flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" /> Visits
                  </div>
                  {searchResults.visits.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        navigate(v.patientId ? `/patients/${v.patientId._id}` : "/medical-history");
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50 flex items-center justify-between text-xs text-slate-800 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900">Visit #{v.visitNumber} ({v.visitType})</span>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{v.diagnosis || "Consultation"}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">{v.doctorName || ""}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.patients?.length === 0 &&
                searchResults.visits?.length === 0 && (
                  <p className="p-4 text-center text-xs text-slate-500">No matching records found.</p>
                )}

              <button
                onClick={() => {
                  setShowSearchDropdown(false);
                  navigate(`/patients/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-center text-xs font-bold text-[#0a6cf0] flex items-center justify-center gap-1"
              >
                <span>View All Results in Advanced Search</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: User Avatar Dropdown & Date Pill */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Profile Dropdown Container */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setShowProfileDropdown((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-blue-100/70 focus:outline-none transition-all cursor-pointer group"
            title="Admin Menu (Profile & Logout)"
            aria-expanded={showProfileDropdown}
          >
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs group-hover:scale-105 group-hover:ring-2 group-hover:ring-[#0a6cf0] transition-all"
            />
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 hidden sm:block ${
                showProfileDropdown ? "rotate-180 text-[#0a6cf0]" : ""
              }`}
            />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fade-in">
              {/* User Info Header */}
              <div className="px-4 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div className="flex flex-col truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || "admin@hospital.com"}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#0a6cf0] border border-blue-200/60">
                    {user?.role || "Hospital Administrator"}
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0a6cf0] rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500 group-hover:text-[#0a6cf0]" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/change-password"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0a6cf0] rounded-xl transition-colors"
                >
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Change Password</span>
                </Link>
              </div>

              {/* Logout Option */}
              <div className="p-1.5 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date Pill matching screenshot (Calendar icon + Mon, 10 Oct 2026) */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#e8f2fe] text-[#0a6cf0] text-xs font-bold border border-blue-200/60 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-[#0a6cf0]" strokeWidth={2.4} />
          <span>{formattedDate}</span>
        </div>

        {/* Logout Confirmation Dialog */}
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
      </div>
    </header>
  );
};

export default Topbar;
