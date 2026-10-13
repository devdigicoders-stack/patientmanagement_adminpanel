import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Clock, Download, Printer, Filter, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, CheckCircle2, Calendar, Eye, Trash2 } from "lucide-react";
import reportService from "../../services/reportService";
import { patientService } from "../../services/patientService";
import { useToast } from "../../hooks/useToast";
import Button, { actionBadgeBtnStyles } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

export const FollowUpReportPage = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [doctor, setDoctor] = useState("All");
  const [department, setDepartment] = useState("All");

  const [followUps, setFollowUps] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const fetchReport = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter !== "All") params.statusFilter = statusFilter;
      if (doctor !== "All") params.doctor = doctor;
      if (department !== "All") params.department = department;

      const res = await reportService.getFollowUpReport(params);
      if (res.success && res.data) {
        setFollowUps(res.data.followUps || []);
        setSummary(res.data.summary || null);
        setPagination(res.data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error("Fetch Follow-up Report Error:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, doctor, department]);

  useEffect(() => {
    fetchReport(1);
  }, [fetchReport]);

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const res = await patientService.deletePatient(deleteCandidate._id);
      if (res.success) {
        showToast(`Patient ${deleteCandidate.crNo} deleted successfully`, "success");
        setDeleteCandidate(null);
        fetchReport(pagination.page);
      }
    } catch (err) {
      console.error("Delete follow-up error:", err);
      showToast("Failed to delete patient record", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-600" /> Patient Follow-up Tracker Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track scheduled follow-up visits, due today alerts, overdue follow-ups, and clinical instructions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="print"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            <span>Print Tracker</span>
          </Button>
        </div>
      </div>

      {/* SUMMARY STATS BAR */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setStatusFilter("All")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "All" ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white/80 border-white text-slate-900"
            }`}
          >
            <span className="text-[10px] font-bold uppercase opacity-70">Total Scheduled</span>
            <span className="text-xl font-bold block mt-0.5">{summary.total}</span>
          </button>

          <button
            onClick={() => setStatusFilter("Due Today")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "Due Today" ? "bg-amber-600 text-white border-amber-600 shadow-md" : "bg-white/80 border-white text-slate-900"
            }`}
          >
            <span className="text-[10px] font-bold uppercase opacity-70">Due Today</span>
            <span className="text-xl font-bold block mt-0.5">{summary.dueToday}</span>
          </button>

          <button
            onClick={() => setStatusFilter("Overdue")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "Overdue" ? "bg-red-600 text-white border-red-600 shadow-md" : "bg-white/80 border-white text-slate-900"
            }`}
          >
            <span className="text-[10px] font-bold uppercase opacity-70">Overdue</span>
            <span className="text-xl font-bold block mt-0.5">{summary.overdue}</span>
          </button>

          <button
            onClick={() => setStatusFilter("Upcoming")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "Upcoming" ? "bg-sky-600 text-white border-sky-600 shadow-md" : "bg-white/80 border-white text-slate-900"
            }`}
          >
            <span className="text-[10px] font-bold uppercase opacity-70">Upcoming</span>
            <span className="text-xl font-bold block mt-0.5">{summary.upcoming}</span>
          </button>
        </div>
      )}

      {/* FOLLOW-UP TABLE */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
          <span>Follow-up List ({pagination.total} records)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading follow-ups...</div>
        ) : followUps.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No follow-ups found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-6 whitespace-nowrap">CR Number</th>
                  <th className="p-3.5 whitespace-nowrap">Patient Name</th>
                  <th className="p-3.5 whitespace-nowrap">Follow-up Date</th>
                  <th className="p-3.5 whitespace-nowrap">Status</th>
                  <th className="p-3.5 whitespace-nowrap">Doctor</th>
                  <th className="p-3.5 whitespace-nowrap">Instructions</th>
                  <th className="p-3.5 text-right pr-6 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {followUps.map((p) => {
                  const fDate = p.followUp?.date || p.followUp?.followUpDate || "N/A";
                  const status = p.followUpStatus || "Upcoming";

                  let badgeStyle = "bg-sky-50 text-sky-700 border-sky-200";
                  if (status === "Due Today") badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 font-black animate-pulse";
                  if (status === "Overdue") badgeStyle = "bg-red-50 text-red-700 border-red-200 font-bold";

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 pl-6 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/70">
                          {p.crNo}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                        <Link to={`/patients/${p._id}`} className="hover:underline">
                          {p.personalDetails?.name}
                        </Link>
                      </td>
                      <td className="p-3.5 font-mono text-slate-800 font-semibold whitespace-nowrap">{fDate}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] border ${badgeStyle}`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">{p.doctorDetails?.doctorName || "N/A"}</td>
                      <td className="p-3.5 text-slate-600 truncate max-w-xs">{p.followUp?.instructions || "Routine check-up"}</td>
                      <td className="p-3.5 text-right pr-6 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-50/90 rounded-xl border border-slate-200/70 shadow-2xs">
                          <Link
                            to={`/patients/${p._id}`}
                            className={actionBadgeBtnStyles.view}
                            title="View Patient Record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                          <a
                            href={reportService.getPatientPdfUrl(p._id)}
                            target="_blank"
                            rel="noreferrer"
                            className={actionBadgeBtnStyles.print}
                            title="Print Case Sheet"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient Record"
        message={`Are you sure you want to delete patient ${deleteCandidate?.crNo} (${deleteCandidate?.personalDetails?.name}) from follow-up register?`}
        confirmText={isDeleting ? "Deleting..." : "Delete Record"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FollowUpReportPage;
