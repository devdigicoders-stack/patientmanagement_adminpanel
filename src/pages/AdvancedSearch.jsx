import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  RotateCcw,
  Eye,
  Edit3,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Calendar,
  User,
  Phone,
  Building2,
  BedDouble,
  Stethoscope,
  HeartPulse,
  Activity,
  FileText,
  Sparkles,
  SlidersHorizontal,
  X,
  History,
  UserPlus,
  Loader2,
  ChevronDown,
  Layers,
  Users,
  Trash2
} from "lucide-react";
import reportService from "../services/reportService";
import { patientService } from "../services/patientService";
import { useToast } from "../hooks/useToast";
import { Badge } from "../components/ui/Badge";
import { Button, actionBtnStyles, actionBadgeBtnStyles } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { getPatientStatus } from "../utils/helpers";
import { NEUROSURGERY_WARDS } from "../data/clinicalMasterData";

export const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Search filter state initialized from URL query parameters
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    crNo: searchParams.get("crNo") || "",
    name: searchParams.get("name") || "",
    mobile: searchParams.get("mobile") || searchParams.get("phone") || "",
    hospitalNumber: searchParams.get("hospitalNumber") || "",
    patientNumber: searchParams.get("patientNumber") || "",
    doctor: searchParams.get("doctor") || "All",
    department: searchParams.get("department") || "All",
    diagnosis: searchParams.get("diagnosis") || "",
    ward: searchParams.get("ward") || "All",
    bed: searchParams.get("bed") || "",
    status: searchParams.get("status") || "All",
    fromDate: searchParams.get("fromDate") || "",
    toDate: searchParams.get("toDate") || "",
    dateType: searchParams.get("dateType") || "created",
  });

  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [copiedCrNo, setCopiedCrNo] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic options fetched directly from patient collection
  const [filterOptions, setFilterOptions] = useState({
    doctors: [],
    departments: [],
    wards: NEUROSURGERY_WARDS,
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await patientService.getFilterOptions();
        if (res.success && res.data) {
          setFilterOptions({
            ...res.data,
            wards: NEUROSURGERY_WARDS,
          });
        }
      } catch (err) {
        console.error("Failed to load patient dynamic filter options:", err);
      }
    };
    fetchOptions();
  }, []);

  // Query Backend via reportService
  // Query Backend via reportService with explicit filters parameter
  const executeSearch = useCallback(async (currentFilters = filters, pageToFetch = 1) => {
    setLoading(true);
    try {
      const activeParams = { 
        page: pageToFetch, 
        limit: pagination.limit || 10 
      };

      const urlParams = {};
      Object.entries(currentFilters).forEach(([key, val]) => {
        if (val && val !== "All") {
          activeParams[key] = val;
          urlParams[key] = val;
        }
      });

      setSearchParams(urlParams);

      const res = await reportService.getAdvancedSearch(activeParams);
      if (res.success && res.data) {
        const patientList = res.data.patients || [];
        setPatients(patientList);
        const pag = res.data.pagination || { page: pageToFetch, limit: pagination.limit || 10, total: 0, totalPages: 1 };
        setPagination(pag);

        // Compute quick stats consistently using getPatientStatus
        const admittedCount = patientList.filter(
          (p) => getPatientStatus(p) === "Admitted"
        ).length;
        const dischargedCount = patientList.filter(
          (p) => getPatientStatus(p) === "Discharged"
        ).length;
        const underTreatmentCount = patientList.filter(
          (p) => getPatientStatus(p) === "Under Treatment"
        ).length;

        setStats({
          total: pag.total || patientList.length,
          admitted: admittedCount,
          discharged: dischargedCount,
          underTreatment: underTreatmentCount,
        });
      }
    } catch (err) {
      console.error("Advanced search error:", err);
      showToast("Error retrieving patient records", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, setSearchParams, showToast]);

  // Initial load on mount
  useEffect(() => {
    executeSearch(filters, 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Input Changes with strict Indian mobile formatting
  const handleInputChange = (field, value) => {
    if (field === "mobile") {
      // Strip non-digits and cap at 10 digits
      const sanitized = value.replace(/\D/g, "").slice(0, 10);
      setFilters((prev) => ({ ...prev, [field]: sanitized }));
      return;
    }
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Submit Search & sync URL params
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    executeSearch(filters, 1);
  };

  // Immediate Quick Status Pill Click handler
  const handleQuickStatusClick = (statusId) => {
    const nextFilters = { ...filters, status: statusId };
    setFilters(nextFilters);
    executeSearch(nextFilters, 1);
  };

  // Reset all filters to default
  const handleReset = () => {
    const emptyFilters = {
      q: "",
      crNo: "",
      name: "",
      mobile: "",
      hospitalNumber: "",
      patientNumber: "",
      doctor: "All",
      department: "All",
      diagnosis: "",
      ward: "All",
      bed: "",
      status: "All",
      fromDate: "",
      toDate: "",
      dateType: "created",
    };
    setFilters(emptyFilters);
    executeSearch(emptyFilters, 1);
  };

  // Clear a single filter chip
  const handleRemoveFilter = (key) => {
    const updated = { ...filters };
    if (["doctor", "department", "ward", "status"].includes(key)) {
      updated[key] = "All";
    } else {
      updated[key] = "";
    }
    setFilters(updated);
    executeSearch(updated, 1);
  };

  // Copy CR Number to Clipboard
  const handleCopyCrNo = (cr) => {
    navigator.clipboard.writeText(cr);
    setCopiedCrNo(cr);
    showToast(`CR Number ${cr} copied to clipboard!`, "success");
    setTimeout(() => setCopiedCrNo(null), 2000);
  };

  // Delete Patient Record
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const res = await patientService.deletePatient(deleteCandidate._id);
      if (res.success) {
        showToast(`Patient ${deleteCandidate.crNo} deleted successfully`, "success");
        setDeleteCandidate(null);
        executeSearch(filters, pagination.page);
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete patient record", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Export search results to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await reportService.exportReportCSV("patients", filters);
      showToast("Patient search roster exported successfully!", "success");
    } catch (err) {
      console.error("Export error:", err);
      showToast("Failed to export patient roster", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Quick Print Roster
  const handlePrintRoster = () => {
    window.print();
  };

  // Active filters list for chips display
  const activeFilterChips = Object.entries(filters).filter(([key, val]) => {
    if (!val || val === "All" || key === "dateType") return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* =========================================================================
          PRINT ONLY HEADER (FOR SEARCH ROSTER)
      ========================================================================= */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-900 text-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Patient Search & Clinical Registry</h1>
            <p className="text-xs text-slate-600 font-medium">DigiCoders Hospital Network • Patient Medical Dossier Records</p>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold block">Generated Date: {new Date().toLocaleDateString("en-IN")}</span>
            <span className="text-slate-600">Total Matches: {pagination.total}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PAGE HEADER & KPI METRICS (MODULE 5 / PROPOSAL POINT 26)
      ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e8f2fe] text-[#0a6cf0] border border-blue-200/60">
              <Sparkles className="w-3 h-3" /> Module 5: Proposal Point 26
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Database Search</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Search className="w-6 h-6 text-[#0a6cf0]" />
            Patient Record Search & Advanced Filter
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Query patients by CR No, Mobile Number, Name, Attending Doctor, Department, Ward, Status or Date Range.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            disabled={isExporting}
            className="cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={handlePrintRoster}
            className="cursor-pointer"
          >
            Print Roster
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => navigate("/patients/register")}
            className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20"
          >
            New Patient
          </Button>
        </div>
      </div>

      {/* =========================================================================
          KPI STATS SUMMARY ROW
      ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 print:hidden">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Found</span>
            <span className="text-2xl font-black text-slate-900">{pagination.total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a6cf0] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Admitted / Inpatient</span>
            <span className="text-2xl font-black text-rose-600">{stats.admitted}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <BedDouble className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Under Treatment</span>
            <span className="text-2xl font-black text-[#0a6cf0]">{stats.underTreatment}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0a6cf0] flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Discharged</span>
            <span className="text-2xl font-black text-emerald-600">{stats.discharged}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          PRIMARY SEARCH & FILTER FORM CARD
      ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col gap-5 print:hidden">
        {/* ROW 1: QUICK SMART SEARCH + ADVANCED FILTER TOGGLE */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => handleInputChange("q", e.target.value)}
              placeholder="Search by CR No., Patient Name, Mobile (e.g. 9876543210), Doctor or Hospital No..."
              className="w-full bg-[#f0f6fe]/70 border border-blue-200/70 text-slate-900 text-xs sm:text-sm rounded-2xl pl-10 pr-4 py-3 focus:bg-white focus:border-[#0a6cf0] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            {filters.q && (
              <button
                type="button"
                onClick={() => handleInputChange("q", "")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                showAdvancedFilters
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#0a6cf0]" />
              <span>{showAdvancedFilters ? "Hide Filters" : "Advanced Filters"}</span>
              {activeFilterChips.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#0a6cf0] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterChips.length}
                </span>
              )}
            </button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Search}
              className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20 whitespace-nowrap px-6 py-3 rounded-2xl"
            >
              Search
            </Button>
          </div>
        </form>

        {/* ROW 2: STATUS QUICK PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Quick Status:
          </span>
          {[
            { id: "All", label: "All Patients" },
            { id: "Admitted", label: "Admitted (Inpatient)" },
            { id: "Under Treatment", label: "Under Treatment" },
            { id: "Discharged", label: "Discharged" },
            { id: "Pending", label: "Pending Evaluation" },
          ].map((pill) => {
            const isSelected = filters.status === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handleQuickStatusClick(pill.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0a6cf0] text-white shadow-xs"
                    : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* ROW 3: COLLAPSIBLE ADVANCED CLINICAL FILTER PANEL */}
        {showAdvancedFilters && (
          <div className="p-5 rounded-2xl bg-[#f0f6fe]/40 border border-blue-100/80 flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#0a6cf0]" /> Comprehensive Clinical Search Parameters
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-[#0a6cf0] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset All Fields
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Field 1: CR Number */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  CR Number (Point 3)
                </label>
                <input
                  type="text"
                  value={filters.crNo}
                  onChange={(e) => handleInputChange("crNo", e.target.value)}
                  placeholder="e.g. CR-2026-00001"
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                />
              </div>

              {/* Field 2: Patient Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Patient Name (Point 5)
                </label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] focus:ring-2 focus:ring-blue-500/10 outline-none"
                />
              </div>

              {/* Field 3: Mobile Phone (Strict Indian 10 digits starting with 6,7,8,9) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Mobile Number (Point 6)
                </label>
                <input
                  type="text"
                  value={filters.mobile}
                  maxLength={10}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  placeholder="10 digits (e.g. 9876543210)"
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                />
              </div>

              {/* Field 4: Hospital Number */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Hospital File No. (Point 4)
                </label>
                <input
                  type="text"
                  value={filters.hospitalNumber}
                  onChange={(e) => handleInputChange("hospitalNumber", e.target.value)}
                  placeholder="e.g. HOSP-2026-90"
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                />
              </div>

              {/* Field 5: Attending Doctor */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Attending Doctor (Point 9)
                </label>
                <select
                  value={filters.doctor}
                  onChange={(e) => handleInputChange("doctor", e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] outline-none"
                >
                  <option value="All">All Doctors</option>
                  {filterOptions.doctors.map((doc, idx) => (
                    <option key={idx} value={doc.doctorName}>
                      {doc.doctorName} {doc.departmentName ? `(${doc.departmentName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 6: Department */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Department (Point 9)
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] outline-none"
                >
                  <option value="All">All Departments</option>
                  {filterOptions.departments.map((dept, idx) => (
                    <option key={idx} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 7: Ward Category */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Ward Category (Point 7)
                </label>
                <select
                  value={filters.ward}
                  onChange={(e) => handleInputChange("ward", e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] outline-none"
                >
                  <option value="All">All Wards</option>
                  {filterOptions.wards.map((wardName, idx) => (
                    <option key={idx} value={wardName}>
                      {wardName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 8: Bed Number */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Bed Number (Point 8)
                </label>
                <input
                  type="text"
                  value={filters.bed}
                  onChange={(e) => handleInputChange("bed", e.target.value)}
                  placeholder="e.g. Bed-14 or ICU-04"
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] outline-none font-mono"
                />
              </div>

              {/* Field 9: Diagnosis Keyword */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Diagnosis Key (Point 12)
                </label>
                <input
                  type="text"
                  value={filters.diagnosis}
                  onChange={(e) => handleInputChange("diagnosis", e.target.value)}
                  placeholder="e.g. Hypertension, Dengue"
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] outline-none"
                />
              </div>

              {/* Field 10: Date Type Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Date Basis
                </label>
                <select
                  value={filters.dateType}
                  onChange={(e) => handleInputChange("dateType", e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] outline-none"
                >
                  <option value="created">Registration Date</option>
                  <option value="admission">Admission Date (Point 10)</option>
                </select>
              </div>

              {/* Field 11: Date From */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => handleInputChange("fromDate", e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] outline-none"
                />
              </div>

              {/* Field 12: Date To */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleInputChange("toDate", e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:border-[#0a6cf0] outline-none"
                />
              </div>
            </div>

            {/* Filter action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={handleReset}
                className="cursor-pointer"
              >
                Reset All
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Search}
                onClick={() => handleSearchSubmit()}
                className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff]"
              >
                Apply Criteria
              </Button>
            </div>
          </div>
        )}

        {/* ROW 4: ACTIVE FILTER CHIPS ROW */}
        {activeFilterChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500">Active Criteria:</span>
            {activeFilterChips.map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-[#0a6cf0] border border-blue-200/60 text-xs font-medium"
              >
                <strong className="capitalize">{key}:</strong> {val}
                <button
                  type="button"
                  onClick={() => handleRemoveFilter(key)}
                  className="p-0.5 rounded-full hover:bg-blue-200/50 text-[#0a6cf0] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-600 font-bold hover:underline cursor-pointer ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          SEARCH RESULTS DATA TABLE & MOBILE CARDS
      ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_14px_rgba(10,80,180,0.04)] overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              Matched Patient Records
            </h2>
            <Badge variant="primary">
              {pagination.total} Patient{pagination.total !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Items Per Page Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-500 print:hidden">
            <span>Rows per page:</span>
            <select
              value={pagination.limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setPagination((prev) => ({ ...prev, limit: newLimit }));
                executeSearch(filters, 1);
              }}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 text-slate-700 outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#0a6cf0] animate-spin" />
            <span className="font-bold text-slate-700">Searching MongoDB Patient Registry...</span>
            <span className="text-[11px] text-slate-400">Filtering across CR No, Name, Doctor, and Wards</span>
          </div>
        ) : patients.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0a6cf0] flex items-center justify-center font-bold mb-1">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-900">No Patient Records Found</h3>
            <p className="text-slate-500 max-w-md text-xs">
              No patients matched your current search filters. Try adjusting the query, clearing some parameters or check for typos.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
              className="cursor-pointer mt-2"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <>
            {/* DESKTOP DATA TABLE (MD+ SCREENS) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="p-3.5 pl-6 whitespace-nowrap">CR Number</th>
                    <th className="p-3.5 whitespace-nowrap">Patient Details</th>
                    <th className="p-3.5 whitespace-nowrap">Contact & City</th>
                    <th className="p-3.5 whitespace-nowrap">Ward & Bed</th>
                    <th className="p-3.5 whitespace-nowrap">Doctor & Dept</th>
                    <th className="p-3.5 whitespace-nowrap">Admission Date</th>
                    <th className="p-3.5 whitespace-nowrap">Status</th>
                    <th className="p-3.5 text-right pr-6 print:hidden whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {patients.map((p) => {
                    const status = getPatientStatus(p);
                    const isAdmitted = status === "Admitted";
                    const isDischarged = status === "Discharged";

                    return (
                      <tr key={p._id} className="hover:bg-blue-50/30 transition-colors">
                        {/* CR Number & IP Number */}
                        <td className="p-3.5 pl-6 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/80 border border-blue-200/70 font-mono font-bold text-xs text-[#0a6cf0] tracking-tight">
                              <span>{p.crNo}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCrNo(p.crNo)}
                                title="Copy CR Number"
                                className="p-1 rounded-lg text-slate-400 hover:text-[#0a6cf0] hover:bg-blue-100/50 transition-colors cursor-pointer print:hidden"
                              >
                                {copiedCrNo === p.crNo ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {(p.ipNo || p.hospitalDetails?.ipNumber) && (
                              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                                IP: {p.ipNo || p.hospitalDetails?.ipNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Patient Name & Demographics */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#0a6cf0] to-[#0095ff] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-blue-500/20 border border-white/60">
                              {p.personalDetails?.name ? p.personalDetails.name.charAt(0).toUpperCase() : "P"}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/patients/${p._id}`}
                                className="font-bold text-[13px] text-slate-900 hover:text-[#0a6cf0] transition-colors block truncate max-w-[170px]"
                              >
                                {p.personalDetails?.name || "Unnamed"}
                              </Link>
                              <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[170px]">
                                {p.personalDetails?.age || "--"} Yrs • {p.personalDetails?.gender || "--"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact & City */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold text-slate-800 block">
                            {p.contactDetails?.mobile || "N/A"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[140px]">
                            {p.contactDetails?.city || "Lucknow"}, {p.contactDetails?.state || "UP"}
                          </span>
                        </td>

                        {/* Ward & Bed */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-semibold text-xs text-slate-800 block truncate max-w-[160px]">
                            {p.wardDetails?.ward || "General Ward"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            Bed: {p.wardDetails?.bedNumber || "Unassigned"}
                          </span>
                        </td>

                        {/* Doctor & Dept */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-bold text-xs text-slate-800 block truncate max-w-[160px]">
                            {p.doctorDetails?.doctorName || "Assigned Consultant"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block">
                            {p.doctorDetails?.departmentName || "General"}
                          </span>
                        </td>

                        {/* Admission Date */}
                        <td className="p-3.5 font-mono text-xs text-slate-700 whitespace-nowrap">
                          {p.admissionDetails?.admissionDate ||
                            (p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "--")}
                        </td>

                        {/* Status */}
                        <td className="p-3.5 whitespace-nowrap">
                          <Badge
                            variant={
                              isAdmitted
                                ? "danger"
                                : isDischarged
                                ? "success"
                                : status === "Under Treatment"
                                ? "primary"
                                : "warning"
                            }
                            dot
                          >
                            {status}
                          </Badge>
                        </td>

                        {/* Actions Toolbar in Sleek Dock */}
                        <td className="p-3.5 text-right pr-6 print:hidden whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-50/90 rounded-xl border border-slate-200/70 shadow-2xs">
                            <Link
                              to={`/patients/${p._id}`}
                              title="View Clinical Dossier"
                              className={actionBtnStyles.view}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/patients/${p._id}/edit`}
                              title="Edit Patient Record"
                              className={actionBtnStyles.edit}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/patients/${p._id}/history`}
                              title="View Visits Timeline"
                              className={actionBtnStyles.history}
                            >
                              <History className="w-4 h-4" />
                            </Link>
                            <a
                              href={reportService.getPatientPdfUrl(p._id)}
                              target="_blank"
                              rel="noreferrer"
                              title="Print / Download PDF Case Sheet"
                              className={actionBtnStyles.print}
                            >
                              <Printer className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => setDeleteCandidate(p)}
                              title="Delete Patient Record"
                              className={actionBtnStyles.delete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW (VISIBLE ONLY ON SMALL SCREENS < MD) */}
            <div className="md:hidden divide-y divide-slate-100">
              {patients.map((p) => {
                const status = p.status || p.statusOnDischarge || "Admitted";

                return (
                  <div key={p._id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a6cf0] to-[#0095ff] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {p.personalDetails?.name ? p.personalDetails.name.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div>
                          <Link
                            to={`/patients/${p._id}`}
                            className="font-bold text-slate-900 text-sm hover:text-[#0a6cf0] block"
                          >
                            {p.personalDetails?.name || "Unnamed"}
                          </Link>
                          <span className="text-xs text-slate-500">
                            {p.personalDetails?.age || "--"} Yrs • {p.personalDetails?.gender || "--"}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          status === "Admitted"
                            ? "danger"
                            : status === "Discharged"
                            ? "success"
                            : "primary"
                        }
                      >
                        {status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">CR Number</span>
                        <span className="font-mono font-bold text-[#0a6cf0]">{p.crNo}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile Phone</span>
                        <span className="font-mono font-semibold text-slate-800">{p.contactDetails?.mobile || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Ward / Bed</span>
                        <span className="text-slate-800 font-medium">
                          {p.wardDetails?.ward || "General"} ({p.wardDetails?.bedNumber || "N/A"})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Doctor</span>
                        <span className="text-slate-800 font-medium truncate block">
                          {p.doctorDetails?.doctorName || "Assigned"}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Link
                        to={`/patients/${p._id}`}
                        className={actionBadgeBtnStyles.view}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Dossier
                      </Link>
                      <Link
                        to={`/patients/${p._id}/edit`}
                        className={actionBadgeBtnStyles.edit}
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <a
                        href={reportService.getPatientPdfUrl(p._id)}
                        target="_blank"
                        rel="noreferrer"
                        className={actionBadgeBtnStyles.print}
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(p)}
                        className={actionBadgeBtnStyles.delete}
                        title="Delete Patient Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* =========================================================================
            PAGINATION CONTROLS
        ========================================================================= */}
        {!loading && pagination.totalPages > 1 && (
          <div className="p-4 sm:p-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
            <span className="text-slate-500 font-medium">
              Showing Page <strong className="text-slate-900 font-bold">{pagination.page}</strong> of{" "}
              <strong className="text-slate-900 font-bold">{pagination.totalPages}</strong> (
              {pagination.total} Total Records)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => executeSearch(filters, pagination.page - 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Chips */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (pagination.totalPages > 5 && pagination.page > 3) {
                  pageNum = pagination.page - 3 + i;
                  if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - (4 - i);
                }
                const isActive = pagination.page === pageNum;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => executeSearch(filters, pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0a6cf0] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => executeSearch(filters, pagination.page + 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient Record"
        message={`Are you sure you want to permanently delete patient ${deleteCandidate?.crNo} (${deleteCandidate?.personalDetails?.name})? All visits, clinical observations, and attached documents will be permanently removed.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Record"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdvancedSearch;
