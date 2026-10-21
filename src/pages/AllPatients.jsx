import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar,
  Loader2,
  RefreshCw,
  X,
  Copy,
  Check,
  Printer,
  Download,
  Phone,
  Building2,
  BedDouble,
  Activity,
  History,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown
} from "lucide-react";
import { patientService } from "../services/patientService";
import reportService from "../services/reportService";
import { useToast } from "../hooks/useToast";
import { Badge } from "../components/ui/Badge";
import { Button, actionBtnStyles, actionBadgeBtnStyles } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { getPatientStatus } from "../utils/helpers";

export const AllPatients = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [wardFilter, setWardFilter] = useState("All");

  // Server-side Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // UI state
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedCrNo, setCopiedCrNo] = useState(null);

  // Quick Status change candidate state
  const [statusChangeCandidate, setStatusChangeCandidate] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState("Admitted");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Dynamic options fetched directly from patient collection
  const [filterOptions, setFilterOptions] = useState({
    doctors: [],
    departments: [],
    wards: [],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await patientService.getFilterOptions();
        if (res.success && res.data) {
          setFilterOptions(res.data);
        }
      } catch (err) {
        console.error("Failed to load patient dynamic filter options in AllPatients:", err);
      }
    };
    fetchOptions();
  }, []);

  // Quick KPI metrics from directory results
  const [stats, setStats] = useState({
    total: 0,
    admitted: 0,
    underTreatment: 0,
    discharged: 0,
  });

  // Debounce search term by 350ms
  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Patients from MongoDB Backend
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await patientService.getPatients({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch.trim(),
        status: statusFilter !== "All" ? statusFilter : undefined,
        doctor: doctorFilter !== "All" ? doctorFilter : undefined,
        department: departmentFilter !== "All" ? departmentFilter : undefined,
        ward: wardFilter !== "All" ? wardFilter : undefined,
      });

      if (response.success && response.data) {
        const patientList = response.data.patients || [];
        setPatients(patientList);
        const pag = response.data.pagination || {};
        const total = pag.total || patientList.length;
        setTotalPatients(total);
        setTotalPages(pag.totalPages || 1);

        // Calculate KPI summary consistently using getPatientStatus
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
          total,
          admitted: admittedCount,
          discharged: dischargedCount,
          underTreatment: underTreatmentCount,
        });
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      showToast("Failed to load patient records from database", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, doctorFilter, departmentFilter, wardFilter, showToast]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle Delete Patient
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const response = await patientService.deletePatient(deleteCandidate._id || deleteCandidate.id);
      if (response.success) {
        showToast(`Patient record ${deleteCandidate.crNo} deleted successfully`, "success");
        setDeleteCandidate(null);
        fetchPatients();
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete patient record", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Quick Status Change
  const handleQuickStatusSubmit = async () => {
    if (!statusChangeCandidate) return;
    setIsUpdatingStatus(true);
    try {
      const patId = statusChangeCandidate._id || statusChangeCandidate.id;
      const response = await patientService.updatePatient(patId, {
        status: selectedNewStatus,
        statusOnDischarge: selectedNewStatus,
      });

      if (response.success) {
        showToast(`Status updated to "${selectedNewStatus}" for ${statusChangeCandidate.crNo}`, "success");
        setStatusChangeCandidate(null);
        fetchPatients();
      }
    } catch (err) {
      console.error("Status update error:", err);
      showToast("Failed to update patient status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Copy CR Number
  const handleCopyCrNo = (cr) => {
    navigator.clipboard.writeText(cr);
    setCopiedCrNo(cr);
    showToast(`CR Number ${cr} copied!`, "success");
    setTimeout(() => setCopiedCrNo(null), 2000);
  };

  // Export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await reportService.exportReportCSV("patients", {
        search: debouncedSearch,
        status: statusFilter,
        doctor: doctorFilter,
        department: departmentFilter,
        ward: wardFilter,
      });
      showToast("Patient directory exported to CSV!", "success");
    } catch (err) {
      console.error("CSV Export error:", err);
      showToast("Failed to export patient records", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setDoctorFilter("All");
    setDepartmentFilter("All");
    setWardFilter("All");
    setCurrentPage(1);
    setShowFilterDrawer(false);
  };

  const activeFiltersCount = [
    statusFilter !== "All",
    doctorFilter !== "All",
    departmentFilter !== "All",
    wardFilter !== "All",
    searchTerm.trim().length > 0,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* =========================================================================
          PRINT ONLY HEADER (FOR DIRECTORY ROSTER)
      ========================================================================= */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-900 text-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Patient Directory & Clinical Registry</h1>
            <p className="text-xs text-slate-600 font-medium">DigiCoders Hospital Network • Master Inpatient/Outpatient Registry</p>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold block">Generated: {new Date().toLocaleDateString("en-IN")}</span>
            <span className="text-slate-600">Total Records: {totalPatients}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PAGE HEADER (MODULE 6 / PROPOSAL POINT 30)
      ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e8f2fe] text-[#0a6cf0] border border-blue-200/60">
              <Sparkles className="w-3 h-3" /> Module 6: Proposal Point 30
            </span>
            <span className="text-xs text-slate-400 font-mono">Master Clinical Registry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#0a6cf0]" />
            All Patients Directory & Data Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time MongoDB patient repository with server pagination, quick status changes, soft archiving, and CSV export.
          </p>
        </div>

        {/* Global Header Actions */}
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
            onClick={() => window.print()}
            className="cursor-pointer"
          >
            Print Registry
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchPatients}
            title="Refresh database records"
            className="cursor-pointer"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => navigate("/patients/register")}
            className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20"
          >
            Register Patient
          </Button>
        </div>
      </div>

      {/* =========================================================================
          KEY CLINICAL SUMMARY METRICS
      ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 print:hidden">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Directory</span>
            <span className="text-2xl font-black text-slate-900">{totalPatients}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a6cf0] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Inpatient (Admitted)</span>
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
          FILTER & SEARCH CONTROLS CARD
      ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col gap-3.5 print:hidden">
        {/* ROW 1: SEARCH BAR + CONTROLS */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="w-full lg:flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by CR No., Name, Phone, Ward..."
              className="w-full bg-slate-50/90 hover:bg-slate-50 focus:bg-white border border-slate-200/80 text-slate-900 text-xs sm:text-sm rounded-xl pl-10 pr-9 py-2.5 focus:border-[#0a6cf0] focus:ring-3 focus:ring-blue-500/15 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {isSearching && (
              <span className="absolute right-9 top-1/2 -translate-y-1/2 text-[10px] text-[#0a6cf0] font-bold flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            {/* Quick Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200/90 text-xs font-semibold rounded-xl px-3.5 py-2.5 text-slate-700 outline-none hover:bg-slate-100 transition-all cursor-pointer"
            >
              <option value="All">Status: All Patients</option>
              <option value="Admitted">Status: Admitted</option>
              <option value="Under Treatment">Status: Under Treatment</option>
              <option value="Discharged">Status: Discharged</option>
              <option value="Pending">Status: Pending</option>
            </select>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-medium text-slate-600">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Advanced Filters Button */}
            <button
              type="button"
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                showFilterDrawer
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0a6cf0]" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-[#0a6cf0] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ROW 2: STATUS QUICK PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Quick Status:
          </span>
          {[
            { id: "All", label: "All Patients" },
            { id: "Admitted", label: "Admitted" },
            { id: "Under Treatment", label: "Under Treatment" },
            { id: "Discharged", label: "Discharged" },
            { id: "Pending", label: "Pending" },
          ].map((pill) => {
            const isSelected = statusFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  setStatusFilter(pill.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-[#0a6cf0] text-white shadow-xs shadow-blue-500/25 scale-[1.02]"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* ROW 3: COLLAPSIBLE ADVANCED FILTER DRAWER */}
        {showFilterDrawer && (
          <div className="p-4 rounded-2xl bg-[#f0f6fe]/40 border border-blue-100/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fade-in">
            {/* Doctor Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Attending Doctor
              </label>
              <select
                value={doctorFilter}
                onChange={(e) => {
                  setDoctorFilter(e.target.value);
                  setCurrentPage(1);
                }}
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

            {/* Department Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
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

            {/* Ward Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Ward Category
              </label>
              <select
                value={wardFilter}
                onChange={(e) => {
                  setWardFilter(e.target.value);
                  setCurrentPage(1);
                }}
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

            {/* Reset Actions */}
            <div className="flex items-end gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1 bg-gradient-to-r from-[#0a6cf0] to-[#0095ff]"
                onClick={() => fetchPatients()}
              >
                Apply Criteria
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearAllFilters}
                className="cursor-pointer"
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          PATIENTS DATA TABLE (DESKTOP) & CARDS (MOBILE)
      ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_14px_rgba(10,80,180,0.04)] overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              Active Patient Directory
            </h2>
            <Badge variant="primary" size="sm">
              {totalPatients} Record{totalPatients !== 1 ? "s" : ""}
            </Badge>
          </div>

          <span className="text-xs font-semibold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60 font-sans hidden sm:inline-block">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#0a6cf0] animate-spin" />
            <span className="font-bold text-slate-700">Loading Patient Master Directory...</span>
            <span className="text-[11px] text-slate-400">Querying MongoDB repository</span>
          </div>
        ) : patients.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0a6cf0] flex items-center justify-center font-bold mb-1">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-900">No Patient Records in View</h3>
            <p className="text-slate-500 max-w-md text-xs">
              No patients match your current filter parameters or search keyword. Try clearing some criteria or add a new patient.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={clearAllFilters}
              className="cursor-pointer mt-2"
            >
              Clear All Filters
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
                    <th className="p-3.5 whitespace-nowrap">Contact / City</th>
                    <th className="p-3.5 whitespace-nowrap">Ward & Bed</th>
                    <th className="p-3.5 whitespace-nowrap">Doctor & Dept</th>
                    <th className="p-3.5 whitespace-nowrap">Admission Date</th>
                    <th className="p-3.5 whitespace-nowrap">Status</th>
                    <th className="p-3.5 text-right pr-6 print:hidden whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {patients.map((patient) => {
                    const patId = patient._id || patient.id;
                    const name = patient.personalDetails?.name || patient.personal?.patientName || "N/A";
                    const age = patient.personalDetails?.age || patient.personal?.age || "--";
                    const gender = patient.personalDetails?.gender || patient.personal?.gender || "--";
                    const guardian = patient.personalDetails?.fatherGuardianName || "";
                    const mobile = patient.contactDetails?.mobile || patient.contact?.mobile || "N/A";
                    const city = patient.contactDetails?.city || "Lucknow";
                    const ward = patient.wardDetails?.ward || "General Ward";
                    const bed = patient.wardDetails?.bedNumber || "Unassigned";
                    const doctor = patient.doctorDetails?.doctorName || patient.hospital?.doctor || "Assigned Doctor";
                    const dept = patient.doctorDetails?.departmentName || "General";
                    const admissionDate = patient.admissionDetails?.admissionDate ||
                      (patient.createdAt ? new Date(patient.createdAt).toLocaleDateString("en-IN") : "--");
                    const status = getPatientStatus(patient);

                    const isAdmitted = status === "Admitted";
                    const isDischarged = status === "Discharged";

                    return (
                      <tr key={patId} className="hover:bg-blue-50/30 transition-colors">
                        {/* CR Number & IP Number */}
                        <td className="p-3.5 pl-6 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/80 border border-blue-200/70 font-mono font-bold text-xs text-[#0a6cf0] tracking-tight">
                              <span>{patient.crNo}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCrNo(patient.crNo)}
                                title="Copy CR Number"
                                className="p-1 rounded-lg text-slate-400 hover:text-[#0a6cf0] hover:bg-blue-100/50 transition-colors cursor-pointer print:hidden"
                              >
                                {copiedCrNo === patient.crNo ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {(patient.ipNo || patient.hospitalDetails?.ipNumber) && (
                              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                                IP: {patient.ipNo || patient.hospitalDetails?.ipNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Patient Name & Demographics */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#0a6cf0] to-[#0095ff] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-blue-500/20 border border-white/60">
                              {name ? name.charAt(0).toUpperCase() : "P"}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/patients/${patId}`}
                                className="font-bold text-[13px] text-slate-900 hover:text-[#0a6cf0] transition-colors block truncate max-w-[170px]"
                              >
                                {name}
                              </Link>
                              <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[170px]">
                                {age} Yrs • {gender} {guardian ? `• S/O ${guardian}` : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact & City */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold text-slate-800 block">
                            {mobile}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[140px]">
                            {city}
                          </span>
                        </td>

                        {/* Ward & Bed */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-semibold text-xs text-slate-800 block truncate max-w-[160px]">
                            {ward}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            Bed: {bed}
                          </span>
                        </td>

                        {/* Doctor & Dept */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-bold text-xs text-slate-800 block truncate max-w-[160px]">
                            {doctor}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block">
                            {dept}
                          </span>
                        </td>

                        {/* Admission Date */}
                        <td className="p-3.5 font-mono text-xs text-slate-700 whitespace-nowrap">
                          {admissionDate}
                        </td>

                        {/* Status with Click to Change */}
                        <td className="p-3.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusChangeCandidate(patient);
                              setSelectedNewStatus(status);
                            }}
                            title="Click to quickly change patient status"
                            className="cursor-pointer group flex items-center gap-1 hover:opacity-90 transition-opacity"
                          >
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
                          </button>
                        </td>

                        {/* Actions Toolbar in Sleek Dock */}
                        <td className="p-3.5 text-right pr-6 print:hidden whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-50/90 rounded-xl border border-slate-200/70 shadow-2xs">
                            <Link
                              to={`/patients/${patId}`}
                              title="View Clinical Dossier"
                              className={actionBtnStyles.view}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/patients/${patId}/edit`}
                              title="Edit Patient Record"
                              className={actionBtnStyles.edit}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/patients/${patId}/history`}
                              title="View Visits Timeline"
                              className={actionBtnStyles.history}
                            >
                              <History className="w-4 h-4" />
                            </Link>

                            <a
                              href={reportService.getPatientPdfUrl(patId)}
                              target="_blank"
                              rel="noreferrer"
                              title="Print / Download PDF Case Sheet"
                              className={actionBtnStyles.print}
                            >
                              <Printer className="w-4 h-4" />
                            </a>

                            <button
                              type="button"
                              onClick={() => setDeleteCandidate(patient)}
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

            {/* MOBILE CARD VIEW (VISIBLE ON < MD SCREENS) */}
            <div className="md:hidden divide-y divide-slate-100">
              {patients.map((patient) => {
                const patId = patient._id || patient.id;
                const name = patient.personalDetails?.name || patient.personal?.patientName || "N/A";
                const age = patient.personalDetails?.age || patient.personal?.age || "--";
                const gender = patient.personalDetails?.gender || patient.personal?.gender || "--";
                const mobile = patient.contactDetails?.mobile || patient.contact?.mobile || "N/A";
                const ward = patient.wardDetails?.ward || "General";
                const bed = patient.wardDetails?.bedNumber || "N/A";
                const doctor = patient.doctorDetails?.doctorName || "Assigned";
                const status = patient.status || patient.statusOnDischarge || "Admitted";

                return (
                  <div key={patId} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a6cf0] to-[#0095ff] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {name ? name.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div>
                          <Link
                            to={`/patients/${patId}`}
                            className="font-bold text-slate-900 text-sm hover:text-[#0a6cf0] block"
                          >
                            {name}
                          </Link>
                          <span className="text-xs text-slate-500">
                            {age} Yrs • {gender}
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
                        <span className="font-mono font-bold text-[#0a6cf0]">{patient.crNo}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile Phone</span>
                        <span className="font-mono font-semibold text-slate-800">{mobile}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Ward / Bed</span>
                        <span className="text-slate-800 font-medium">
                          {ward} ({bed})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Doctor</span>
                        <span className="text-slate-800 font-medium truncate block">{doctor}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Link
                        to={`/patients/${patId}`}
                        className={actionBadgeBtnStyles.view}
                      >
                        <Eye className="w-3.5 h-3.5" /> Dossier
                      </Link>
                      <Link
                        to={`/patients/${patId}/edit`}
                        className={actionBadgeBtnStyles.edit}
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <a
                        href={reportService.getPatientPdfUrl(patId)}
                        target="_blank"
                        rel="noreferrer"
                        className={actionBadgeBtnStyles.print}
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(patient)}
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
        {!loading && totalPages > 1 && (
          <div className="p-4 sm:p-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
            <span className="text-slate-500 font-medium">
              Showing Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of{" "}
              <strong className="text-slate-900 font-bold">{totalPages}</strong> (
              {totalPatients} Total Records)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Chips */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                const isActive = currentPage === pageNum;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
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
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          QUICK STATUS CHANGE MODAL
      ========================================================================= */}
      {statusChangeCandidate && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 flex flex-col gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Patient Status Update
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {statusChangeCandidate.personalDetails?.name || statusChangeCandidate.crNo}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">CR: {statusChangeCandidate.crNo}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Select New Clinical Status</label>
              <select
                value={selectedNewStatus}
                onChange={(e) => setSelectedNewStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0a6cf0]"
              >
                <option value="Admitted">Admitted (Active Inpatient)</option>
                <option value="Under Treatment">Under Treatment (Ongoing Clinical Protocol)</option>
                <option value="Discharged">Discharged (Discharge Protocol Complete)</option>
                <option value="Pending">Pending (Awaiting Evaluation)</option>
                <option value="Transferred">Transferred (Speciality Ward/Hospital)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStatusChangeCandidate(null)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleQuickStatusSubmit}
                disabled={isUpdatingStatus}
                className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff]"
              >
                {isUpdatingStatus ? "Updating..." : "Save Status"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PERMANENT DELETE PATIENT CONFIRMATION MODAL
      ========================================================================= */}
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

export default AllPatients;
