import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Eye,
  List,
  Lock,
  User,
  Phone,
  Building2,
  Stethoscope,
  Activity,
  HeartPulse,
  BedDouble,
  FileText,
  Calendar,
  Clock,
  Microscope,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import { patientService } from "../services/patientService";
import { useToast } from "../hooks/useToast";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { Badge } from "../components/ui/Badge";
import {
  DISEASES_SUGGESTIONS,
  COMPLAINTS_SUGGESTIONS,
  PROCEDURES_SUGGESTIONS,
  DISCHARGE_REMARKS_SUGGESTIONS,
  INVESTIGATION_SUGGESTIONS,
} from "../data/clinicalMasterData";

export const PatientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [patient, setPatient] = useState(null);

  // Active Phase Tab for intuitive editing
  const [activePhase, setActivePhase] = useState("identity"); // "identity", "hospital", "clinical", "treatment"

  // Form State covering all 25 Proposal Fields - All empty initial state
  const [formData, setFormData] = useState({
    // Phase 1: Identity & Contact (Points 2, 5, 6)
    crNo: "",
    ipNo: "",
    name: "",
    fatherGuardianName: "",
    age: "",
    gender: "",
    dob: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    // Phase 2: Hospital & Doctor Care Team (Points 4, 7, 8, 9, 10, 11)
    hospitalNumber: "",
    patientNumber: "",
    ward: "",
    bedNumber: "",
    doctorName: "",
    departmentName: "",
    status: "",
    admissionDate: "",
    dischargeDate: "",

    // Phase 3: Clinical & Diagnostic Findings (Points 12, 13, 14, 15, 19, 25)
    diagnosisDetails: "",
    presentingComplaints: "",
    physicalFindings: "",
    opdFindings: "",
    investigationDetails: "",
    histopathologyDetails: "",

    // Phase 4: Treatment Protocols & Follow-Up (Points 16, 17, 20, 21, 22, 24)
    treatmentDetails: "",
    operationProcedureDetails: "",
    courseInHospital: "",
    doctorComments: "",
    dischargeRemarks: "",
    followUpDate: "",
    followUpInstructions: "",
    followUpNotes: "",
  });

  // Dynamic filter options from patient collection
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
          setFilterOptions({
            doctors: res.data.doctors || [],
            departments: res.data.departments || [],
            wards: res.data.wards || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch filter options in PatientEdit:", err);
      }
    };
    fetchOptions();
  }, []);

  const fetchPatient = useCallback(async () => {
    setLoading(true);
    try {
      const response = await patientService.getPatientById(id);
      if (response.success && response.data) {
        const pat = response.data;
        setPatient(pat);

        const personal = pat.personalDetails || pat.personal || {};
        const contact = pat.contactDetails || pat.contact || {};
        const hospital = pat.hospitalDetails || pat.hospital || {};
        const wardDetails = pat.wardDetails || {};
        const doctorDetails = pat.doctorDetails || {};
        const admission = pat.admissionDetails || pat.admission || {};
        const diagnosis = pat.diagnosis || {};
        const treatment = pat.treatment || {};
        const followUp = pat.followUp || {};

        setFormData({
          // Phase 1
          crNo: pat.crNo || "",
          ipNo: pat.ipNo || hospital.ipNumber || hospital.hospitalNumber || "",
          name: personal.name || personal.patientName || "",
          fatherGuardianName: personal.fatherGuardianName || personal.fatherName || "",
          age: personal.age ?? "",
          gender: personal.gender || "",
          dob: personal.dob || "",
          mobile: contact.mobile || "",
          email: contact.email || "",
          address: contact.address || "",
          city: contact.city || "",
          state: contact.state || "",
          pincode: contact.pincode || "",

          // Phase 2
          hospitalNumber: hospital.hospitalNumber || pat.hospitalNo || "",
          patientNumber: hospital.patientNumber || pat.patientNo || "",
          ward: wardDetails.ward || hospital.ward || "",
          bedNumber: wardDetails.bedNumber || hospital.bedNumber || "",
          doctorName: doctorDetails.doctorName || hospital.doctor || "",
          departmentName: doctorDetails.departmentName || hospital.department || "",
          status: pat.status || pat.statusOnDischarge || hospital.status || "",
          admissionDate: admission.admissionDate || admission.dateOfAdmission || "",
          dischargeDate: admission.dischargeDate || admission.dateOfDischarge || "",

          // Phase 3
          diagnosisDetails: diagnosis.diagnosisDetails || "",
          presentingComplaints: diagnosis.presentingComplaints || "",
          physicalFindings: diagnosis.physicalFindings || "",
          opdFindings: pat.opdFindings || "",
          investigationDetails: pat.investigationDetails || "",
          histopathologyDetails: pat.histopathologyDetails || "",

          // Phase 4
          treatmentDetails: treatment.treatmentDetails || "",
          operationProcedureDetails: treatment.operationProcedureDetails || "",
          courseInHospital: pat.courseInHospital || "",
          doctorComments: pat.doctorComments || "",
          dischargeRemarks: pat.dischargeRemarks || pat.doctorComments || "",
          followUpDate: followUp.date || followUp.followUpDate || "",
          followUpInstructions: followUp.instructions || "",
          followUpNotes: followUp.notes || "",
        });
      }
    } catch (err) {
      console.error("Error fetching patient for edit:", err);
      showToast("Failed to load patient record", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  // Mobile number input sanitization (digits only, max 10)
  const handleMobileChange = (val) => {
    const sanitized = val.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, mobile: sanitized }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // 1. Validation for Name
    if (!formData.name.trim()) {
      showToast("Patient Full Name is required", "error");
      setActivePhase("identity");
      return;
    }

    // 2. Validation for Mobile (Must be exactly 10 digits starting with 6, 7, 8, or 9)
    if (!formData.mobile || !/^[6-9]\d{9}$/.test(formData.mobile)) {
      showToast("Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9", "error");
      setActivePhase("identity");
      return;
    }

    // 3. Validation for Age
    if (!formData.age || Number(formData.age) <= 0 || Number(formData.age) > 130) {
      showToast("Please enter a valid patient age (1 to 130 years)", "error");
      setActivePhase("identity");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        crNo: formData.crNo.trim(),
        ipNo: formData.ipNo.trim(),
        dischargeRemarks: formData.dischargeRemarks.trim(),
        personalDetails: {
          name: formData.name.trim(),
          fatherGuardianName: formData.fatherGuardianName.trim(),
          age: Number(formData.age),
          gender: formData.gender,
          dob: formData.dob,
        },
        contactDetails: {
          mobile: formData.mobile.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        hospitalDetails: {
          hospitalNumber: formData.hospitalNumber.trim() || formData.ipNo.trim(),
          patientNumber: formData.patientNumber.trim(),
          ipNumber: formData.ipNo.trim(),
        },
        wardDetails: {
          ward: formData.ward,
          bedNumber: formData.bedNumber.trim(),
        },
        doctorDetails: {
          doctorName: formData.doctorName,
          departmentName: formData.departmentName,
        },
        admissionDetails: {
          admissionDate: formData.admissionDate,
          dischargeDate: formData.dischargeDate,
        },
        diagnosis: {
          diagnosisDetails: formData.diagnosisDetails.trim(),
          presentingComplaints: formData.presentingComplaints.trim(),
          physicalFindings: formData.physicalFindings.trim(),
        },
        investigationDetails: formData.investigationDetails.trim(),
        treatment: {
          treatmentDetails: formData.treatmentDetails.trim(),
          operationProcedureDetails: formData.operationProcedureDetails.trim(),
        },
        opdFindings: formData.opdFindings.trim(),
        courseInHospital: formData.courseInHospital.trim(),
        status: formData.status,
        statusOnDischarge: formData.status,
        doctorComments: formData.doctorComments.trim(),
        followUp: {
          date: formData.followUpDate,
          instructions: formData.followUpInstructions.trim(),
          notes: formData.followUpNotes.trim(),
        },
        histopathologyDetails: formData.histopathologyDetails.trim(),
      };

      const response = await patientService.updatePatient(patient._id, payload);
      if (response.success) {
        showToast(`Patient record ${patient.crNo} updated successfully!`, "success");
        setUpdateSuccess(true);
      }
    } catch (err) {
      console.error("Update error:", err);
      const errMsg = err.response?.data?.message || "Failed to update patient record";
      showToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-3">
        <Loader2 className="w-10 h-10 text-[#0a6cf0] animate-spin" />
        <span className="font-bold text-slate-800 text-sm">Loading Patient Clinical Record...</span>
        <span className="text-xs text-slate-400">Pre-populating all 25 proposal fields from MongoDB</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-black text-slate-900">Patient Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested patient identifier was not found or has been removed.</p>
        <Button onClick={() => navigate("/patients")} className="mt-4" variant="primary">
          Back to Directory
        </Button>
      </div>
    );
  }

  // Success Confirmation Screen
  if (updateSuccess) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8 animate-fade-in">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center shadow-lg shadow-blue-500/5 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-2">
              Changes Saved Authoritatively
            </span>
            <h2 className="text-2xl font-black text-slate-900">Patient Record Updated Successfully</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 font-medium">
              All clinical parameters for <strong>{formData.name}</strong> (CR No: <span className="font-mono font-bold text-[#0a6cf0]">{patient.crNo}</span>) have been updated in MongoDB.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Button
              variant="primary"
              icon={Eye}
              onClick={() => navigate(`/patients/${patient._id}`)}
              className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20"
            >
              View Updated Dossier (Module 4)
            </Button>
            <Button
              variant="outline"
              icon={List}
              onClick={() => navigate("/patients")}
              className="cursor-pointer border-slate-200 text-slate-700"
            >
              Patient Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* =========================================================================
          BREADCRUMB NAVIGATION
      ========================================================================= */}
      <Breadcrumb
        items={[
          { label: "Patients", path: "/patients" },
          { label: patient.personalDetails?.name || "Patient Dossier", path: `/patients/${patient._id}` },
          { label: `Edit Record (${patient.crNo})` },
        ]}
      />

      {/* =========================================================================
          STICKY TOP HERO BAR (PATIENT DETAILS + CR LOCK + SAVE BUTTON)
      ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-4 z-30 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a6cf0] to-[#0095ff] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-blue-500/20 border-2 border-white">
            {formData.name ? formData.name.charAt(0).toUpperCase() : "P"}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Edit Record: {formData.name || "Patient"}
              </h1>
              <Badge variant={formData.status === "Admitted" ? "danger" : formData.status === "Discharged" ? "success" : "primary"}>
                {formData.status}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
              {/* IMMUTABLE CR NUMBER BADGE */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400" /> CR: {patient.crNo}
              </span>
              <span>{formData.age ? `${formData.age} Yrs` : "--"} • {formData.gender}</span>
              <span>•</span>
              <span>Mobile: <strong className="font-mono text-slate-700">{formData.mobile || "N/A"}</strong></span>
            </div>
          </div>
        </div>

        {/* TOP QUICK ACTION BUTTONS */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(`/patients/${patient._id}`)}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={isSubmitting ? Loader2 : Save}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20 px-5"
          >
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE 4-PHASE TAB SELECTOR
      ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: "identity", label: "1. Identity & Contact", icon: User },
          { id: "hospital", label: "2. Hospital & Doctor Team", icon: Building2 },
          { id: "clinical", label: "3. Clinical & Diagnosis", icon: HeartPulse },
          { id: "treatment", label: "4. Treatment & Follow-Up", icon: Stethoscope },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activePhase === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePhase(tab.id)}
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
          MAIN EDIT FORM COVERING ALL 25 PROPOSAL FIELDS
      ========================================================================= */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* -----------------------------------------------------------------------
            PHASE 1: IDENTITY & RESIDENTIAL CONTACT (POINTS 2, 5, 6)
        ----------------------------------------------------------------------- */}
        {activePhase === "identity" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0a6cf0] flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Phase 1: Patient Identity & Contact Details</h2>
                <p className="text-xs text-slate-500">Demographic parameters, legal guardian & residential address (Points 2, 5, 6)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Full Name */}
              <Input
                label="Full Patient Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Chandra Verma"
                required
              />

              {/* Father / Guardian Name */}
              <Input
                label="Father / Guardian Name"
                value={formData.fatherGuardianName}
                onChange={(e) => setFormData({ ...formData, fatherGuardianName: e.target.value })}
                placeholder="e.g. Shri Om Prakash Verma"
              />

              {/* Age */}
              <Input
                label="Age (Years) *"
                type="number"
                min="1"
                max="130"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 45"
                required
              />

              {/* Gender */}
              <Select
                label="Gender *"
                placeholder="Select Gender"
                options={["Male", "Female", "Other"]}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              />

              {/* Date of Birth */}
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />

              {/* Mobile Phone - STRICT INDIAN VALIDATION */}
              <div>
                <Input
                  label="Mobile Number (10 digits starting with 6,7,8,9) *"
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                />
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  Only 10 digits accepted. First digit: 6, 7, 8, or 9
                </span>
              </div>

              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
              />

              {/* City */}
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Lucknow"
              />

              {/* State */}
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Uttar Pradesh"
              />

              {/* Pincode */}
              <Input
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="e.g. 226001"
              />

              {/* Address */}
              <div className="sm:col-span-2">
                <Input
                  label="Residential Street Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. House No. 42, Gomti Nagar, Lucknow"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 italic">Phase 1 of 4</span>
              <Button
                type="button"
                variant="primary"
                icon={ChevronRight}
                onClick={() => setActivePhase("hospital")}
                className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff]"
              >
                Next: Hospital & Doctor
              </Button>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PHASE 2: HOSPITAL & DOCTOR CARE TEAM (POINTS 4, 7, 8, 9, 10, 11)
        ----------------------------------------------------------------------- */}
        {activePhase === "hospital" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Phase 2: Hospital Allocation & Treating Team</h2>
                <p className="text-xs text-slate-500">Internal tracking numbers, ward allocation, doctors & admission dates (Points 4, 7, 8, 9, 10, 11)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Manual Central Registration Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>CR Number *</span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    मैनुअल संपादन
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.crNo}
                  onChange={(e) => setFormData({ ...formData, crNo: e.target.value })}
                  placeholder="e.g. CR-2026-0001"
                  required
                  className="w-full bg-white border border-sky-300 text-xs rounded-xl px-3.5 py-2.5 text-sky-950 font-mono font-bold focus:border-sky-600 outline-none shadow-2xs"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Central Registration numbers cannot be altered</span>
              </div>

              {/* Manual IP Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>IP Number </span>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    IPD No.
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.ipNo}
                  onChange={(e) => setFormData({ ...formData, ipNo: e.target.value })}
                  placeholder="e.g. IP-2026-042"
                  className="w-full bg-white border border-purple-300 text-xs rounded-xl px-3.5 py-2.5 text-purple-950 font-mono font-bold focus:border-purple-600 outline-none shadow-2xs"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">IP Number / Ward admission number</span>
              </div>

              {/* Hospital File Number */}
              <Input
                label="Hospital File / Case Number"
                value={formData.hospitalNumber}
                onChange={(e) => setFormData({ ...formData, hospitalNumber: e.target.value })}
                placeholder="e.g. HOSP-2026-90"
              />

              {/* Clinical Status */}
              <Select
                label="Patient Clinical Status *"
                placeholder="Select Status"
                options={["Admitted", "Under Treatment", "Discharged", "Pending", "Transferred"]}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />

              {/* Ward Category */}
              <Select
                label="Ward Category"
                placeholder="Select Ward Category"
                options={filterOptions.wards}
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              />

              {/* Bed Number */}
              <Input
                label="Bed Number"
                value={formData.bedNumber}
                onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                placeholder="e.g. Bed-14 or ICU-04"
              />

              {/* Attending Doctor */}
              <div className="flex flex-col">
                <Input
                  label="Attending Doctor"
                  placeholder="Enter or select doctor"
                  list="dynamic-edit-doctors-list"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                />
                <datalist id="dynamic-edit-doctors-list">
                  {filterOptions.doctors.map((doc, idx) => (
                    <option key={idx} value={doc.doctorName}>
                      {doc.departmentName ? `${doc.doctorName} (${doc.departmentName})` : doc.doctorName}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Speciality Department */}
              <div className="flex flex-col">
                <Input
                  label="Department"
                  placeholder="Enter or select department (e.g. Cardiology, Neurology)"
                  list="dynamic-edit-departments-list"
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                />
                <datalist id="dynamic-edit-departments-list">
                  {filterOptions.departments.map((dept, idx) => (
                    <option key={idx} value={dept} />
                  ))}
                </datalist>
              </div>

              {/* Admission Date */}
              <Input
                label="Date of Admission (Point 10)"
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
              />

              {/* Discharge Date */}
              <Input
                label="Date of Discharge (Point 11)"
                type="date"
                value={formData.dischargeDate}
                onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                icon={ChevronLeft}
                onClick={() => setActivePhase("identity")}
                className="cursor-pointer"
              >
                Previous: Identity
              </Button>
              <Button
                type="button"
                variant="primary"
                icon={ChevronRight}
                onClick={() => setActivePhase("clinical")}
                className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff]"
              >
                Next: Clinical & Diagnosis
              </Button>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PHASE 3: CLINICAL & DIAGNOSTIC FINDINGS (POINTS 12, 13, 14, 15, 19, 25)
        ----------------------------------------------------------------------- */}
        {activePhase === "clinical" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Phase 3: Clinical Diagnosis & Diagnostic Investigations</h2>
                <p className="text-xs text-slate-500">Provisional diagnosis, vitals, OPD consultation & lab findings (Points 12, 13, 14, 15, 19, 25)</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Diagnosis Details with Suggestions Datalist */}
              <div className="flex flex-col">
                <Input
                  label="Diagnosis Details"
                  placeholder="Primary provisional / definitive clinical diagnosis..."
                  list="edit-diseases-suggestions-list"
                  value={formData.diagnosisDetails}
                  onChange={(e) => setFormData({ ...formData, diagnosisDetails: e.target.value })}
                />
                <datalist id="edit-diseases-suggestions-list">
                  {DISEASES_SUGGESTIONS.map((dis, idx) => (
                    <option key={idx} value={dis} />
                  ))}
                </datalist>
                <span className="text-[10px] text-slate-400 mt-0.5">Choose from the suggestion list or type a custom name</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Presenting Complaints */}
                <Textarea
                  label="Presenting Complaints (Point 13)"
                  rows={3}
                  value={formData.presentingComplaints}
                  onChange={(e) => setFormData({ ...formData, presentingComplaints: e.target.value })}
                  placeholder="Chief symptoms, duration and onset history..."
                />

                {/* Physical Findings & Vitals */}
                <Textarea
                  label="Physical Findings & Vitals (Point 14)"
                  rows={3}
                  value={formData.physicalFindings}
                  onChange={(e) => setFormData({ ...formData, physicalFindings: e.target.value })}
                  placeholder="BP, Pulse, Respiratory Rate, Temperature, systemic exam..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* OPD Consultation Findings */}
                <Textarea
                  label="OPD Consultation Findings (Point 19)"
                  rows={3}
                  value={formData.opdFindings}
                  onChange={(e) => setFormData({ ...formData, opdFindings: e.target.value })}
                  placeholder="Initial chamber consultation notes and observations..."
                />

                {/* Diagnostic Investigations */}
                <Textarea
                  label="Investigation Details (Point 15)"
                  rows={3}
                  value={formData.investigationDetails}
                  onChange={(e) => setFormData({ ...formData, investigationDetails: e.target.value })}
                  placeholder="Pathology (CBC, LFT, KFT), Radiology (X-Ray, CT, MRI), ECG findings..."
                />
              </div>

              {/* Histopathology Details */}
              <Textarea
                label="Histopathology Details (Point 25)"
                rows={2}
                value={formData.histopathologyDetails}
                onChange={(e) => setFormData({ ...formData, histopathologyDetails: e.target.value })}
                placeholder="Tissue biopsy examination, microscopic findings and pathology impressions..."
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                icon={ChevronLeft}
                onClick={() => setActivePhase("hospital")}
                className="cursor-pointer"
              >
                Previous: Hospital & Doctor
              </Button>
              <Button
                type="button"
                variant="primary"
                icon={ChevronRight}
                onClick={() => setActivePhase("treatment")}
                className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff]"
              >
                Next: Treatment & Follow-Up
              </Button>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PHASE 4: TREATMENT PROTOCOLS & FOLLOW-UP (POINTS 16, 17, 20, 21, 22, 24)
        ----------------------------------------------------------------------- */}
        {activePhase === "treatment" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_2px_14px_rgba(10,80,180,0.04)] flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Phase 4: Treatment Protocols, Procedures & Follow-Up</h2>
                <p className="text-xs text-slate-500">Therapies, surgeries, inpatient course, doctor remarks & review date (Points 16, 17, 20, 21, 22, 24)</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Treatment Details */}
                <Textarea
                  label="Treatment Details (Point 16)"
                  rows={3}
                  value={formData.treatmentDetails}
                  onChange={(e) => setFormData({ ...formData, treatmentDetails: e.target.value })}
                  placeholder="Therapeutic drug regimens, medications, fluids..."
                />

                {/* Operation / Procedure Details */}
                <Textarea
                  label="Operation / Procedure Details (Point 17)"
                  rows={3}
                  value={formData.operationProcedureDetails}
                  onChange={(e) => setFormData({ ...formData, operationProcedureDetails: e.target.value })}
                  placeholder="Surgical procedures performed, OT notes, anesthesia..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Course in Hospital */}
                <Textarea
                  label="Course in Hospital (Point 20)"
                  rows={3}
                  value={formData.courseInHospital}
                  onChange={(e) => setFormData({ ...formData, courseInHospital: e.target.value })}
                  placeholder="Ward progress, clinical evolution during admission..."
                />

                {/* Discharge Remarks with Master Suggestions */}
                <div className="flex flex-col">
                  <Input
                    label="Discharge Remarks"
                    placeholder="e.g. Discharged in stable condition. Advised complete bed rest..."
                    list="edit-discharge-remarks-suggestions-list"
                    className="border-red-200 focus:border-red-500 font-medium"
                    value={formData.dischargeRemarks}
                    onChange={(e) => setFormData({ ...formData, dischargeRemarks: e.target.value })}
                  />
                  <datalist id="edit-discharge-remarks-suggestions-list">
                    {DISCHARGE_REMARKS_SUGGESTIONS.map((rem, idx) => (
                      <option key={idx} value={rem} />
                    ))}
                  </datalist>
                  <span className="text-[10px] text-slate-400 mt-0.5">Discharge Remarks will be displayed at the end of the discharge print.</span>
                </div>
              </div>

              {/* Doctor's Comments */}
              <Textarea
                label="Doctor's Comments & Advice (Point 22)"
                rows={2}
                value={formData.doctorComments}
                onChange={(e) => setFormData({ ...formData, doctorComments: e.target.value })}
                placeholder="Consultant remarks, lifestyle modifications, precautions..."
              />

              {/* Follow-up Details Card */}
              <div className="p-4 rounded-2xl bg-[#f0f6fe]/40 border border-blue-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Follow-Up Date (Point 24)"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                />

                <Input
                  label="Follow-Up Instructions"
                  value={formData.followUpInstructions}
                  onChange={(e) => setFormData({ ...formData, followUpInstructions: e.target.value })}
                  placeholder="e.g. Review with blood count report"
                />

                <Input
                  label="Follow-Up Notes"
                  value={formData.followUpNotes}
                  onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                  placeholder="e.g. SOS if fever recurs"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                icon={ChevronLeft}
                onClick={() => setActivePhase("clinical")}
                className="cursor-pointer"
              >
                Previous: Clinical & Diagnosis
              </Button>

              <Button
                type="submit"
                variant="primary"
                icon={isSubmitting ? Loader2 : Save}
                disabled={isSubmitting}
                className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20 px-6"
              >
                {isSubmitting ? "Saving All Changes..." : "Save All Changes"}
              </Button>
            </div>
          </div>
        )}

        {/* =======================================================================
            BOTTOM GLOBAL ACTION BAR
        ======================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Editing: <strong className="text-slate-900">{formData.name}</strong> (CR: <span className="font-mono text-[#0a6cf0] font-bold">{patient.crNo}</span>)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/patients/${patient._id}`)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={isSubmitting ? Loader2 : Save}
              disabled={isSubmitting}
              className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? "Saving..." : "Save Record Changes"}
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default PatientEdit;
