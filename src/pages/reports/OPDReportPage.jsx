import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Download, Printer, Filter, ChevronLeft, ChevronRight, RefreshCw, Eye, Trash2 } from "lucide-react";
import reportService from "../../services/reportService";
import { historyService } from "../../services/historyService";
import { useToast } from "../../hooks/useToast";
import Button, { actionBtnStyles, actionBadgeBtnStyles } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

export const OPDReportPage = () => {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    doctor: "All",
    department: "All",
    status: "All",
  });

  const [visits, setVisits] = useState([]);
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
      Object.entries(filters).forEach(([key, val]) => {
        if (val && val !== "All") params[key] = val;
      });

      const res = await reportService.getOPDReport(params);
      if (res.success && res.data) {
        setVisits(res.data.visits || []);
        setSummary(res.data.summary || null);
        setPagination(res.data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error("Fetch OPD Report Error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReport(1);
  }, [fetchReport]);

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const res = await historyService.deleteVisitDirect(deleteCandidate._id);
      if (res.success) {
        showToast("OPD Visit deleted successfully", "success");
        setDeleteCandidate(null);
        fetchReport(pagination.page);
      }
    } catch (err) {
      console.error("Delete OPD error:", err);
      showToast("Failed to delete OPD visit", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleExportCSV = async () => {
    try {
      await reportService.exportReportCSV("opd", filters);
    } catch (err) {
      alert("Failed to export OPD report CSV: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-sky-600" /> Outpatient Department (OPD) Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logs of all OPD patient consultations, doctor distribution, and clinical diagnoses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="print"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </Button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 hover:opacity-95 transition-opacity"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date From</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => handleFilterChange("from", e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date To</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => handleFilterChange("to", e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Surgery">Surgery</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setFilters({ from: "", to: "", doctor: "All", department: "All", status: "All" })}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* OPD TABLE */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
          OPD Visit Records ({pagination.total} total)
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading OPD report...</div>
        ) : visits.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No OPD visits found for selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-6">Date</th>
                  <th className="p-3.5">Visit #</th>
                  <th className="p-3.5">CR Number</th>
                  <th className="p-3.5">Patient Name</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Doctor</th>
                  <th className="p-3.5">Diagnosis</th>
                  <th className="p-3.5 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 pl-6 font-mono text-slate-600">
                      {new Date(v.visitDate).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-sky-700">#{v.visitNumber}</td>
                    <td className="p-3.5 font-mono text-slate-800">{v.patientId?.crNo || "N/A"}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {v.patientId?.personalDetails?.name || "Patient Record"}
                    </td>
                    <td className="p-3.5 text-slate-700">{v.departmentName || "General"}</td>
                    <td className="p-3.5 text-slate-600">{v.doctorName || "N/A"}</td>
                    <td className="p-3.5 text-slate-600 truncate max-w-xs">{v.diagnosis || "OPD Consultation"}</td>
                    <td className="p-3.5 text-right pr-6 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 p-1 bg-slate-50/90 rounded-xl border border-slate-200/70 shadow-2xs">
                        {v.patientId?._id && (
                          <Link
                            to={`/patients/${v.patientId._id}`}
                            className={actionBtnStyles.view}
                            title="View Patient Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <a
                          href={reportService.getVisitPdfUrl(v._id)}
                          target="_blank"
                          rel="noreferrer"
                          className={actionBadgeBtnStyles.print}
                          title="Print OPD Slip"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(v)}
                          className={actionBtnStyles.delete}
                          title="Delete OPD Visit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchReport(pagination.page - 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchReport(pagination.page + 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40"
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
        title="Delete OPD Visit Record"
        message={`Are you sure you want to delete OPD Visit #${deleteCandidate?.visitNumber} for patient ${deleteCandidate?.patientId?.personalDetails?.name || "record"}?`}
        confirmText={isDeleting ? "Deleting..." : "Delete Visit"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default OPDReportPage;
