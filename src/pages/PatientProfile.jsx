import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Printer,
  Edit3,
  History,
  ArrowLeft,
  User,
  Phone,
  Building2,
  Stethoscope,
  Activity,
  Pill,
  Calendar,
  Microscope,
  FileText,
  FileImage,
  CheckCircle2,
  Loader2,
  Trash2,
  Upload,
  File,
  Plus,
  Search,
  Clock,
  ChevronRight,
  X,
  Eye,
  Filter,
  Save,
  BedDouble,
  ShieldCheck,
  HeartPulse,
  MapPin,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { patientService } from "../services/patientService";
import { historyService } from "../services/historyService";
import { uploadService } from "../services/uploadService";
import { useToast } from "../hooks/useToast";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import Button, { actionBtnStyles } from "../components/ui/Button";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { getPatientStatus } from "../utils/helpers";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { DatePicker } from "../components/ui/DatePicker";
import { FileUpload } from "../components/ui/FileUpload";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";

export const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("dossier"); // "dossier", "timeline", "medications", "documents"
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    patientService.getFilterOptions().then((res) => {
      if (res?.success && res?.data?.departments) {
        setDepartments(res.data.departments);
      }
    }).catch((err) => {
      console.error("Failed to load departments in PatientProfile:", err);
    });
  }, []);

  // Search & Filter within visits
  const [visitSearch, setVisitSearch] = useState("");
  const [visitTypeFilter, setVisitTypeFilter] = useState("All");

  // Document Category Filter & Delete
  const [docCategoryFilter, setDocCategoryFilter] = useState("All");
  const [deleteDocCandidate, setDeleteDocCandidate] = useState(null);

  // Patient & Visit Delete states
  const [showDeletePatientModal, setShowDeletePatientModal] = useState(false);
  const [isDeletingPatient, setIsDeletingPatient] = useState(false);
  const [deleteVisitCandidate, setDeleteVisitCandidate] = useState(null);
  const [isDeletingVisit, setIsDeletingVisit] = useState(false);

  // Active Visit for Printable / Detail Modal
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Add Visit Modal State
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({
    visitDate: "",
    visitType: "",
    doctorName: "",
    departmentName: "",
    ward: "",
    bedNumber: "",
    diagnosis: "",
    presentingComplaints: "",
    physicalFindings: "",
    investigations: "",
    treatmentDetails: "",
    operationProcedureDetails: "",
    opdFindings: "",
    courseInHospital: "",
    statusOnDischarge: "",
    doctorComments: "",
    advice: "",
    medications: [
      { medicine: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ],
    followUpDate: "",
    followUpInstructions: "",
    histopathologyDetails: "",
  });

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Patient Record
      const patRes = await patientService.getPatientById(id);
      if (patRes.success && patRes.data) {
        setPatient(patRes.data);
        const patId = patRes.data._id;

        // 2. Fetch History & Visits
        const histRes = await historyService.getPatientHistory(patId);
        if (histRes.success && histRes.data) {
          setVisits(histRes.data.visits || []);
        }

        // 3. Fetch Documents
        const docRes = await uploadService.getPatientDocuments(patId);
        if (docRes.success && docRes.data) {
          setDocuments(docRes.data);
        }
      }
    } catch (err) {
      console.error("Error loading patient profile data:", err);
      showToast("Failed to load patient record", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handlePrintFullReport = () => {
    setSelectedVisit(null);
    window.print();
  };

  const handlePrintVisitReport = (visit) => {
    setSelectedVisit(visit);
    setTimeout(() => window.print(), 100);
  };

  // Add Visit Handlers
  const handleAddMedicationRow = () => {
    setVisitForm((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { medicine: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ],
    }));
  };

  const handleRemoveMedicationRow = (idx) => {
    setVisitForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx),
    }));
  };

  const handleMedicationChange = (idx, field, value) => {
    setVisitForm((prev) => {
      const updated = [...prev.medications];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, medications: updated };
    });
  };

  const handleAddVisitSubmit = async (e) => {
    e.preventDefault();
    if (!visitForm.diagnosis && !visitForm.presentingComplaints) {
      showToast("Please enter a Diagnosis or Complaints", "error");
      return;
    }

    setIsSubmittingVisit(true);
    try {
      const payload = {
        ...visitForm,
        followUp: {
          date: visitForm.followUpDate,
          instructions: visitForm.followUpInstructions,
        },
        histopathology: {
          reportDetails: visitForm.histopathologyDetails,
        },
      };

      const res = await historyService.addVisit(patient._id, payload);
      if (res.success) {
        showToast(`Visit #${res.data?.visitNumber || ""} recorded successfully`, "success");
        setShowAddVisitModal(false);
        loadAllData();
      }
    } catch (err) {
      console.error("Add visit error:", err);
      showToast("Failed to record new visit", "error");
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  // Document Handlers
  const handleCategoryFileUpload = async (files, category) => {
    if (!files || files.length === 0) return;
    try {
      for (const item of files) {
        if (item.rawFile) {
          await uploadService.uploadCategoryDocument(patient._id, item.rawFile, category);
        }
      }
      showToast("Clinical document uploaded successfully", "success");
      loadAllData();
    } catch (err) {
      console.error("Doc upload error:", err);
      showToast("Failed to upload document", "error");
    }
  };

  const handleConfirmDocDelete = async () => {
    if (!deleteDocCandidate) return;
    try {
      const res = await uploadService.deleteDocument(patient._id, deleteDocCandidate._id || deleteDocCandidate.filename);
      if (res.success) {
        showToast("Document deleted successfully", "success");
        setDeleteDocCandidate(null);
        loadAllData();
      }
    } catch (err) {
      console.error("Doc delete error:", err);
      showToast("Failed to delete document", "error");
    }
  };

  const handleDeletePatient = async () => {
    if (!patient) return;
    setIsDeletingPatient(true);
    try {
      const res = await patientService.deletePatient(patient._id);
      if (res.success) {
        showToast(`Patient ${patient.crNo} deleted successfully`, "success");
        setShowDeletePatientModal(false);
        navigate("/patients");
      }
    } catch (err) {
      console.error("Delete patient error:", err);
      showToast("Failed to delete patient record", "error");
    } finally {
      setIsDeletingPatient(false);
    }
  };

  const handleDeleteVisit = async () => {
    if (!deleteVisitCandidate || !patient) return;
    setIsDeletingVisit(true);
    try {
      const res = await historyService.deleteVisit(patient._id, deleteVisitCandidate._id);
      if (res.success) {
        showToast("Visit record deleted successfully", "success");
        setDeleteVisitCandidate(null);
        loadAllData();
      }
    } catch (err) {
      console.error("Delete visit error:", err);
      showToast("Failed to delete visit record", "error");
    } finally {
      setIsDeletingVisit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500 gap-3">
        <Loader2 className="w-10 h-10 text-[#0a6cf0] animate-spin" />
        <p className="text-sm font-semibold">Loading Patient Medical Dossier...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Patient Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested patient record could not be located in the database.</p>
        <Button onClick={() => navigate("/patients")} className="mt-4">
          Back to Directory
        </Button>
      </div>
    );
  }

  // Bind all 25 fields with safe fallbacks
  const personal = patient.personalDetails || {};
  const contact = patient.contactDetails || {};
  const hospital = patient.hospitalDetails || {};
  const wardDetails = patient.wardDetails || {};
  const doctorDetails = patient.doctorDetails || {};
  const admission = patient.admissionDetails || {};
  const diagnosis = patient.diagnosis || {};
  const treatment = patient.treatment || {};
  const followUp = patient.followUp || {};
  const statusVal = getPatientStatus(patient);
  const medicationsList = patient.medications && patient.medications.length > 0
    ? patient.medications
    : (visits[0]?.medications || []);

  // Filtered Visits
  const filteredVisits = visits.filter((v) => {
    const matchesType = visitTypeFilter === "All" || v.visitType === visitTypeFilter;
    const term = visitSearch.toLowerCase();
    const matchesSearch =
      !visitSearch ||
      (v.diagnosis && v.diagnosis.toLowerCase().includes(term)) ||
      (v.doctorName && v.doctorName.toLowerCase().includes(term)) ||
      (v.treatmentDetails && v.treatmentDetails.toLowerCase().includes(term));
    return matchesType && matchesSearch;
  });

  // Filtered Documents
  const filteredDocs = documents.filter(
    (d) => docCategoryFilter === "All" || d.category === docCategoryFilter
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      <div className="print:hidden">
        <Breadcrumb items={[{ label: "Patients", path: "/patients" }, { label: personal.name || "Patient Profile" }]} />
      </div>

      {/* =========================================================================
          PRINT-ONLY OFFICIAL HOSPITAL HEADER (SHOWN ONLY DURING PRINTING)
      ========================================================================= */}
      <div className="hidden print:block mb-6 p-4 border-b-2 border-slate-900 text-slate-900">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Patient Record Management System</h1>
            <p className="text-xs text-slate-600 font-medium">DigiCoders Hospital Network • Inpatient & Outpatient Clinical Dossier</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-bold uppercase block">CR NUMBER</span>
            <span className="text-xl font-mono font-black text-slate-900">{patient.crNo}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-200">
          <span>Patient: <strong>{personal.name}</strong> ({personal.age} Yrs / {personal.gender})</span>
          <span>Doctor: <strong>{doctorDetails.doctorName}</strong> ({doctorDetails.departmentName})</span>
          <span>Date: <strong>{new Date().toLocaleDateString("en-IN")}</strong></span>
        </div>
      </div>

      {/* =========================================================================
          PATIENT HERO HEADER CARD
      ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 print:border-none print:shadow-none print:p-0">
        <div className="flex items-center gap-4 sm:gap-5 flex-1 overflow-hidden">
          {/* Avatar with Status Ring */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0a6cf0] to-[#0095ff] text-white flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 shadow-md shadow-blue-500/20 border-2 border-white">
            {personal.name ? personal.name.charAt(0).toUpperCase() : "P"}
          </div>

          <div className="flex flex-col gap-1 truncate">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                {personal.name}
              </h1>
              <Badge
                variant={
                  statusVal === "Admitted"
                    ? "danger"
                    : statusVal === "Discharged"
                      ? "success"
                      : statusVal === "Under Treatment"
                        ? "primary"
                        : "warning"
                }
                dot
              >
                {statusVal}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
              <span>{personal.age} Yrs • {personal.gender}</span>
              {personal.fatherGuardianName && <span> • S/O: {personal.fatherGuardianName}</span>}
              <span> • Mobile: <strong className="font-mono text-slate-700">{contact.mobile}</strong></span>
            </p>

            {/* Micro badges row */}
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 font-mono flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#e8f2fe] text-[#0a6cf0] font-bold border border-blue-200/60">
                CR: {patient.crNo}
              </span>
              <span>Ward: <strong>{wardDetails.ward || "General Ward"}</strong> ({wardDetails.bedNumber || "Unassigned"})</span>
              <span>•</span>
              <span>Doctor: <strong className="text-slate-800">{doctorDetails.doctorName || "Dr. Assigned"}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end print:hidden">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/patients")}
            className="cursor-pointer"
          >
            Back
          </Button>

          <Button
            variant="view"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddVisitModal(true)}
            className="cursor-pointer"
          >
            Record Visit
          </Button>

          <Link to={`/patients/${patient._id}/edit`}>
            <Button
              variant="edit"
              size="sm"
              icon={Edit3}
              className="cursor-pointer"
            >
              Edit Record
            </Button>
          </Link>

          <Button
            variant="print"
            size="sm"
            icon={Printer}
            onClick={handlePrintFullReport}
            className="cursor-pointer"
          >
            Print Dossier
          </Button>

          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setShowDeletePatientModal(true)}
            className="cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
          >
            Delete Record
          </Button>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE NAVIGATION TAB BAR
      ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto print:hidden">
        {[
          { id: "dossier", label: "Clinical Dossier (All 25 Fields)", icon: Activity },
          { id: "timeline", label: `Visit Timeline (${visits.length})`, icon: History },
          { id: "medications", label: `Medication Regimen (${medicationsList.length})`, icon: Pill },
          { id: "documents", label: `Scans & Files (${documents.length})`, icon: FileImage },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${isActive
                  ? "bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
                }`}
            >
              <IconComp className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: COMPREHENSIVE CLINICAL DOSSIER (ALL 25 PROPOSAL FIELDS)
      ========================================================================= */}
      {(activeTab === "dossier" || typeof window === "undefined") && (
        <div className="flex flex-col gap-6">

          {/* ROW 1: PERSONAL & CONTACT + HOSPITAL ALLOCATION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Patient Identity & Contact (Proposal Points 2, 3, 5, 6) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0a6cf0] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Patient Personal Details & Contact</h2>
                  <p className="text-[11px] text-slate-500">Demographic parameters & residential address (Points 5, 6)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{personal.name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Father / Guardian</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{personal.fatherGuardianName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Age & Gender</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{personal.age} Yrs / {personal.gender}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth</span>
                  <span className="font-mono text-slate-700 mt-0.5 block">{personal.dob || "Not recorded"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Number</span>
                  <span className="font-mono font-bold text-[#0a6cf0] mt-0.5 block">{contact.mobile || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="text-slate-700 mt-0.5 block truncate">{contact.email || "N/A"}</span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Residential Address</span>
                  <span className="text-slate-800 mt-0.5 block">
                    {contact.address || "Address not recorded"}, {contact.city || "Lucknow"}, {contact.state || "Uttar Pradesh"} - {contact.pincode || "226001"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Hospital Tracking & Allocation (Proposal Points 4, 7, 8, 9, 10, 11) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Hospital Details & Ward Allocation</h2>
                  <p className="text-[11px] text-slate-500">Treating team, admission dates & status (Points 4, 7, 8, 9, 10, 11)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Central Reg (CR) No.</span>
                  <span className="font-mono font-bold text-[#0a6cf0] mt-0.5 block">{patient.crNo}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hospital Number</span>
                  <span className="font-mono text-slate-800 mt-0.5 block">{hospital.hospitalNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Patient File No.</span>
                  <span className="font-mono text-slate-800 mt-0.5 block">{hospital.patientNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Ward</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{wardDetails.ward || "General Ward"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bed Number</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{wardDetails.bedNumber || "Not allocated"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Patient Status</span>
                  <Badge variant={statusVal === "Admitted" ? "danger" : statusVal === "Discharged" ? "success" : "primary"}>
                    {statusVal}
                  </Badge>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Attending Doctor</span>
                  <span className="font-bold text-[#0a6cf0] mt-0.5 block">{doctorDetails.doctorName || "Dr. Assigned"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{doctorDetails.departmentName || "General"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Date of Admission</span>
                  <span className="font-mono text-emerald-700 font-bold mt-0.5 block">{admission.admissionDate || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Date of Discharge</span>
                  <span className="font-mono text-slate-700 mt-0.5 block">{admission.dischargeDate || "Active Inpatient"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: CLINICAL DIAGNOSIS, COMPLAINTS & PHYSICAL FINDINGS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 3: Diagnosis Details (Proposal Point 12) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Diagnosis Details (Point 12)</h3>
              </div>
              <p className="text-xs font-bold text-slate-900 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                {diagnosis.diagnosisDetails || "Clinical diagnosis under ongoing evaluation."}
              </p>
            </div>

            {/* Card 4: Presenting Complaints (Proposal Point 13) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Presenting Complaints (Point 13)</h3>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-amber-50/40 p-3 rounded-xl border border-amber-100">
                {diagnosis.presentingComplaints || "No acute presenting complaints recorded."}
              </p>
            </div>

            {/* Card 5: Physical Findings & Vitals (Proposal Point 14) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Activity className="w-4 h-4 text-[#0a6cf0]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Physical Findings & Vitals (Point 14)</h3>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-[#f0f6fe] p-3 rounded-xl border border-blue-100">
                {diagnosis.physicalFindings || "General examination and vital parameters stable."}
              </p>
            </div>
          </div>

          {/* ROW 3: OPD FINDINGS, INVESTIGATIONS & COURSE IN HOSPITAL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 6: OPD Consultation Findings (Proposal Point 19) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">OPD Findings (Point 19)</h3>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-teal-50/40 p-3 rounded-xl border border-teal-100">
                {patient.opdFindings || "Consultation chamber observations documented during outpatient review."}
              </p>
            </div>

            {/* Card 7: Diagnostic Investigation Details (Proposal Point 15) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <FileText className="w-4 h-4 text-cyan-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Investigation Details (Point 15)</h3>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-cyan-50/40 p-3 rounded-xl border border-cyan-100">
                {patient.investigationDetails || "Routine pathology, radiology and ECG reports logged in patient record."}
              </p>
            </div>

            {/* Card 8: Course in Hospital (Proposal Point 20) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <BedDouble className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Course in Hospital (Point 20)</h3>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-indigo-50/40 p-3 rounded-xl border border-indigo-100">
                {patient.courseInHospital || "Inpatient stay monitored without clinical adverse events."}
              </p>
            </div>
          </div>

          {/* ROW 4: TREATMENT DETAILS & OPERATION / SURGICAL PROCEDURES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 9: Treatment Details (Proposal Point 16) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <HeartPulse className="w-4 h-4 text-[#0a6cf0]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Treatment Details (Point 16)</h3>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {treatment.treatmentDetails || "Medical conservative drug therapy and symptomatic protocols implemented."}
              </p>
            </div>

            {/* Card 10: Operation / Procedure Details (Proposal Point 17) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Operation / Procedure Details (Point 17)</h3>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {treatment.operationProcedureDetails || "No surgical or major interventional procedures recorded for this episode."}
              </p>
            </div>
          </div>

          {/* ROW 5: ADVICE & MEDICATION DETAILS (PROPOSAL POINT 23) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Advice & Medication Details (Point 23 - Rx Table)</h2>
                  <p className="text-[11px] text-slate-500">Prescribed pharmaceuticals, dosage, frequency & instructions</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {medicationsList.length} Medicine(s) Prescribed
              </span>
            </div>

            {medicationsList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center italic">No medications prescribed for this record.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f0f6fe] border-b border-blue-100 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Medicine Name</th>
                      <th className="p-3">Dosage</th>
                      <th className="p-3">Frequency</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {medicationsList.map((med, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/40">
                        <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{med.medicine || "--"}</td>
                        <td className="p-3 font-semibold text-[#0a6cf0]">{med.dosage || "--"}</td>
                        <td className="p-3">{med.frequency || "Once Daily"}</td>
                        <td className="p-3">{med.duration || "--"}</td>
                        <td className="p-3 text-slate-600">{med.instructions || "After food"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ROW 6: HISTOPATHOLOGY, DOCTOR COMMENTS & FOLLOW-UP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 12: Doctor's Comments (Proposal Point 22) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Stethoscope className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Doctor's Comments (Point 22)</h3>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-purple-50/40 p-3 rounded-xl border border-purple-100">
                {patient.doctorComments || "Patient clinically stable. Advised compliance with therapy and lifestyle modifications."}
              </p>
            </div>

            {/* Card 13: Histopathology Details (Proposal Point 25) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Microscope className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Histopathology Details (Point 25)</h3>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-amber-50/40 p-3 rounded-xl border border-amber-100">
                {patient.histopathologyDetails || "No tissue biopsy specimen submitted or pending laboratory evaluation."}
              </p>
            </div>

            {/* Card 14: Follow-up Details (Proposal Point 24) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Follow-up Details (Point 24)</h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 flex flex-col gap-1.5 text-xs">
                <div>
                  <span className="font-bold text-slate-500 block">Next Review Date:</span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {followUp.date || "Review as needed / SOS"}
                  </span>
                </div>
                {followUp.instructions && (
                  <p className="text-slate-700 mt-1">
                    <strong>Instructions:</strong> {followUp.instructions}
                  </p>
                )}
                {followUp.notes && (
                  <p className="text-slate-600">
                    <strong>Notes:</strong> {followUp.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ROW 7: UPLOAD IMAGES & SCANS PREVIEW (PROPOSAL POINT 18) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FileImage className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Uploaded Medical Images & Scans (Point 18)</h2>
                  <p className="text-[11px] text-slate-500">Radiology X-Rays, Angiograms, Ultrasound Scans & PDFs</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Upload}
                onClick={() => setActiveTab("documents")}
                className="cursor-pointer text-xs"
              >
                Upload Scans
              </Button>
            </div>

            {documents.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="text-xs text-slate-500">No medical scans or image files uploaded yet for this patient record.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {documents.slice(0, 6).map((doc) => {
                  const fileUrl = uploadService.getFileUrl(doc._id || doc.storedName);
                  const isPdf = doc.mimeType === "application/pdf" || doc.originalName?.endsWith(".pdf");

                  return (
                    <a
                      key={doc._id}
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-400 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
                    >
                      {isPdf ? (
                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-sky-100 text-[#0a6cf0] flex items-center justify-center">
                          <FileImage className="w-5 h-5" />
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-slate-800 truncate w-full group-hover:text-[#0a6cf0]">
                        {doc.originalName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(doc.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* SIGNATURE SECTION FOR PRINTABLE CASE SHEET */}
          <div className="hidden print:flex items-center justify-between pt-16 px-6 text-xs text-slate-800">
            <div className="text-center">
              <div className="w-48 border-b border-slate-400 mb-1" />
              <span className="font-bold">Attending Medical Officer</span>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-slate-400 mb-1" />
              <span className="font-bold">Senior Consultant / HOD</span>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-slate-400 mb-1" />
              <span className="font-bold">Hospital Medical Superintendent</span>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: VISITS TIMELINE & MEDICAL HISTORY (MODULE 7 INTEGRATION)
      ========================================================================= */}
      {activeTab === "timeline" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input
                placeholder="Search visits (Diagnosis, Doctor, Treatment)..."
                value={visitSearch}
                onChange={(e) => setVisitSearch(e.target.value)}
                icon={Search}
                className="w-full sm:w-80"
              />
              <Select
                options={["All", "OPD", "IPD / Admission", "Follow-up", "Emergency", "Procedure"]}
                value={visitTypeFilter}
                onChange={(e) => setVisitTypeFilter(e.target.value)}
                className="w-40"
              />
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddVisitModal(true)}>
              Record New Visit
            </Button>
          </div>

          {filteredVisits.length === 0 ? (
            <EmptyState
              icon={History}
              title="No Visits Recorded"
              description="No clinical visit records match your search query."
            />
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 flex flex-col gap-6 my-2">
              {filteredVisits.map((v) => {
                const vDate = v.visitDate ? new Date(v.visitDate).toLocaleDateString("en-IN") : "N/A";
                return (
                  <div key={v._id} className="relative group">
                    <div className="absolute -left-[31px] sm:-left-[39px] top-2 w-6 h-6 rounded-full bg-white border-4 border-[#0a6cf0] flex items-center justify-center shadow-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0a6cf0]" />
                    </div>

                    <Card className="hover:border-blue-300 transition-colors shadow-xs">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#0a6cf0]">
                            <Calendar className="w-4 h-4 text-[#0a6cf0]" />
                            <span>{vDate}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-900 font-sans font-bold">Visit #{v.visitNumber || 1} ({v.visitType})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={v.statusOnDischarge === "Discharged" ? "success" : "primary"}>
                              {v.statusOnDischarge || "Recorded"}
                            </Badge>
                            <Button
                              variant="print"
                              size="xs"
                              icon={Printer}
                              onClick={() => handlePrintVisitReport(v)}
                              title="Print Visit Report"
                            >
                              Print
                            </Button>
                            <Button
                              variant="danger"
                              size="xs"
                              icon={Trash2}
                              onClick={() => setDeleteVisitCandidate(v)}
                              title="Delete Visit Episode"
                              className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 cursor-pointer"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium block">Doctor & Department</span>
                            <span className="font-bold text-slate-900">{v.doctorName || "Dr. Assigned"} ({v.departmentName || "General"})</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block">Diagnosis</span>
                            <span className="font-bold text-sky-800">{v.diagnosis || "Under Evaluation"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block">Treatment / Procedure</span>
                            <span className="font-semibold text-slate-800">{v.treatmentDetails || v.operationProcedureDetails || "Conservative Management"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block">Clinical Advice / Notes</span>
                            <span className="text-slate-600">{v.advice || v.presentingComplaints || v.doctorComments || "Routine checkup."}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: MEDICATIONS REGIMEN
      ========================================================================= */}
      {activeTab === "medications" && (
        <Card title="Active Medication Regimen (Rx Table)" subtitle="Consolidated pharmaceuticals and dosages prescribed to patient">
          {medicationsList.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No Medications on Record"
              description="No prescription drugs have been entered for this patient."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0f6fe] border-b border-blue-100 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-3.5 whitespace-nowrap">#</th>
                    <th className="p-3.5 whitespace-nowrap">Medicine Name</th>
                    <th className="p-3.5 whitespace-nowrap">Dosage</th>
                    <th className="p-3.5 whitespace-nowrap">Frequency</th>
                    <th className="p-3.5 whitespace-nowrap">Duration</th>
                    <th className="p-3.5 whitespace-nowrap">Special Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {medicationsList.map((med, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50">
                      <td className="p-3.5 font-mono font-bold text-slate-400 whitespace-nowrap">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">{med.medicine}</td>
                      <td className="p-3.5 font-semibold text-[#0a6cf0] whitespace-nowrap">{med.dosage}</td>
                      <td className="p-3.5 whitespace-nowrap">{med.frequency}</td>
                      <td className="p-3.5 whitespace-nowrap">{med.duration}</td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">{med.instructions || "After meals"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* =========================================================================
          TAB 4: MEDICAL DOCUMENTS & SCANS
      ========================================================================= */}
      {activeTab === "documents" && (
        <Card title="Diagnostic Scans & Document Archive" subtitle="Radiology X-Rays, CT Scans, Pathology Reports & PDFs">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Filter Category:</span>
                {["All", "Patient Image", "Investigation", "Histopathology", "Other"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDocCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${docCategoryFilter === cat
                        ? "bg-[#0a6cf0] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Upload Area */}
            <FileUpload
              label="Attach Clinical Files & Scans"
              onFilesChange={(files) => handleCategoryFileUpload(files, docCategoryFilter === "All" ? "Other" : docCategoryFilter)}
            />

            {/* Documents Grid */}
            {filteredDocs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No documents uploaded under this category.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => {
                  const fileUrl = uploadService.getFileUrl(doc._id || doc.storedName);
                  const isPdf = doc.mimeType === "application/pdf" || doc.originalName?.endsWith(".pdf");

                  return (
                    <div key={doc._id} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs hover:border-blue-300 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {isPdf ? (
                          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                            <FileText className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0a6cf0] flex items-center justify-center shrink-0">
                            <FileImage className="w-5 h-5" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{doc.originalName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-[#0a6cf0]">{doc.category || "Other"}</span>
                            <span>•</span>
                            <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 p-1 bg-slate-50/90 rounded-xl border border-slate-200/70 shadow-2xs shrink-0">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={actionBtnStyles.view}
                          title="View Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setDeleteDocCandidate(doc)}
                          className={actionBtnStyles.delete}
                          title="Delete File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* =========================================================================
          RECORD VISIT MODAL
      ========================================================================= */}
      {showAddVisitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0a6cf0] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Record New Clinical Visit ({patient.crNo})</h3>
              </div>
              <button onClick={() => setShowAddVisitModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVisitSubmit} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatePicker
                  label="Visit Date"
                  value={visitForm.visitDate}
                  onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                  required
                />
                <Select
                  label="Visit Type"
                  placeholder="Select Visit Type"
                  options={["OPD", "IPD / Admission", "Follow-up", "Emergency", "Procedure"]}
                  value={visitForm.visitType}
                  onChange={(e) => setVisitForm({ ...visitForm, visitType: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Treating Doctor"
                  placeholder="e.g. Dr. Vikramaditya Roy"
                  value={visitForm.doctorName}
                  onChange={(e) => setVisitForm({ ...visitForm, doctorName: e.target.value })}
                />
                <Select
                  label="Department"
                  placeholder="Select Department"
                  options={departments}
                  value={visitForm.departmentName}
                  onChange={(e) => setVisitForm({ ...visitForm, departmentName: e.target.value })}
                />
              </div>

              <Input
                label="Diagnosis Details"
                placeholder="e.g. Acute STEMI Myocardial Infarction"
                value={visitForm.diagnosis}
                onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Textarea
                  label="Presenting Complaints"
                  placeholder="e.g. Chest pain, breathlessness..."
                  value={visitForm.presentingComplaints}
                  onChange={(e) => setVisitForm({ ...visitForm, presentingComplaints: e.target.value })}
                />
                <Textarea
                  label="Physical Findings"
                  placeholder="e.g. Pulse 98 bpm, BP 140/90..."
                  value={visitForm.physicalFindings}
                  onChange={(e) => setVisitForm({ ...visitForm, physicalFindings: e.target.value })}
                />
              </div>

              <Textarea
                label="Treatment Details & Procedures"
                placeholder="e.g. Medications prescribed, angioplasty performed..."
                value={visitForm.treatmentDetails}
                onChange={(e) => setVisitForm({ ...visitForm, treatmentDetails: e.target.value })}
              />

              <Textarea
                label="Clinical Advice & Doctor Comments"
                placeholder="e.g. Low salt diet, daily walk..."
                value={visitForm.advice}
                onChange={(e) => setVisitForm({ ...visitForm, advice: e.target.value })}
              />

              {/* Dynamic Medications Rows */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Prescribed Medications</span>
                  <Button type="button" variant="outline" size="sm" icon={Plus} onClick={handleAddMedicationRow}>
                    Add Medicine
                  </Button>
                </div>
                {visitForm.medications.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-4">
                      <Input
                        placeholder="Medicine"
                        value={row.medicine}
                        onChange={(e) => handleMedicationChange(idx, "medicine", e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Input
                        placeholder="Dosage"
                        value={row.dosage}
                        onChange={(e) => handleMedicationChange(idx, "dosage", e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <Input
                        placeholder="Instructions"
                        value={row.instructions}
                        onChange={(e) => handleMedicationChange(idx, "instructions", e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicationRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => setShowAddVisitModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={isSubmittingVisit ? Loader2 : Save} disabled={isSubmittingVisit}>
                  {isSubmittingVisit ? "Recording Visit..." : "Record Visit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteDocCandidate}
        onClose={() => setDeleteDocCandidate(null)}
        onConfirm={handleConfirmDocDelete}
        title="Remove Document"
        message={`Are you sure you want to remove this document (${deleteDocCandidate?.originalName})?`}
        confirmText="Delete Document"
        variant="danger"
      />

      {/* DELETE PATIENT CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={showDeletePatientModal}
        onClose={() => setShowDeletePatientModal(false)}
        onConfirm={handleDeletePatient}
        title="Delete Patient Record"
        message={`Are you sure you want to permanently delete patient ${patient?.crNo} (${personal?.name})? All visits, clinical observations, and attached documents will be permanently removed.`}
        confirmText={isDeletingPatient ? "Deleting..." : "Delete Record"}
        variant="danger"
        isLoading={isDeletingPatient}
      />

      {/* DELETE VISIT CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteVisitCandidate}
        onClose={() => setDeleteVisitCandidate(null)}
        onConfirm={handleDeleteVisit}
        title="Delete Visit Episode"
        message={`Are you sure you want to delete Visit #${deleteVisitCandidate?.visitNumber} (${deleteVisitCandidate?.visitType}) recorded on ${new Date(deleteVisitCandidate?.visitDate || Date.now()).toLocaleDateString("en-IN")}?`}
        confirmText={isDeletingVisit ? "Deleting..." : "Delete Visit"}
        variant="danger"
        isLoading={isDeletingVisit}
      />
    </div>
  );
};

export default PatientProfile;
