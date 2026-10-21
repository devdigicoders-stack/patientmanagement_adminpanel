import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Building, Download, Printer, Filter, ChevronLeft, ChevronRight, RefreshCw, Eye, Trash2 } from "lucide-react";
import reportService from "../../services/reportService";
import { patientService } from "../../services/patientService";
import { useToast } from "../../hooks/useToast";
import Button, { actionBtnStyles, actionBadgeBtnStyles } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import DischargePrintModal from "../../components/patient/DischargePrintModal";

export const IPDReportPage = () => {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    ward: "All",
    doctor: "All",
    department: "All",
    status: "All",
  });

  const [patients, setPatients] = useState([]);
  const [selectedPrintPatient, setSelectedPrintPatient] = useState(null);
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

      const res = await reportService.getIPDReport(params);
      if (res.success && res.data) {
        setPatients(res.data.patients || []);
        setSummary(res.data.summary || null);
        setPagination(res.data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error("Fetch IPD Report Error:", err);
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
      console.error("Delete IPD error:", err);
      showToast("Failed to delete patient record", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await reportService.exportReportCSV("ipd", filters);
    } catch (err) {
      alert("Failed to export IPD report CSV: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-purple-600" /> Inpatient Department (IPD) Admissions Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ward/bed occupancies, admission dates, length of stay, and inpatient medical history.
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
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-2 hover:opacity-95 transition-opacity"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* SUMMARY STATS BAR */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total IPD Records</span>
            <span className="text-xl font-bold text-slate-900 block mt-0.5">{summary.totalIpdRecords}</span>
          </div>
          <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400">Currently Admitted</span>
            <span className="text-xl font-bold text-red-600 block mt-0.5">{summary.currentAdmissions}</span>
          </div>
          <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Discharges</span>
            <span className="text-xl font-bold text-emerald-600 block mt-0.5">{summary.totalDischarges}</span>
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ward</label>
            <select
              value={filters.ward}
              onChange={(e) => setFilters((p) => ({ ...p, ward: e.target.value }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none"
            >
              <option value="All">All Wards</option>
              <option value="General Ward">General Ward</option>
              <option value="ICU">ICU</option>
              <option value="CCU">CCU</option>
              <option value="Private Room">Private Room</option>
              <option value="Emergency Ward">Emergency Ward</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Admitted">Admitted</option>
              <option value="Discharged">Discharged</option>
              <option value="Under Treatment">Under Treatment</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setFilters({ from: "", to: "", ward: "All", doctor: "All", department: "All", status: "All" })}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* IPD TABLE */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
          Inpatient Records ({pagination.total} total)
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading IPD records...</div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No IPD admissions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-6 whitespace-nowrap">CR Number</th>
                  <th className="p-3.5 whitespace-nowrap">IP Number</th>
                  <th className="p-3.5 whitespace-nowrap">Patient Name</th>
                  <th className="p-3.5 whitespace-nowrap">Ward / Bed</th>
                  <th className="p-3.5 whitespace-nowrap">Doctor</th>
                  <th className="p-3.5 whitespace-nowrap">Admission Date</th>
                  <th className="p-3.5 whitespace-nowrap">Status</th>
                  <th className="p-3.5 text-right pr-6 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => {
                  const status = p.status || p.statusOnDischarge || "Admitted";
                  const admDate = p.admissionDetails?.admissionDate || new Date(p.createdAt).toLocaleDateString();
                  const ipNum = p.ipNo || p.hospitalDetails?.ipNumber || p.hospitalDetails?.hospitalNumber || "—";

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 pl-6 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-sky-700 bg-sky-50/80 px-2.5 py-1 rounded-xl border border-sky-200/70">
                          {p.crNo}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50/80 px-2 py-0.5 rounded-lg border border-purple-200/70">
                          {ipNum}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                        <Link to={`/patients/${p._id}`} className="hover:underline">
                          {p.personalDetails?.name}
                        </Link>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800 whitespace-nowrap">
                        {p.wardDetails?.ward || "General Ward"} (Bed {p.wardDetails?.bedNumber || "N/A"})
                      </td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">{p.doctorDetails?.doctorName || "N/A"}</td>
                      <td className="p-3.5 font-mono text-slate-600 whitespace-nowrap">{admDate}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          status === "Admitted" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right pr-6 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-50/90 rounded-xl border border-slate-200/70 shadow-2xs">
                          <Link
                            to={`/patients/${p._id}`}
                            className={actionBadgeBtnStyles.view}
                            title="View Inpatient File"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSelectedPrintPatient(p)}
                            className={actionBadgeBtnStyles.print}
                            title="Print Single Page A4 Discharge Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Slip (A4)</span>
                          </button>
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

      {/* DEDICATED A4 SINGLE PAGE DISCHARGE SLIP MODAL */}
      <DischargePrintModal
        isOpen={!!selectedPrintPatient}
        onClose={() => setSelectedPrintPatient(null)}
        patient={selectedPrintPatient}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient Record"
        message={`Are you sure you want to delete patient ${deleteCandidate?.crNo} (${deleteCandidate?.personalDetails?.name}) from IPD admissions?`}
        confirmText={isDeleting ? "Deleting..." : "Delete Record"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default IPDReportPage;
