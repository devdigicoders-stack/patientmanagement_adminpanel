import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Calendar,
  Users,
  UserCheck,
  Building,
  Activity,
  Clock,
  Printer,
  Download,
  Stethoscope,
  FileCheck,
  ChevronRight,
  Filter,
  Sparkles,
  BedDouble,
  HeartPulse,
  Microscope,
  ArrowRight
} from "lucide-react";
import reportService from "../../services/reportService";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export const ReportHub = () => {
  const [preset, setPreset] = useState("30days");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (preset !== "custom") params.preset = preset;
      else {
        if (fromDate) params.from = fromDate;
        if (toDate) params.to = toDate;
      }

      const res = await reportService.getDashboardAnalytics(params);
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Fetch report hub analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [preset]);

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    fetchDashboardStats();
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* =========================================================================
          PAGE HEADER (MODULE 8 / PROPOSAL POINT 30)
      ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e8f2fe] text-[#0a6cf0] border border-blue-200/60">
              <Sparkles className="w-3 h-3" /> Module 8: Proposal Point 30
            </span>
            <span className="text-xs text-slate-400 font-mono">Hospital Analytics Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#0a6cf0]" />
            Clinical & Administrative Reports Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Access specialized hospital metrics, OPD consultations, IPD occupancy, discharge summaries, follow-up logs & histopathology.
          </p>
        </div>

        {/* Date Filter Preset Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs">
          {[
            { id: "today", label: "Today" },
            { id: "7days", label: "Last 7 Days" },
            { id: "30days", label: "Last 30 Days" },
            { id: "thisMonth", label: "This Month" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPreset(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                preset === item.id
                  ? "bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          CUSTOM DATE RANGE FILTER
      ========================================================================= */}
      <form onSubmit={handleCustomDateSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0a6cf0]" />
          <span className="text-xs font-bold text-slate-800">Custom Date Evaluation Period:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPreset("custom");
            }}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 outline-none focus:bg-white focus:border-[#0a6cf0]"
          />
          <span className="text-xs text-slate-400 font-medium">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPreset("custom");
            }}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 outline-none focus:bg-white focus:border-[#0a6cf0]"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            Apply Range
          </button>
        </div>
      </form>

      {/* =========================================================================
          HOSPITAL KPI OVERVIEW METRICS
      ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Patients</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats?.statistics?.totalPatients || 0}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0a6cf0] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Today's OPD Visits</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {stats?.statistics?.todayOpdVisits || 0}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Active IPD Admissions</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {stats?.statistics?.currentIpdAdmissions || 0}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <BedDouble className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Pending Follow-Ups</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {stats?.statistics?.pendingFollowUpsCount || 0}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SPECIALIZED REPORT MODULES ROSTER (6 TILES)
      ========================================================================= */}
      <div>
        <h2 className="text-base font-black text-slate-900 tracking-tight mb-4">
          Clinical & Operational Report Sections
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Tile 1: OPD Report */}
          <Link
            to="/reports/opd"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-[#0a6cf0] hover:shadow-lg hover:shadow-blue-500/5 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0a6cf0] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0a6cf0] transition-colors flex items-center justify-between">
                <span>OPD Consultation Reports</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Log of outpatient consultations, doctor-wise breakdown, department analytics, and diagnostic summaries.
              </p>
            </div>
            <span className="text-xs font-bold text-[#0a6cf0] flex items-center gap-1 mt-4 group-hover:underline">
              Open OPD Reports <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Tile 2: IPD Report */}
          <Link
            to="/reports/ipd"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/5 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BedDouble className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors flex items-center justify-between">
                <span>IPD Admissions & Bed Roster</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Inpatient admissions, ward/bed occupancy, average length of stay (ALOS), and hospital course tracking.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 flex items-center gap-1 mt-4 group-hover:underline">
              Open IPD Reports <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Tile 3: Discharge Report */}
          <Link
            to="/reports/discharges"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                <span>Discharge Summaries & Outcomes</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Official discharge certificates, clinical outcome metrics (Cured, Relieved, LAMA, Transferred) & Rx advice.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-4 group-hover:underline">
              Open Discharge Reports <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Tile 4: Follow-up Report */}
          <Link
            to="/reports/followups"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/5 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors flex items-center justify-between">
                <span>Follow-Up Review Tracker</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Categorized follow-up reviews (Due Today, Overdue, Upcoming) with doctor instructions and contact reminder lists.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-4 group-hover:underline">
              Open Follow-Up Tracker <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Tile 5: Histopathology Report */}
          <Link
            to="/reports/histopathology"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/5 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors flex items-center justify-between">
                <span>Histopathology & Biopsy Reports</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Tissue biopsy findings, lab specimen reports, pathology conclusions, and associated diagnostic scans.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-4 group-hover:underline">
              Open Lab Reports <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Tile 6: Complete Database CSV Export */}
          <div
            onClick={() => reportService.exportReportCSV("patients")}
            className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-slate-800 hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Download className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0a6cf0] transition-colors flex items-center justify-between">
                <span>Export Master Registry (CSV)</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Download the complete patient master dataset in CSV/Excel spreadsheet format for hospital management & audits.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-4 group-hover:text-[#0a6cf0]">
              Download Master CSV <Download className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHub;
