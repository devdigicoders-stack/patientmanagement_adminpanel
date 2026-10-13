import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UserPlus,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  Loader2,
  Eye,
  Edit,
  ArrowRight,
  ArrowLeft,
  User,
  Building2,
  Stethoscope,
  Pill,
  Printer,
  FileText,
  Calendar,
  Phone,
  MapPin,
  BedDouble,
  ShieldCheck,
  Activity,
  HeartPulse,
  Upload,
  Check
} from "lucide-react";
import { patientService } from "../services/patientService";
import { uploadService } from "../services/uploadService";
import { useToast } from "../hooks/useToast";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { DatePicker } from "../components/ui/DatePicker";
import { FileUpload } from "../components/ui/FileUpload";
import { Breadcrumb } from "../components/ui/Breadcrumb";

// Zod Validation Schema for Patient Registration
const patientRegistrationSchema = z.object({
  personalDetails: z.object({
    name: z.string().min(2, "Patient name is required (min 2 chars)"),
    fatherGuardianName: z.string().optional(),
    age: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
      z.number({ required_error: "Patient age is required", invalid_type_error: "Age must be a valid number" })
        .min(0, "Age cannot be negative")
        .max(120, "Please enter a reasonable age (0-120)")
    ),
    gender: z.string().min(1, "Please select a gender"),
    dob: z.string().optional(),
  }),
  contactDetails: z.object({
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .or(z.literal(""))
      .optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be a valid 6-digit code")
      .or(z.literal(""))
      .optional(),
  }),
  hospitalDetails: z.object({
    hospitalNumber: z.string().optional(),
    patientNumber: z.string().optional(),
  }),
  wardDetails: z.object({
    ward: z.string().optional(),
    bedNumber: z.string().optional(),
  }),
  doctorDetails: z.object({
    doctorName: z.string().optional(),
    departmentName: z.string().optional(),
  }),
  admissionDetails: z.object({
    admissionDate: z.string().min(1, "Date of Admission is required"),
    dischargeDate: z.string().optional(),
  }).refine(
    (data) => {
      if (data.admissionDate && data.dischargeDate) {
        return new Date(data.dischargeDate) >= new Date(data.admissionDate);
      }
      return true;
    },
    {
      message: "Discharge date cannot be earlier than admission date",
      path: ["dischargeDate"],
    }
  ),
  diagnosis: z.object({
    diagnosisDetails: z.string().optional(),
    presentingComplaints: z.string().optional(),
    physicalFindings: z.string().optional(),
  }).optional(),
  investigationDetails: z.string().optional(),
  treatment: z.object({
    treatmentDetails: z.string().optional(),
    operationProcedureDetails: z.string().optional(),
  }).optional(),
  opdFindings: z.string().optional(),
  courseInHospital: z.string().optional(),
  status: z.string().optional(),
  doctorComments: z.string().optional(),
  medications: z
    .array(
      z.object({
        medicine: z.string().optional(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
        duration: z.string().optional(),
        instructions: z.string().optional(),
      })
    )
    .optional(),
  followUp: z.object({
    date: z.string().optional(),
    instructions: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  histopathologyDetails: z.string().optional(),
});

export const PatientRegistration = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Active Wizard Step (1: Identity, 2: Ward & Doctor, 3: Diagnosis & Findings, 4: Treatment & Discharge)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(null);
  const [selectedRawFiles, setSelectedRawFiles] = useState([]);

  // React Hook Form initialization - ALL EMPTY DEFAULTS WITH PLACEHOLDERS
  const {
    register,
    handleSubmit,
    control,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      personalDetails: {
        name: "",
        fatherGuardianName: "",
        age: "",
        gender: "",
        dob: "",
      },
      contactDetails: {
        mobile: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      },
      hospitalDetails: {
        hospitalNumber: "",
        patientNumber: "",
      },
      wardDetails: {
        ward: "",
        bedNumber: "",
      },
      doctorDetails: {
        doctorName: "",
        departmentName: "",
      },
      admissionDetails: {
        admissionDate: "",
        dischargeDate: "",
      },
      diagnosis: {
        diagnosisDetails: "",
        presentingComplaints: "",
        physicalFindings: "",
      },
      investigationDetails: "",
      treatment: {
        treatmentDetails: "",
        operationProcedureDetails: "",
      },
      opdFindings: "",
      courseInHospital: "",
      status: "",
      doctorComments: "",
      medications: [
        { medicine: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ],
      followUp: {
        date: "",
        instructions: "",
        notes: "",
      },
      histopathologyDetails: "",
    },
  });

  // Watch key values for live summary header
  const watchedName = useWatch({ control, name: "personalDetails.name" });
  const watchedAge = useWatch({ control, name: "personalDetails.age" });
  const watchedGender = useWatch({ control, name: "personalDetails.gender" });
  const watchedMobile = useWatch({ control, name: "contactDetails.mobile" });
  const watchedCity = useWatch({ control, name: "contactDetails.city" });
  const watchedDoctor = useWatch({ control, name: "doctorDetails.doctorName" });
  const watchedWard = useWatch({ control, name: "wardDetails.ward" });
  const watchedStatus = useWatch({ control, name: "status" });

  const { fields: medicationFields, append: appendMedication, remove: removeMedication } = useFieldArray({
    control,
    name: "medications",
  });

  // Dynamic departments, wards, and doctors fetched directly from patient collection
  const [dynamicOptions, setDynamicOptions] = useState({
    doctors: [],
    departments: [],
    wards: [],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await patientService.getFilterOptions();
        if (res.success && res.data) {
          setDynamicOptions({
            doctors: res.data.doctors || [],
            departments: res.data.departments || [],
            wards: res.data.wards || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch dynamic filter options in PatientRegistration:", err);
      }
    };
    fetchOptions();
  }, []);

  // Step definition array
  const steps = [
    {
      id: 1,
      title: "Patient Identity & Contact",
      desc: "Personal, Contact, Address & Hospital IDs",
      icon: User,
    },
    {
      id: 2,
      title: "Ward & Doctor Assignment",
      desc: "Bed, Doctor, Dept, Admission & Status",
      icon: Building2,
    },
    {
      id: 3,
      title: "Clinical Diagnosis & Findings",
      desc: "Complaints, Physical Vitals, OPD & Labs",
      icon: Stethoscope,
    },
    {
      id: 4,
      title: "Treatment, Rx & Discharge",
      desc: "Surgery, Medications, Follow-up & Uploads",
      icon: Pill,
    },
  ];

  // Validate only fields relevant to current step before moving forward
  const handleNextStep = async () => {
    let isValid = true;
    if (currentStep === 1) {
      isValid = await trigger([
        "personalDetails.name",
        "personalDetails.age",
        "personalDetails.gender",
        "contactDetails.mobile",
      ]);
    } else if (currentStep === 2) {
      isValid = await trigger(["admissionDetails.admissionDate", "status"]);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 120, behavior: "smooth" });
    } else {
      showToast("Please fill all required fields before proceeding", "error");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // 1. Submit patient payload to backend Express API
      const response = await patientService.createPatient(data);

      if (response.success && response.data) {
        const createdPatient = response.data;

        // 2. Upload any selected files to backend upload endpoint if present
        if (selectedRawFiles.length > 0) {
          for (const item of selectedRawFiles) {
            if (item.rawFile) {
              try {
                await uploadService.uploadFile(createdPatient._id, item.rawFile);
              } catch (fileErr) {
                console.error("File upload failed:", fileErr);
              }
            }
          }
        }

        showToast(`Patient Registered Successfully! CR No: ${createdPatient.crNo}`, "success");
        setRegisteredSuccess(createdPatient);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to register patient";
      showToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setRegisteredSuccess(null);
    setSelectedRawFiles([]);
    setCurrentStep(1);
    reset();
  };

  const handlePrintSlip = () => {
    window.print();
  };

  // SUCCESS SCREEN: CLINICAL ADMISSION SLIP (WITH PRINT SUPPORT)
  if (registeredSuccess) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto py-6 animate-fade-in">
        <Breadcrumb items={[{ label: "Patients", path: "/patients" }, { label: "Registration Complete" }]} />

        {/* Printable Admission Slip Card */}
        <div className="bg-white rounded-3xl border border-blue-200/80 shadow-[0_8px_30px_rgba(10,80,180,0.08)] overflow-hidden print:border-none print:shadow-none">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0a6cf0] via-[#0095ff] to-sky-500 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                <CheckCircle2 className="w-9 h-9 text-white animate-bounce" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Patient Intake Completed
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Patient Registered Successfully</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                  Official clinical intake card generated and archived in Hospital Database.
                </p>
              </div>
            </div>

            {/* Print Action on Top */}
            <button
              onClick={handlePrintSlip}
              className="print:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0a6cf0] font-bold text-xs sm:text-sm shadow-md hover:bg-blue-50 transition-all cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4" /> Print Admission Slip
            </button>
          </div>

          {/* Slip Body */}
          <div className="p-6 sm:p-8 flex flex-col gap-6">
            {/* Authoritative CR Number Highlight Box */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#f0f6fe] border border-blue-200/80">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                  Central Registration Number (CR No.)
                </span>
                <span className="text-3xl sm:text-4xl font-mono font-black text-[#0a6cf0] tracking-wider mt-0.5">
                  {registeredSuccess.crNo}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Unique Medical Record Identifier • Generated automatically by backend
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Status: {registeredSuccess.status || "Admitted"}
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  {registeredSuccess.wardDetails?.ward || "General Ward"}
                </span>
              </div>
            </div>

            {/* 4-Column Clinical Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient Details</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">
                  {registeredSuccess.personalDetails?.name}
                </span>
                <span className="text-xs text-slate-600 block mt-0.5">
                  {registeredSuccess.personalDetails?.age} Yrs • {registeredSuccess.personalDetails?.gender}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  S/O / W/O: {registeredSuccess.personalDetails?.fatherGuardianName || "N/A"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact & Address</span>
                <span className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#0a6cf0]" /> {registeredSuccess.contactDetails?.mobile}
                </span>
                <span className="text-xs text-slate-600 block mt-1">
                  {registeredSuccess.contactDetails?.city}, {registeredSuccess.contactDetails?.state}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {registeredSuccess.contactDetails?.address || "Address not specified"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Treating Unit</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">
                  {registeredSuccess.doctorDetails?.doctorName || "Dr. Assigned"}
                </span>
                <span className="text-xs text-[#0a6cf0] font-semibold block mt-0.5">
                  Dept: {registeredSuccess.doctorDetails?.departmentName || "General"}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Bed: {registeredSuccess.wardDetails?.bedNumber || "Not allocated"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admission Date</span>
                <span className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {registeredSuccess.admissionDetails?.admissionDate || new Date().toISOString().split("T")[0]}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Hosp #: {registeredSuccess.hospitalDetails?.hospitalNumber || "N/A"}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Patient #: {registeredSuccess.hospitalDetails?.patientNumber || "N/A"}
                </span>
              </div>
            </div>

            {/* Diagnosis & Treatment Preview */}
            {(registeredSuccess.diagnosis?.diagnosisDetails || registeredSuccess.diagnosis?.presentingComplaints) && (
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#0a6cf0]" /> Initial Clinical Diagnosis & Presentation
                </span>
                <p className="text-xs text-slate-700 font-medium">
                  <strong>Diagnosis:</strong> {registeredSuccess.diagnosis?.diagnosisDetails || "Under Clinical Evaluation"}
                </p>
                {registeredSuccess.diagnosis?.presentingComplaints && (
                  <p className="text-xs text-slate-600">
                    <strong>Chief Complaints:</strong> {registeredSuccess.diagnosis?.presentingComplaints}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons for User Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 print:hidden">
              <Button
                type="button"
                variant="outline"
                icon={Plus}
                onClick={handleRegisterAnother}
                className="cursor-pointer"
              >
                Register Another Patient
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  icon={Edit}
                  onClick={() => navigate(`/patients/${registeredSuccess._id}/edit`)}
                  className="cursor-pointer"
                >
                  Edit Record
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  icon={Eye}
                  onClick={() => navigate(`/patients/${registeredSuccess._id}`)}
                  className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff]"
                >
                  View Patient Dossier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      <Breadcrumb items={[{ label: "Dashboard", path: "/dashboard" }, { label: "Patient Registration" }]} />

      {/* STICKY LIVE SUMMARY & TOP ACTIONS BAR */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-[0_2px_12px_rgba(10,80,180,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-20 z-20">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0a6cf0] to-[#0095ff] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {watchedName?.trim() ? watchedName : "New Patient Registration"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0a6cf0] border border-blue-200">
                CR: Auto-Generated
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
              <span>{watchedAge ? `${watchedAge} Yrs` : "Age pending"} • {watchedGender || "Gender pending"}</span>
              <span>•</span>
              <span className="font-medium text-slate-700">{watchedMobile || "Mobile pending"}</span>
              {watchedWard && (
                <>
                  <span>•</span>
                  <span>{watchedWard}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top Direct Action: Save Patient Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCancel}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={isSubmitting ? Loader2 : Save}
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {isSubmitting ? "Registering..." : "Save Patient"}
          </Button>
        </div>
      </div>

      {/* 4-STEP INTERACTIVE PROGRESS STEPPER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${isActive
                    ? "bg-[#e8f2fe] border-2 border-[#0a6cf0] text-slate-900 shadow-xs"
                    : isCompleted
                      ? "bg-slate-50/80 border border-emerald-200 text-slate-700 hover:bg-slate-100"
                      : "bg-transparent border border-transparent text-slate-400 hover:bg-slate-50"
                  }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${isActive
                      ? "bg-[#0a6cf0] text-white shadow-xs"
                      : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.id}
                </div>
                <div className="flex flex-col truncate">
                  <span className={`text-xs font-bold truncate ${isActive ? "text-[#0a6cf0]" : "text-slate-800"}`}>
                    {s.title}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate hidden sm:block">
                    {s.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* MAIN FORM BODY */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* =========================================================================
            PHASE 1: PATIENT IDENTITY & CONTACT (PROPOSAL POINTS 4, 5, 6, 7)
        ========================================================================= */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* 1.1 Personal Details Card (Proposal Point 5) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0a6cf0] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Patient Personal Details</h2>
                  <p className="text-xs text-slate-500">Demographic identity & vital personal parameters (Proposal Point 5)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Patient Full Name"
                  placeholder="e.g. Ramesh Kumar Verma"
                  required
                  {...register("personalDetails.name")}
                  error={errors.personalDetails?.name?.message}
                />
                <Input
                  label="Father / Guardian Name"
                  placeholder="e.g. Shri Shyam Lal Verma"
                  {...register("personalDetails.fatherGuardianName")}
                  error={errors.personalDetails?.fatherGuardianName?.message}
                />
                <Input
                  label="Age (in Years)"
                  type="number"
                  placeholder="e.g. 45"
                  required
                  {...register("personalDetails.age")}
                  error={errors.personalDetails?.age?.message}
                />
                <Select
                  label="Gender"
                  placeholder="Select Gender"
                  options={["Male", "Female", "Other"]}
                  required
                  {...register("personalDetails.gender")}
                  error={errors.personalDetails?.gender?.message}
                />
                <DatePicker
                  label="Date of Birth (Optional)"
                  {...register("personalDetails.dob")}
                  error={errors.personalDetails?.dob?.message}
                />
                <Input
                  label="Generated CR Number"
                  placeholder="Auto-generated on save (e.g. CR-2026-00001)"
                  readOnly
                  disabled
                  className="font-mono text-xs text-slate-500 bg-slate-50 cursor-not-allowed"
                  helperText="Unique central registration ID generated on registration"
                />
              </div>
            </div>

            {/* 1.2 Contact & Address Details Card (Proposal Point 6) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Contact & Address Details</h2>
                  <p className="text-xs text-slate-500">Communication lines & geographical residence (Proposal Point 6)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Mobile Number"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  required
                  maxLength={10}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  }}
                  {...register("contactDetails.mobile")}
                  error={errors.contactDetails?.mobile?.message}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. patient@example.com"
                  {...register("contactDetails.email")}
                  error={errors.contactDetails?.email?.message}
                />
                <Input
                  label="City"
                  placeholder="e.g. Lucknow"
                  {...register("contactDetails.city")}
                  error={errors.contactDetails?.city?.message}
                />
                <Input
                  label="Residential Address"
                  placeholder="e.g. H.No 24, Hazratganj, Park Road"
                  className="sm:col-span-2"
                  {...register("contactDetails.address")}
                  error={errors.contactDetails?.address?.message}
                />
                <Input
                  label="State"
                  placeholder="e.g. Uttar Pradesh"
                  {...register("contactDetails.state")}
                  error={errors.contactDetails?.state?.message}
                />
                <Input
                  label="Pincode"
                  placeholder="e.g. 226001"
                  {...register("contactDetails.pincode")}
                  error={errors.contactDetails?.pincode?.message}
                />
              </div>
            </div>

            {/* 1.3 Hospital / Patient Tracking Numbers Card (Proposal Point 7) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Hospital & Patient Identifier Numbers</h2>
                  <p className="text-xs text-slate-500">Internal hospital tracking IDs (Proposal Point 7)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Hospital Number"
                  placeholder="e.g. HOSP-10293"
                  {...register("hospitalDetails.hospitalNumber")}
                />
                <Input
                  label="Patient File Number"
                  placeholder="e.g. P-49120"
                  {...register("hospitalDetails.patientNumber")}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PHASE 2: WARD, DOCTOR & ADMISSION (PROPOSAL POINTS 8, 9, 10, 11, 21)
        ========================================================================= */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* 2.1 Ward and Bed Details (Proposal Point 8) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <BedDouble className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Ward & Bed Details</h2>
                  <p className="text-xs text-slate-500">Clinical ward assignment & bed allocation (Proposal Point 8)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Assigned Ward"
                  placeholder="Select Ward"
                  options={dynamicOptions.wards}
                  {...register("wardDetails.ward")}
                />
                <Input
                  label="Bed Number"
                  placeholder="e.g. GMW-04 or CCU-02"
                  {...register("wardDetails.bedNumber")}
                />
              </div>
            </div>

            {/* 2.2 Doctor and Department Details (Proposal Point 9) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Doctor & Department Details</h2>
                  <p className="text-xs text-slate-500">Assigned medical consultant & specialty department (Proposal Point 9)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <Input
                    label="Attending Doctor"
                    placeholder="Enter or select doctor"
                    list="dynamic-doctors-list"
                    {...register("doctorDetails.doctorName")}
                    error={errors.doctorDetails?.doctorName?.message}
                  />
                  <datalist id="dynamic-doctors-list">
                    {dynamicOptions.doctors.map((doc, idx) => (
                      <option key={idx} value={doc.doctorName}>
                        {doc.departmentName ? `${doc.doctorName} (${doc.departmentName})` : doc.doctorName}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div className="flex flex-col">
                  <Input
                    label="Clinical Department"
                    placeholder="Enter Clinical Department (e.g. Cardiology, Neurology)"
                    list="dynamic-departments-list"
                    {...register("doctorDetails.departmentName")}
                    error={errors.doctorDetails?.departmentName?.message}
                  />
                  <datalist id="dynamic-departments-list">
                    {dynamicOptions.departments.map((dept, idx) => (
                      <option key={idx} value={dept} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* 2.3 Date of Admission, Discharge & Patient Status (Proposal Points 10, 11, 21) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Admission & Discharge Dates</h2>
                  <p className="text-xs text-slate-500">Clinical admission timeline & active status (Proposal Points 10, 11, 21)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DatePicker
                  label="Date of Admission"
                  required
                  {...register("admissionDetails.admissionDate")}
                  error={errors.admissionDetails?.admissionDate?.message}
                />
                <DatePicker
                  label="Planned / Actual Date of Discharge"
                  {...register("admissionDetails.dischargeDate")}
                  error={errors.admissionDetails?.dischargeDate?.message}
                />
                <Select
                  label="Patient Clinical Status"
                  placeholder="Select Status"
                  options={["Admitted", "Discharged", "Under Treatment", "Pending"]}
                  {...register("status")}
                  error={errors.status?.message}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PHASE 3: CLINICAL DIAGNOSIS & FINDINGS (PROPOSAL POINTS 12, 13, 14, 15, 19)
        ========================================================================= */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* 3.1 Diagnosis, Complaints & Physical Findings (Points 12, 13, 14) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Clinical Diagnosis & Examination</h2>
                  <p className="text-xs text-slate-500">Diagnostic formulation, presenting symptoms & physical vitals (Points 12, 13, 14)</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Input
                  label="Diagnosis Details"
                  placeholder="e.g. Acute Anterior Wall Myocardial Infarction (STEMI), Type 2 Diabetes"
                  {...register("diagnosis.diagnosisDetails")}
                />
                <Textarea
                  label="Presenting Complaints"
                  placeholder="e.g. Severe retrosternal chest pain radiating to left arm for 3 hours, associated with heavy diaphoresis and nausea..."
                  {...register("diagnosis.presentingComplaints")}
                />
                <Textarea
                  label="Physical Examination Findings & Vitals"
                  placeholder="e.g. Pulse: 98 bpm regular, BP: 140/90 mmHg, SpO2: 95% on room air, Temp: 98.6 F. Chest: Bilateral clear..."
                  {...register("diagnosis.physicalFindings")}
                />
              </div>
            </div>

            {/* 3.2 OPD Consultation Findings (Proposal Point 19) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">OPD Consultation Findings</h2>
                  <p className="text-xs text-slate-500">Outpatient clinical review & observations (Proposal Point 19)</p>
                </div>
              </div>

              <Textarea
                label="OPD Findings"
                placeholder="e.g. Patient conscious and oriented. Cardiac enzymes elevated. Recommended immediate admission to CCU..."
                {...register("opdFindings")}
              />
            </div>

            {/* 3.3 Investigation Details (Proposal Point 15) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Diagnostic Investigation Details</h2>
                  <p className="text-xs text-slate-500">Laboratory, Pathology, ECG & Radiology reports (Proposal Point 15)</p>
                </div>
              </div>

              <Textarea
                label="Investigation Details"
                placeholder="e.g. ECG: ST elevation in V1-V4. Troponin-I: Positive (3.4 ng/mL). Echo: Anterior wall hypokinesia, EF 48%. CBC: Hb 13.2 g/dL..."
                {...register("investigationDetails")}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            PHASE 4: TREATMENT, MEDS & DISCHARGE (POINTS 16, 17, 18, 20, 22, 23, 24, 25)
        ========================================================================= */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* 4.1 Treatment & Operation Details (Proposal Points 16, 17, 20) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0a6cf0] flex items-center justify-center shrink-0">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Treatment, Procedure & Hospital Course</h2>
                  <p className="text-xs text-slate-500">Interventions, surgeries & day-to-day progression (Points 16, 17, 20)</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Textarea
                  label="Treatment Details"
                  placeholder="e.g. Dual antiplatelet therapy (Aspirin + Clopidogrel), Atorvastatin 80mg, IV Heparin infusion, beta blockers..."
                  {...register("treatment.treatmentDetails")}
                />
                <Textarea
                  label="Operation / Surgical Procedure Details"
                  placeholder="e.g. Coronary Angiography via right radial approach. Primary PCI with 1 Drug-Eluting Stent (DES 3.0 x 24mm) to Mid-LAD..."
                  {...register("treatment.operationProcedureDetails")}
                />
                <Textarea
                  label="Course in Hospital"
                  placeholder="e.g. Monitored in CCU for 48 hours post-procedure. Vitals remained stable, no groin hematoma or recurrent chest pain..."
                  {...register("courseInHospital")}
                />
              </div>
            </div>

            {/* 4.2 Medication & Advice Details (Proposal Point 23) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">Advice & Medication Details (Rx Table)</h2>
                    <p className="text-xs text-slate-500">Prescription table & dosage plan (Proposal Point 23)</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => appendMedication({ medicine: "", dosage: "", frequency: "", duration: "", instructions: "" })}
                  className="cursor-pointer"
                >
                  Add Medicine
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                {medicationFields.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 bg-[#f0f6fe]/70 border border-blue-100 rounded-xl items-center"
                  >
                    <div className="sm:col-span-3">
                      <Input
                        placeholder="Medicine Name (e.g. Tab Ecospirin)"
                        {...register(`medications.${index}.medicine`)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Dosage (e.g. 75 mg)"
                        {...register(`medications.${index}.dosage`)}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Select
                        placeholder="Select Frequency"
                        options={["Once Daily (OD)", "Twice Daily (BD)", "Thrice Daily (TDS)", "At Bedtime (HS)", "SOS (As Needed)"]}
                        {...register(`medications.${index}.frequency`)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Duration (e.g. 1 Month)"
                        {...register(`medications.${index}.duration`)}
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <Input
                        placeholder="Instructions"
                        {...register(`medications.${index}.instructions`)}
                      />
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title="Remove Medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4.3 Doctor Comments, Follow-up & Histopathology (Points 22, 24, 25) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Doctor Comments & Follow-up Instructions</h2>
                  <p className="text-xs text-slate-500">Consultant review, biopsy & review plan (Points 22, 24, 25)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Textarea
                  label="Doctor's Comments"
                  placeholder="e.g. Patient successfully reperfused. Advised strict compliance to dual antiplatelets and low-salt cardiac diet..."
                  className="sm:col-span-2"
                  {...register("doctorComments")}
                />
                <DatePicker
                  label="Follow-up Review Date"
                  {...register("followUp.date")}
                />
                <Input
                  label="Follow-up Instructions"
                  placeholder="e.g. Repeat ECG, Lipid Profile & Serum Creatinine prior to visit"
                  {...register("followUp.instructions")}
                />
                <Textarea
                  label="Histopathology / Biopsy Details"
                  placeholder="e.g. Biopsy/Tissue specimen details, micro/macroscopic lab findings..."
                  className="sm:col-span-2"
                  {...register("histopathologyDetails")}
                />
              </div>
            </div>

            {/* 4.4 Upload Images & Medical Scans (Proposal Point 18) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Upload Images & Scans</h2>
                  <p className="text-xs text-slate-500">Radiology X-Rays, CT Scans, ECG Strips & Reports (Proposal Point 18)</p>
                </div>
              </div>

              <FileUpload
                label="Attach Medical Image Scans or Laboratory PDFs (Max 10MB)"
                onFilesChange={(files) => setSelectedRawFiles(files)}
              />
            </div>
          </div>
        )}

        {/* STEPPER NAVIGATION FOOTER BAR */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
          <div>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="secondary"
                icon={ArrowLeft}
                onClick={handlePrevStep}
                className="cursor-pointer"
              >
                Previous Step
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="cursor-pointer text-slate-600"
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                icon={ArrowRight}
                onClick={handleNextStep}
                className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-md shadow-blue-500/20"
              >
                Continue to Step {currentStep + 1}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={isSubmitting ? Loader2 : Save}
                disabled={isSubmitting}
                className="cursor-pointer bg-gradient-to-r from-[#0a6cf0] to-[#0095ff] shadow-lg shadow-blue-500/25 px-8"
              >
                {isSubmitting ? "Registering Patient..." : "Complete & Save Registration"}
              </Button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
};

export default PatientRegistration;