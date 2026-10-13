import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Stethoscope,
  BedDouble,
  UserCheck,
  ChevronRight,
  TrendingUp,
  UserPlus,
  FileText,
  Clock,
  Upload,
  BarChart2,
  Calendar,
  RefreshCw,
  Loader2,
  Activity,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import reportService from "../services/reportService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { actionBadgeBtnStyles } from "../components/ui/Button";

export const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [preset, setPreset] = useState("30days");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const [dashboardData, setDashboardData] = useState({
    statistics: {
      totalPatients: 0,
      todayOpdVisits: 0,
      currentIpdAdmissions: 0,
      todayDischarges: 0,
      pendingFollowUpsCount: 0,
      pendingReportsCount: 0,
    },
    registrationTrend: [],
    statusDistribution: [],
    monthlyTrend: [],
    recentPatients: [],
    todayOpdList: [],
    currentAdmissions: [],
    upcomingFollowUps: [],
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getDashboardAnalytics({ preset });
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error("Dashboard analytics error:", err);
      showToast("Failed to load dashboard metrics", "error");
    } finally {
      setLoading(false);
    }
  }, [preset, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const userName = user?.name || "Hospital Staff";

  const {
    statistics = {},
    registrationTrend = [],
    recentPatients = [],
    todayOpdList = [],
    currentAdmissions = [],
    upcomingFollowUps = [],
    statusDistribution = [],
    monthlyTrend = [],
  } = dashboardData;

  // Real Monthly Trend Data aggregated from MongoDB
  const monthlyTrendData =
    monthlyTrend && monthlyTrend.length > 0
      ? monthlyTrend
      : [
          { month: "Jan", registrations: 0 },
          { month: "Feb", registrations: 0 },
          { month: "Mar", registrations: 0 },
          { month: "Apr", registrations: 0 },
          { month: "May", registrations: 0 },
          { month: "Jun", registrations: 0 },
          { month: "Jul", registrations: 0 },
          { month: "Aug", registrations: 0 },
          { month: "Sep", registrations: 0 },
          { month: "Oct", registrations: 0 },
        ];

  // Real Status Distribution calculated from MongoDB
  const patientStatusData =
    statusDistribution && statusDistribution.length > 0
      ? statusDistribution
      : [
          { name: "Admitted", value: 0, color: "#0a6cf0" },
          { name: "Discharged", value: 0, color: "#12c6c0" },
          { name: "Under Treatment", value: 0, color: "#f59e0b" },
          { name: "Pending", value: 0, color: "#ec4899" },
        ];

  const totalPatientsCount = Number(statistics.totalPatients ?? 0);
  const totalStatusCount = patientStatusData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  // If no patients exist yet, display an empty ring placeholder in PieChart
  const pieChartData =
    totalStatusCount === 0
      ? [{ name: "No Patients", value: 1, color: "#e2e8f0" }]
      : patientStatusData.filter((item) => item.value > 0);

  return (
    <div className="flex flex-col gap-6 sm:gap-7 pb-14 font-sans text-slate-800">
      {/* ---------- 1. GREETING HEADER WITH SUBTLE DOCTOR BANNER ART ---------- */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        {/* Left: Greeting Text */}
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-[28px] lg:text-[32px] font-extrabold text-[#0b2a5b] tracking-tight leading-tight">
            Good Morning, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Here's what happening with your hospital today.
          </p>
        </div>

        {/* Right: Date Switcher & Refresh Button */}
        <div className="relative z-10 flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-blue-100 shadow-xs">
            {["today", "7days", "30days", "thisMonth"].map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  preset === p
                    ? "bg-[#0a6cf0] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {p === "today" && "Today"}
                {p === "7days" && "7D"}
                {p === "30days" && "30D"}
                {p === "thisMonth" && "Month"}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="p-2 rounded-xl bg-white/80 border border-blue-100 text-slate-600 hover:text-[#0a6cf0] hover:bg-white transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0a6cf0]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ---------- 2. TOP 4 KPI METRIC CARDS (100% Dynamic) ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Registered Patients */}
        <div className="bg-white rounded-2xl p-5 sm:p-5.5 border border-[#e8f1fc] shadow-[0_4px_20px_rgba(10,60,150,0.05)] flex flex-col justify-between hover:shadow-[0_8px_25px_rgba(10,60,150,0.08)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#eaf2fd] text-[#0a6cf0] flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-600 leading-snug">
                Total Registered<br />Patients
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div>
            <div className="text-2xl sm:text-[28px] font-black text-[#0b2a5b] tracking-tight">
              {totalPatientsCount.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live database records</span>
            </div>
          </div>
        </div>

        {/* Card 2: OPD Visits */}
        <div className="bg-white rounded-2xl p-5 sm:p-5.5 border border-[#e8f1fc] shadow-[0_4px_20px_rgba(10,60,150,0.05)] flex flex-col justify-between hover:shadow-[0_8px_25px_rgba(10,60,150,0.08)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#e6f8f8] text-[#12c6c0] flex items-center justify-center shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-600 leading-snug">
                OPD Visits
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div>
            <div className="text-2xl sm:text-[28px] font-black text-[#0b2a5b] tracking-tight">
              {Number(statistics.todayOpdVisits ?? 0).toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-cyan-600">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Consultations today</span>
            </div>
          </div>
        </div>

        {/* Card 3: IPD Admissions */}
        <div className="bg-white rounded-2xl p-5 sm:p-5.5 border border-[#e8f1fc] shadow-[0_4px_20px_rgba(10,60,150,0.05)] flex flex-col justify-between hover:shadow-[0_8px_25px_rgba(10,60,150,0.08)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#feeef3] text-[#ec4899] flex items-center justify-center shadow-xs">
                <BedDouble className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-600 leading-snug">
                IPD Admissions
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div>
            <div className="text-2xl sm:text-[28px] font-black text-[#0b2a5b] tracking-tight">
              {Number(statistics.currentIpdAdmissions ?? 0).toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-pink-600">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              <span>Admitted in wards</span>
            </div>
          </div>
        </div>

        {/* Card 4: Discharges */}
        <div className="bg-white rounded-2xl p-5 sm:p-5.5 border border-[#e8f1fc] shadow-[0_4px_20px_rgba(10,60,150,0.05)] flex flex-col justify-between hover:shadow-[0_8px_25px_rgba(10,60,150,0.08)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#eafaf1] text-[#10b981] flex items-center justify-center shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-600 leading-snug">
                Discharges
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div>
            <div className="text-2xl sm:text-[28px] font-black text-[#0b2a5b] tracking-tight">
              {Number(statistics.todayDischarges ?? 0).toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Discharged today</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- 3. MIDDLE SECTION: 2 CHARTS SIDE-BY-SIDE (100% Dynamic) ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Patient Registration Trend (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-[#e8f1fc] shadow-[0_4px_20px_rgba(10,60,150,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0b2a5b] tracking-tight">
                Patient Registration Trend
              </h2>
              <p className="text-xs text-slate-400">Monthly new patient registrations</p>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0a6cf0] text-xs font-bold border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-[#0a6cf0]" />
              <span>{new Date().getFullYear()}</span>
            </div>
          </div>

          <div className="h-60 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a6cf0" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0a6cf0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  domain={[0, (dataMax) => Math.max(5, Math.ceil(dataMax * 1.3))]}
                />
                <Tooltip
                  formatter={(val) => [`${val} Patient(s)`, "Registrations"]}
                  contentStyle={{
                    backgroundColor: "#0b192e",
                    borderRadius: "14px",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  name="Registrations"
                  stroke="#0a6cf0"
                  strokeWidth={3}
                  dot={{ r: 3.5, fill: "#0a6cf0", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 5.5, fill: "#0a6cf0" }}
                  fillOpacity={1}
                  fill="url(#gradientTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Patient Status Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-[#e8f1fc] shadow-[0_4px_20px_rgba(10,60,150,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0b2a5b] tracking-tight">
                Patient Status
              </h2>
              <p className="text-xs text-slate-400">Current clinical distribution</p>
            </div>
            <Link
              to="/patients"
              className="text-xs font-bold text-[#0a6cf0] hover:underline cursor-pointer"
            >
              View All
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            {/* Donut Chart with Total count in hole */}
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={76}
                    paddingAngle={totalStatusCount > 0 ? 3 : 0}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Patient(s)`, name]}
                    contentStyle={{
                      backgroundColor: "#0b192e",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl sm:text-2xl font-black text-[#0b2a5b] tracking-tight">
                  {totalPatientsCount}
                </span>
                <span className="text-[11px] font-medium text-slate-400">Total</span>
              </div>
            </div>

            {/* Status Legend list dynamically calculated */}
            <div className="flex flex-col gap-2.5 w-full sm:w-auto pr-2">
              {patientStatusData.map((item) => {
                const count = item.value || 0;
                const pct = totalStatusCount > 0 ? Math.round((count / totalStatusCount) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between gap-5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-extrabold text-[#0b2a5b]">
                      <span>{count}</span>
                      <span className="text-[11px] font-normal text-slate-400">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- 4. BOTTOM SECTION: QUICK ACTIONS & RECENT PATIENTS (100% Dynamic) ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Quick Actions (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-[#e8f1fc] shadow-[0_4px_20px_rgba(10,60,150,0.05)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-lg font-bold text-[#0b2a5b] tracking-tight">
              Quick Actions
            </h2>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
          </div>

          {/* 5 Quick Action Buttons in a Row matching screenshot */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center">
            {/* 1. Register Patient */}
            <Link
              to="/patients/register"
              className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#e7f8ef] text-[#10b981] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 leading-tight">
                Register<br />Patient
              </span>
            </Link>

            {/* 2. New OPD Visit */}
            <Link
              to="/medical-history"
              className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#e8f3fe] text-[#0a6cf0] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 leading-tight">
                New OPD<br />Visit
              </span>
            </Link>

            {/* 3. Add Admission */}
            <Link
              to="/reports/ipd"
              className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#e7f8f8] text-[#12c6c0] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                <BedDouble className="w-6 h-6" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 leading-tight">
                Add<br />Admission
              </span>
            </Link>

            {/* 4. Upload Document */}
            <Link
              to="/patients"
              className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#fef4e7] text-[#f59e0b] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 leading-tight">
                Upload<br />Document
              </span>
            </Link>

            {/* 5. Generate Report */}
            <Link
              to="/reports"
              className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#f3edf9] text-[#8b5cf6] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                <BarChart2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 leading-tight">
                Generate<br />Report
              </span>
            </Link>
          </div>
        </div>

        {/* Right: Recent Patients (5 cols) - 100% Real Database */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-[#e8f1fc] shadow-[0_4px_20px_rgba(10,60,150,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0b2a5b] tracking-tight">
              Recent Patients
            </h2>
            <Link
              to="/patients"
              className="text-xs font-bold text-[#0a6cf0] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-around">
            {recentPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <Users className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                <span>No patients registered yet.</span>
              </div>
            ) : (
              recentPatients.map((patient) => {
                const pName = patient.personalDetails?.name || "Patient";
                const crNo = patient.crNo || "N/A";
                const dept = patient.doctorDetails?.departmentName || "General";
                const regDate = patient.createdAt
                  ? new Date(patient.createdAt).toLocaleDateString()
                  : "Recently";
                const initials =
                  pName
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "PT";

                return (
                  <div
                    key={patient._id}
                    onClick={() => navigate(`/patients/${patient._id}`)}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-[#0a6cf0] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 shadow-xs group-hover:bg-[#0a6cf0] group-hover:text-white transition-colors">
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0 truncate">
                        <span className="text-xs sm:text-[13px] font-bold text-[#0b2a5b] truncate group-hover:text-[#0a6cf0] transition-colors">
                          {pName}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {dept} • {crNo}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {regDate}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ---------- 5. CLINICAL OPERATIONS TABS (100% Dynamic) ---------- */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e8f1fc] shadow-[0_4px_20px_rgba(10,60,150,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-[#0b2a5b]">
              Clinical Operations & Inpatient Monitoring
            </h2>
            <p className="text-xs text-slate-500">
              Live hospital bed status, outpatient entries, and upcoming scheduled reviews
            </p>
          </div>

          {/* Module Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all" ? "bg-white text-[#0a6cf0] shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setActiveTab("admissions")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "admissions" ? "bg-white text-[#0a6cf0] shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              IPD Admissions ({currentAdmissions.length})
            </button>
            <button
              onClick={() => setActiveTab("opd")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "opd" ? "bg-white text-[#0a6cf0] shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Today's OPD ({todayOpdList.length})
            </button>
            <button
              onClick={() => setActiveTab("followups")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "followups" ? "bg-white text-[#0a6cf0] shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Follow-ups ({upcomingFollowUps.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="pt-4 overflow-x-auto">
          {activeTab === "admissions" || activeTab === "all" ? (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0a6cf0] flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4" /> Active IPD Patients
                </span>
                <Link to="/reports/ipd" className="text-xs font-bold text-[#0a6cf0] hover:underline">
                  Full IPD Register →
                </Link>
              </div>

              {currentAdmissions.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/60 rounded-xl">
                  No patients currently admitted in IPD wards.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentAdmissions.map((p) => (
                    <div
                      key={p._id}
                      className="p-3.5 rounded-xl border border-blue-50 bg-[#f9fcff] flex items-center justify-between hover:border-blue-200 transition-all"
                    >
                      <div>
                        <span className="font-bold text-xs text-[#0b2a5b] block">
                          {p.personalDetails?.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {p.wardDetails?.ward || "General Ward"} • Bed {p.wardDetails?.bedNumber || "N/A"}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 block">
                          {p.daysAdmitted || 1} Day(s)
                        </span>
                        <Link to={`/patients/${p._id}`} className={actionBadgeBtnStyles.view}>
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "opd" || activeTab === "all" ? (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" /> Today's Consultations
                </span>
                <Link to="/reports/opd" className="text-xs font-bold text-purple-600 hover:underline">
                  Full OPD Register →
                </Link>
              </div>

              {todayOpdList.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/60 rounded-xl">
                  No OPD consultations recorded today yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {todayOpdList.map((v) => (
                    <div
                      key={v._id}
                      className="p-3.5 rounded-xl border border-purple-50 bg-[#faf8ff] flex items-center justify-between hover:border-purple-200 transition-all"
                    >
                      <div>
                        <span className="font-bold text-xs text-[#0b2a5b] block">
                          {v.patientId?.personalDetails?.name || "OPD Patient"}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Dr. {v.doctorName || "Consultant"} ({v.departmentName || "General"})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100/70 px-2 py-1 rounded-lg">
                          #{v.visitNumber}
                        </span>
                        {v.patientId?._id || v.patientId ? (
                          <Link to={`/patients/${v.patientId?._id || v.patientId}`} className={actionBadgeBtnStyles.view}>
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "followups" || activeTab === "all" ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Upcoming & Overdue Follow-ups
                </span>
                <Link to="/reports/follow-up" className="text-xs font-bold text-amber-600 hover:underline">
                  Full Follow-up Register →
                </Link>
              </div>

              {upcomingFollowUps.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/60 rounded-xl">
                  No scheduled follow-ups found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {upcomingFollowUps.map((f) => {
                    const fDate = f.followUp?.date || f.followUp?.followUpDate || "Scheduled";
                    const badgeColor =
                      f.followUpStatus === "Overdue"
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : f.followUpStatus === "Due Today"
                        ? "bg-amber-50 text-amber-600 border-amber-100"
                        : "bg-blue-50 text-blue-600 border-blue-100";

                    return (
                      <div
                        key={f._id}
                        className="p-3.5 rounded-xl border border-amber-50 bg-[#fffdf7] flex items-center justify-between hover:border-amber-200 transition-all"
                      >
                        <div>
                          <span className="font-bold text-xs text-[#0b2a5b] block">
                            {f.personalDetails?.name || "Patient"}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            CR: {f.crNo} • Date: {fDate}
                          </span>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border block ${badgeColor}`}>
                            {f.followUpStatus}
                          </span>
                          <Link
                            to={`/patients/${f._id}`}
                            className={actionBadgeBtnStyles.view}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;