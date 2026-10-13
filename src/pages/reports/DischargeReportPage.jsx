import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { UserCheck, Download, Printer, Filter, ChevronLeft, ChevronRight, RefreshCw, Eye, Trash2 } from "lucide-react";
import reportService from "../../services/reportService";
import { patientService } from "../../services/patientService";
import { useToast } from "../../hooks/useToast";
import Button, { actionBtnStyles, actionBadgeBtnStyles } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

export const DischargeReportPage = () => {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    doctor: "All",
    department: "All",
  });

  const [patients, setPatients] = useState([]);
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

      const res = await reportService.getDischargeReport(params);
      if (res.success && res.data) {
        setPatients(res.data.patients || []);
        setPagination(res.data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error("Fetch Discharge Report Error:", err);
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
      const res = await patientService.deletePatient(deleteCandidate._id);
      if (res.success) {
        showToast(`Patient ${deleteCandidate.crNo} deleted successfully`, "success");
        setDeleteCandidate(null);
        fetchReport(pagination.page);
      }
    } catch (err) {
      console.error("Delete discharge error:", err);
      showToast("Failed to delete patient record", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await reportService.exportReportCSV("discharges", filters);
    } catch (err) {
      alert("Failed to export discharge report CSV: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" /> Patient Discharge Summaries Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logs of completed patient hospital discharges, discharge advice, treatment summaries, and follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="print"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            <span>Print Summaries</span>
          </Button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-2 hover:opacity-95 transition-opacity"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* DISCHARGE TABLE */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
          <span>Discharged Patient Logs ({pagination.total} total)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading discharge logs...</div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No discharge records found for selected period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-6 whitespace-nowrap">CR Number</th>
                  <th className="p-3.5 whitespace-nowrap">Patient Name</th>
                  <th className="p-3.5 whitespace-nowrap">Department</th>
                  <th className="p-3.5 whitespace-nowrap">Attending Doctor</th>
                  <th className="p-3.5 whitespace-nowrap">Discharge Date</th>
                  <th className="p-3.5 whitespace-nowrap">Condition at Discharge</th>
                  <th className="p-3.5 text-right pr-6 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => {
                  const disDate = p.admissionDetails?.dischargeDate || new Date(p.updatedAt).toLocaleDateString();
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 pl-6 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-xl border border-emerald-200/70">
                          {p.crNo}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                        <Link to={`/patients/${p._id}`} className="hover:underline">
                          {p.personalDetails?.name}
                        </Link>
                      </td>
                      <td className="p-3.5 text-slate-700 whitespace-nowrap">{p.doctorDetails?.departmentName || "General"}</td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">{p.doctorDetails?.doctorName || "N/A"}</td>
                      <td className="p-3.5 font-mono text-slate-600 whitespace-nowrap">{disDate}</td>
                      <td className="p-3.5 text-slate-600 font-medium whitespace-nowrap">
                        {p.statusOnDischarge || "Recovered / Stable"}
                      </td>
                      <td className="p-3.5 text-right pr-6 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-50/90 rounded-xl border border-slate-200/70 shadow-2xs">
                          <Link
                            to={`/patients/${p._id}`}
                            className={actionBtnStyles.view}
                            title="View Patient Record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <a
                            href={reportService.getPatientPdfUrl(p._id)}
                            target="_blank"
                            rel="noreferrer"
                            className={actionBadgeBtnStyles.print}
                            title="Discharge Summary PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(p)}
                            className={actionBtnStyles.delete}
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
        message={`Are you sure you want to delete patient ${deleteCandidate?.crNo} (${deleteCandidate?.personalDetails?.name}) from discharge register?`}
        confirmText={isDeleting ? "Deleting..." : "Delete Record"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DischargeReportPage;
