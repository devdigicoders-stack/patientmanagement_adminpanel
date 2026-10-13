import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  History,
  Calendar,
  Stethoscope,
  Activity,
  Clock,
  ArrowLeft,
  User,
  Sparkles,
  CheckCircle2,
  Plus,
  Loader2,
  X,
  Save,
  Printer,
  BedDouble,
  Pill,
  HeartPulse,
  AlertCircle,
  Building2,
  Copy,
  Check,
  FileText,
  Trash2,
  ChevronDown,
  Microscope
} from "lucide-react";
import { historyService } from "../services/historyService";
import { patientService } from "../services/patientService";
import { useToast } from "../hooks/useToast";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

export const MedicalHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("timeline"); // "timeline" or "table"
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [copiedCrNo, setCopiedCrNo] = useState(null);

  // Selected visit for printing individual episode slip
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState(null);
  const [deleteVisitCandidate, setDeleteVisitCandidate] = useState(null);
  const [isDeletingVisit, setIsDeletingVisit] = useState(false);

  // New Visit Modal State
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({
    visitDate: new Date().toISOString().split("T")[0],
    visitType: "OPD",
    doctorName: "Dr. Vikramaditya Roy",
    departmentName: "Cardiology",
    ward: "General Medical Ward",
    bedNumber: "",
    diagnosis: "",
    presentingComplaints: "",
    physicalFindings: "",
    investigations: "",
    treatmentDetails: "",
    operationProcedureDetails: "",
    opdFindings: "",
    courseInHospital: "",
    statusOnDischarge: "Under Treatment",
    doctorComments: "",
    advice: "",
    medications: [
      { medicine: "", dosage: "", frequency: "Once Daily (OD)", duration: "", instructions: "" },
    ],
    followUpDate: "",
    followUpInstructions: "",
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await historyService.getPatientHistory(id);
      if (response.success && response.data) {
        setPatient(response.data.patient);
        setVisits(response.data.visits || []);
      }
    } catch (err) {
      console.error("Error fetching patient history:", err);
      showToast("Failed to load patient medical history", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Copy CR Number to Clipboard
  const handleCopyCrNo = (cr) => {
    if (!cr) return;
    navigator.clipboard.writeText(cr);
    setCopiedCrNo(cr);
    showToast(`CR Number ${cr} copied!`, "success");
    setTimeout(() => setCopiedCrNo(null), 2000);
  };

  // Add Medication row in modal
  const handleAddMedicationRow = () => {
    setVisitForm((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { medicine: "", dosage: "", frequency: "Once Daily (OD)", duration: "", instructions: "" },
      ],
    }));
  };

  // Remove Medication row in modal
  const handleRemoveMedicationRow = (idx) => {
    setVisitForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx),
    }));
  };

  // Update Medication field
  const handleMedicationChange = (idx, field, val) => {
    setVisitForm((prev) => {
      const updated = [...prev.medications];
      updated[idx][field] = val;
      return { ...prev, medications: updated };
    });
  };

  // Submit New Visit Record
  const handleAddVisitSubmit = async (e) => {
    e.preventDefault();
    if (!visitForm.diagnosis && !visitForm.presentingComplaints) {
      showToast("Please provide diagnosis or presenting complaints for this visit", "error");
      return;
    }

    setIsSubmittingVisit(true);
    try {
      // Filter out empty medicines
      const cleanMedications = visitForm.medications.filter((m) => m.medicine.trim() !== "");
      const payload = {
        ...visitForm,
        medications: cleanMedications,
      };

      const response = await historyService.addVisit(id, payload);
      if (response.success) {
        showToast("New visit episode added to patient history successfully!", "success");
        setShowAddVisitModal(false);
        // Reset form
        setVisitForm({
          visitDate: new Date().toISOString().split("T")[0],
          visitType: "OPD",
          doctorName: "Dr. Vikramaditya Roy",
          departmentName: "Cardiology",
          ward: "General Medical Ward",
          bedNumber: "",
          diagnosis: "",
          presentingComplaints: "",
          physicalFindings: "",
          investigations: "",
          treatmentDetails: "",
          operationProcedureDetails: "",
          opdFindings: "",
          courseInHospital: "",
          statusOnDischarge: "Under Treatment",
          doctorComments: "",
          advice: "",
          medications: [
            { medicine: "", dosage: "", frequency: "Once Daily (OD)", duration: "", instructions: "" },
          ],
          followUpDate: "",
          followUpInstructions: "",
        });
        fetchHistory();
      }
    } catch (err) {
      console.error("Add visit error:", err);
      showToast("Failed to record visit entry", "error");
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  // Print single visit episode
  const handlePrintSingleVisit = (visit) => {
    setSelectedVisitForPrint(visit);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Print full history
  const handlePrintFullHistory = () => {
    setSelectedVisitForPrint(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Delete single visit episode
  const handleDeleteVisitConfirm = async () => {
    if (!deleteVisitCandidate || !patient) return;
    setIsDeletingVisit(true);
    try {
      const res = await historyService.deleteVisit(patient.id || id, deleteVisitCandidate._id);
      if (res.success) {
        showToast("Visit episode deleted successfully", "success");
        setDeleteVisitCandidate(null);
        fetchHistory();
      }
    } catch (err) {
      console.error("Delete visit error:", err);
      showToast("Failed to delete visit episode", "error");
    } finally {
      setIsDeletingVisit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-3">
        <Loader2 className="w-10 h-10 text-[#0a6cf0] animate-spin" />
        <span className="font-bold text-slate-800 text-sm">Loading Patient Medical History Timeline...</span>
        <span className="text-xs text-slate-400">Fetching chronological hospital episodes from MongoDB</span>
      </div>
    );
  }

  const opdCount = visits.filter((v) => v.visitType === "OPD").length;
  const ipdCount = visits.filter((v) => v.visitType === "IPD" || v.visitType === "IPD / Admission").length;
  const emergencyCount = visits.filter((v) => v.visitType === "Emergency").length;
  const followUpCount = visits.filter((v) => v.visitType === "Follow-up").length;

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* =========================================================================
          PRINT ONLY OFFICIAL HOSPITAL HEADER
      ========================================================================= */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-900 text-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Patient Medical History & Visit Timeline</h1>
            <p className="text-xs text-slate-600 font-medium">DigiCoders Hospital Network • Clinical Continuity Journal</p>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold block">CR Number: {patient?.crNo}</span>
            <span className="text-slate-600">Generated: {new Date().toLocaleDateString("en-IN")}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs pt-2 mt-2 border-t border-slate-200">
          <span>Patient: <strong>{patient?.name}</strong> ({patient?.age} Yrs / {patient?.gender})</span>
          <span>Mobile: <strong>{patient?.mobile}</strong></span>
          <span>Total Episodes Recorded: <strong>{visits.length}</strong></span>
        </div>
      </div>

      {/* =========================================================================
          BREADCRUMB
      ========================================================================= */}
      <Breadcrumb
        items={[
          { label: "Patients", path: "/patients" },
          { label: patient?.name || "Patient Profile", path: `/patients/${id}` },
          { label: "Medical History Timeline (Module 8)" }
        ]}
      />

      {/* =========================================================================
          HERO SUMMARY BANNER (MODULE 8 / PROPOSAL POINT 29)
      ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 print:border-none print:shadow-none print:p-0">
        <div className="flex items-center gap-4 sm:gap-5 flex-1 overflow-hidden">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0a6cf0] to-[#0095ff] text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md shadow-blue-500/20 border-2 border-white">
            {patient?.name ? patient.name.charAt(0).toUpperCase() : "P"}
          </div>

          <div className="flex flex-col gap-1 truncate">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e8f2fe] text-[#0a6cf0] border border-blue-200/60">
                <Sparkles className="w-3 h-3" /> Module 8: Proposal Point 29
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                {patient?.name || "Patient Record"}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
              <span>{patient?.age} Yrs • {patient?.gender}</span>
              <span> • Mobile: <strong className="font-mono text-slate-700">{patient?.mobile || "N/A"}</strong></span>
            </p>

            <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 font-mono flex-wrap">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#0a6cf0] font-bold border border-blue-200/60">
                CR: {patient?.crNo}
                <button
                  type="button"
                  onClick={() => handleCopyCrNo(patient?.crNo)}
                  className="p-0.5 hover:text-slate-900 cursor-pointer print:hidden"
                  title="Copy CR"
                >
                  {copiedCrNo === patient?.crNo ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </span>
              <span>Total Episodes: <strong>{visits.length}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">OPD: {opdCount}</span>
              <span>•</span>
              <span className="text-rose-700 font-bold">IPD: {ipdCount}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end print:hidden">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(`/patients/${id}`)}
            className="cursor-pointer"
          >
            Back to Dossier
          </Button>

          <Button
            variant="print"
            size="sm"
            icon={Printer}
            onClick={handlePrintFullHistory}
            className="cursor-pointer"
          >
            Print Timeline
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddVisitModal(true)}
            className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20"
          >
            Record New Visit
          </Button>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE TABS (TIMELINE VS STRUCTURED TABLE)
      ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "timeline"
              ? "bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] text-white shadow-md shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
        >
          <History className="w-4 h-4" />
          Chronological Timeline ({visits.length})
        </button>

        <button
          onClick={() => setActiveTab("table")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "table"
              ? "bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] text-white shadow-md shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
        >
          <Activity className="w-4 h-4" />
          Structured Tabular Journal
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CHRONOLOGICAL TIMELINE VIEW
      ========================================================================= */}
      {activeTab === "timeline" && (
        visits.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-16 text-center shadow-xs flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0a6cf0] flex items-center justify-center font-bold mb-1">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-900">No Historical Visits Recorded Yet</h3>
            <p className="text-slate-500 max-w-md text-xs">
              This patient has no subsequent outpatient consultations or inpatient admissions logged. Click below to add the first visit entry.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddVisitModal(true)}
              className="cursor-pointer mt-2 bg-gradient-to-r from-[#0a6cf0] to-[#0095ff]"
            >
              Record First Visit
            </Button>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 flex flex-col gap-6 my-2">
            {visits.map((visit, index) => {
              const vDate = visit.visitDate ? new Date(visit.visitDate).toLocaleDateString("en-IN") : "N/A";
              const vType = visit.visitType || "OPD";
              const docName = visit.doctorName || visit.doctor || "Dr. Assigned";
              const deptName = visit.departmentName || visit.department || "General";
              const diag = visit.diagnosis || "Provisional diagnosis ongoing";
              const treat = visit.treatmentDetails || visit.treatment || "Conservative medical management";
              const meds = visit.medications || [];

              const isIpd = vType === "IPD" || vType === "IPD / Admission";
              const isEmergency = vType === "Emergency";
              const isFollowUp = vType === "Follow-up";

              return (
                <div key={visit._id || index} className="relative group">
                  {/* Visual Node */}
                  <div className={`absolute -left-[31px] sm:-left-[39px] top-4 w-7 h-7 rounded-full bg-white border-4 flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${isIpd
                      ? "border-purple-600 text-purple-600"
                      : isEmergency
                        ? "border-rose-600 text-rose-600"
                        : isFollowUp
                          ? "border-amber-600 text-amber-600"
                          : "border-[#0a6cf0] text-[#0a6cf0]"
                    }`}>
                    <div className="w-2 h-2 rounded-full bg-current" />
                  </div>

                  {/* Visit Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-blue-300 transition-all flex flex-col gap-4">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          Episode #{visits.length - index}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#0a6cf0]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{vDate}</span>
                        </div>
                        <Badge
                          variant={
                            isIpd
                              ? "danger"
                              : isEmergency
                                ? "warning"
                                : isFollowUp
                                  ? "success"
                                  : "primary"
                          }
                        >
                          {vType}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 print:hidden">
                        <Button
                          variant="print"
                          size="xs"
                          icon={Printer}
                          onClick={() => handlePrintSingleVisit(visit)}
                          className="cursor-pointer"
                        >
                          Print Slip
                        </Button>
                        <Button
                          variant="danger"
                          size="xs"
                          icon={Trash2}
                          onClick={() => setDeleteVisitCandidate(visit)}
                          className="cursor-pointer bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200"
                        >
                          Delete
                        </Button>
                        <Badge variant={visit.statusOnDischarge === "Discharged" ? "success" : "primary"}>
                          {visit.statusOnDischarge || "Recorded"}
                        </Badge>
                      </div>
                    </div>

                    {/* Clinical Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Treating Doctor & Dept
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {docName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium block">
                          {deptName}
                        </span>
                      </div>

                      {visit.ward && (
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Ward & Bed Allocation
                          </span>
                          <span className="font-bold text-slate-900 mt-0.5 block">
                            {visit.ward}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            Bed: {visit.bedNumber || "Unassigned"}
                          </span>
                        </div>
                      )}

                      <div className="sm:col-span-2 lg:col-span-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Clinical Diagnosis
                        </span>
                        <span className="font-bold text-[#0a6cf0] mt-0.5 block">
                          {diag}
                        </span>
                      </div>

                      {visit.presentingComplaints && (
                        <div className="sm:col-span-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Presenting Complaints & Vitals
                          </span>
                          <span className="text-slate-800 mt-0.5 block bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                            {visit.presentingComplaints}
                          </span>
                        </div>
                      )}

                      {treat && (
                        <div className="sm:col-span-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Treatment Protocols & Procedures
                          </span>
                          <span className="text-slate-800 mt-0.5 block bg-blue-50/40 p-2.5 rounded-xl border border-blue-100">
                            {treat}
                          </span>
                        </div>
                      )}

                      {visit.doctorComments && (
                        <div className="sm:col-span-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Doctor Remarks & Advice
                          </span>
                          <span className="text-slate-700 mt-0.5 block italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            "{visit.doctorComments}"
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Medications Prescribed in this visit */}
                    {meds.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-emerald-600" /> Prescriptions ({meds.length})
                        </span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#f0f6fe] text-slate-600 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-2">Medicine Name</th>
                                <th className="p-2">Dosage</th>
                                <th className="p-2">Frequency</th>
                                <th className="p-2">Duration</th>
                                <th className="p-2">Instructions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {meds.map((m, mIdx) => (
                                <tr key={mIdx}>
                                  <td className="p-2 font-bold text-slate-900">{m.medicine}</td>
                                  <td className="p-2 font-semibold text-[#0a6cf0]">{m.dosage || "--"}</td>
                                  <td className="p-2">{m.frequency || "--"}</td>
                                  <td className="p-2">{m.duration || "--"}</td>
                                  <td className="p-2 text-slate-600">{m.instructions || "After food"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* =========================================================================
          TAB 2: STRUCTURED TABLE VIEW
      ========================================================================= */}
      {activeTab === "table" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_14px_rgba(10,80,180,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0f6fe]/70 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-blue-100">
                <tr>
                  <th className="p-3.5 pl-6">Episode Date</th>
                  <th className="p-3.5">Visit Type</th>
                  <th className="p-3.5">Doctor & Dept</th>
                  <th className="p-3.5">Diagnosis</th>
                  <th className="p-3.5">Treatment & Procedures</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-6 print:hidden">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {visits.map((v, i) => (
                  <tr key={v._id || i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 pl-6 font-mono font-bold text-slate-900">
                      {v.visitDate ? new Date(v.visitDate).toLocaleDateString("en-IN") : "N/A"}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="primary">{v.visitType || "OPD"}</Badge>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {v.doctorName || v.doctor || "--"}
                      <span className="block text-[10px] text-slate-400 font-normal">{v.departmentName || v.department}</span>
                    </td>
                    <td className="p-3.5 font-bold text-[#0a6cf0] max-w-[180px] truncate">
                      {v.diagnosis || "--"}
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-[200px] truncate">
                      {v.treatmentDetails || v.treatment || "--"}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="success">{v.statusOnDischarge || "Recorded"}</Badge>
                    </td>
                    <td className="p-3.5 text-right pr-6 print:hidden">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="print"
                          size="xs"
                          icon={Printer}
                          onClick={() => handlePrintSingleVisit(v)}
                          className="cursor-pointer"
                        >
                          Print Slip
                        </Button>
                        <Button
                          variant="danger"
                          size="xs"
                          icon={Trash2}
                          onClick={() => setDeleteVisitCandidate(v)}
                          className="cursor-pointer bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD NEW VISIT MODAL (FULL CLINICAL FIELDS)
      ========================================================================= */}
      {showAddVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0a6cf0] border border-blue-200/60 text-[10px] font-bold">
                  Clinical Care Episode Entry
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Record New Visit Entry for {patient?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVisitModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddVisitSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Visit Date */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Visit Date *
                  </label>
                  <input
                    type="date"
                    value={visitForm.visitDate}
                    onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-[#0a6cf0] outline-none"
                  />
                </div>

                {/* Visit Type */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Visit Type *
                  </label>
                  <select
                    value={visitForm.visitType}
                    onChange={(e) => setVisitForm({ ...visitForm, visitType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-[#0a6cf0] outline-none"
                  >
                    <option value="OPD">OPD Consultation</option>
                    <option value="IPD">IPD Admission</option>
                    <option value="Follow-up">Follow-up Review</option>
                    <option value="Emergency">Emergency / Trauma</option>
                    <option value="Procedure">Surgical / Interventional Procedure</option>
                  </select>
                </div>

                {/* Attending Doctor */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Attending Doctor
                  </label>
                  <input
                    type="text"
                    value={visitForm.doctorName}
                    onChange={(e) => setVisitForm({ ...visitForm, doctorName: e.target.value })}
                    placeholder="Enter doctor's name"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-[#0a6cf0] outline-none"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={visitForm.departmentName}
                    onChange={(e) => setVisitForm({ ...visitForm, departmentName: e.target.value })}
                    placeholder="Enter department"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-[#0a6cf0] outline-none"
                  />
                </div>

                {/* Ward */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Ward Category
                  </label>
                  <input
                    type="text"
                    value={visitForm.ward}
                    onChange={(e) => setVisitForm({ ...visitForm, ward: e.target.value })}
                    placeholder="e.g. General Ward or ICU"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-[#0a6cf0] outline-none"
                  />
                </div>

                {/* Bed Number */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Bed Number
                  </label>
                  <input
                    type="text"
                    value={visitForm.bedNumber}
                    onChange={(e) => setVisitForm({ ...visitForm, bedNumber: e.target.value })}
                    placeholder="e.g. Bed-12"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-[#0a6cf0] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Diagnosis Details */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Diagnosis Details *
                </label>
                <input
                  type="text"
                  value={visitForm.diagnosis}
                  onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })}
                  placeholder="e.g. Acute Cor Pulmonale, Hypertension grade 2"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-[#0a6cf0] outline-none"
                />
              </div>

              {/* Presenting Complaints & Vitals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Presenting Complaints
                  </label>
                  <textarea
                    rows={2}
                    value={visitForm.presentingComplaints}
                    onChange={(e) => setVisitForm({ ...visitForm, presentingComplaints: e.target.value })}
                    placeholder="Chief complaints, pain, onset..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 text-slate-900 focus:bg-white focus:border-[#0a6cf0] outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Treatment & Interventions
                  </label>
                  <textarea
                    rows={2}
                    value={visitForm.treatmentDetails}
                    onChange={(e) => setVisitForm({ ...visitForm, treatmentDetails: e.target.value })}
                    placeholder="Conservative medications, IV fluids, protocol..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 text-slate-900 focus:bg-white focus:border-[#0a6cf0] outline-none resize-none"
                  />
                </div>
              </div>

              {/* Clinical Notes & Comments */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Doctor's Comments & Advice
                </label>
                <textarea
                  rows={2}
                  value={visitForm.doctorComments}
                  onChange={(e) => setVisitForm({ ...visitForm, doctorComments: e.target.value })}
                  placeholder="Clinical notes, patient progress, dietary recommendations..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 text-slate-900 focus:bg-white focus:border-[#0a6cf0] outline-none resize-none"
                />
              </div>

              {/* Rx Prescriptions Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-emerald-600" /> Prescribed Medications (Rx)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMedicationRow}
                    className="text-xs font-bold text-[#0a6cf0] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Medication
                  </button>
                </div>

                {visitForm.medications.map((med, mIdx) => (
                  <div key={mIdx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Tab Metoprolol)"
                      value={med.medicine}
                      onChange={(e) => handleMedicationChange(mIdx, "medicine", e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 sm:col-span-2 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 25mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(mIdx, "dosage", e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Frequency (OD/BD/TDS)"
                      value={med.frequency}
                      onChange={(e) => handleMedicationChange(mIdx, "frequency", e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Instructions"
                        value={med.instructions}
                        onChange={(e) => handleMedicationChange(mIdx, "instructions", e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 flex-1 outline-none"
                      />
                      {visitForm.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicationRow(mIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddVisitModal(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={isSubmittingVisit ? Loader2 : Save}
                  disabled={isSubmittingVisit}
                  className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff]"
                >
                  {isSubmittingVisit ? "Recording Episode..." : "Save Visit Entry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DELETE VISIT CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={!!deleteVisitCandidate}
        onClose={() => setDeleteVisitCandidate(null)}
        onConfirm={handleDeleteVisitConfirm}
        title="Delete Visit Record"
        message={`Are you sure you want to delete this visit episode (${deleteVisitCandidate?.visitType}) recorded on ${deleteVisitCandidate?.visitDate ? new Date(deleteVisitCandidate.visitDate).toLocaleDateString("en-IN") : "N/A"}?`}
        confirmText={isDeletingVisit ? "Deleting..." : "Delete Visit"}
        variant="danger"
        isLoading={isDeletingVisit}
      />
    </div>
  );
};

export default MedicalHistory;
