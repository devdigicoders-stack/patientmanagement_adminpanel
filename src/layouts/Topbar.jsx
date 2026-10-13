import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, 
  Search, 
  Calendar, 
  User, 
  Stethoscope, 
  ChevronRight 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import reportService from "../services/reportService";

export const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

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

      {/* Right: User Avatar & Date Pill matching screenshot */}
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* User Profile Avatar Link */}
        <Link to="/profile" className="flex items-center cursor-pointer">
          <img
            src={userAvatar}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs hover:scale-105 transition-transform"
          />
        </Link>

        {/* Date Pill matching screenshot (Calendar icon + Mon, 10 Oct 2026) */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#e8f2fe] text-[#0a6cf0] text-xs font-bold border border-blue-200/60 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-[#0a6cf0]" strokeWidth={2.4} />
          <span>{formattedDate}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
