import React, { useRef } from "react";
import {
  Printer,
  Download,
  X,
  Building2,
  FileText,
  User,
  Calendar,
  Stethoscope,
  HeartPulse,
  Pill,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import Button from "../ui/Button";
import reportService from "../../services/reportService";

export const DischargePrintModal = ({ patient, isOpen, onClose }) => {
  const printAreaRef = useRef(null);

  if (!isOpen || !patient) return null;

  const personal = patient.personalDetails || {};
  const contact = patient.contactDetails || {};
  const hospital = patient.hospitalDetails || {};
  const doctor = patient.doctorDetails || {};
  const ward = patient.wardDetails || {};
  const admission = patient.admissionDetails || {};
  const diagnosis = patient.diagnosis || {};
  const treatment = patient.treatment || {};
  const followUp = patient.followUp || {};
  const medications = patient.medications || [];

  const crNumber = patient.crNo || "N/A";
  const ipNumber = patient.ipNo || hospital.ipNumber || hospital.hospitalNumber || "N/A";
  const dischargeRemarks = patient.dischargeRemarks || patient.doctorComments || "Discharged in stable condition. Advised follow-up as prescribed.";

  const handlePrint = () => {
    window.print();
  };

  const pdfUrl = reportService.getPatientPdfUrl(patient._id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      {/* Container holding Modal Controls & Printable A4 Sheet */}
      <div className="flex flex-col items-center w-full max-w-4xl max-h-[96vh] my-auto">
        
        {/* Top Control Bar (Screen only, hidden on print) */}
        <div className="w-full bg-slate-900 text-white rounded-t-2xl px-5 py-3.5 flex items-center justify-between shadow-xl print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                A4 Single Page Discharge Slip Preview
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/30 text-sky-300 border border-sky-400/40">
                  CR: {crNumber}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/30 text-purple-300 border border-purple-400/40">
                  IP: {ipNumber}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Optimized Single A4 Page Format
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Print directly to A4 Printer or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Slip</span>
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              title="Download Server-generated PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area on Screen */}
        <div className="w-full bg-slate-200/90 p-3 sm:p-6 rounded-b-2xl overflow-y-auto max-h-[82vh] flex justify-center print:p-0 print:m-0 print:bg-white print:max-h-none print:overflow-visible">
          
          {/* =========================================================================
              THE EXACT SINGLE-PAGE A4 DISCHARGE SUMMARY DOCUMENT
              Strictly engineered to fit on 1 Page A4 with @media print rules
          ========================================================================= */}
          <div
            id="discharge-summary-print-container"
            ref={printAreaRef}
            className="bg-white text-slate-900 shadow-2xl rounded-sm p-6 sm:p-7 w-full max-w-[210mm] min-h-[297mm] flex flex-col justify-between box-border border border-slate-300 print:border-none print:shadow-none print:p-0 print:w-full print:min-h-0 print:h-full text-[11px] leading-[1.35]"
          >
            {/* Inline Print Styles ensuring exact single-page containment */}
            <style>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 6mm 8mm;
                }
                html, body {
                  height: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body * {
                  visibility: hidden !important;
                }
                #discharge-summary-print-container,
                #discharge-summary-print-container * {
                  visibility: visible !important;
                }
                #discharge-summary-print-container {
                  position: absolute !important;
                  top: 0 !important;
                  left: 0 !important;
                  right: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  max-height: 100vh !important;
                  padding: 4mm 6mm !important;
                  box-sizing: border-box !important;
                  background: white !important;
                  border: none !important;
                  box-shadow: none !important;
                }
              }
            `}</style>

            <div>
              {/* 1. OFFICIAL HOSPITAL LETTERHEAD */}
              <div className="border-b-2 border-slate-900 pb-2.5 mb-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-sky-700 text-white flex items-center justify-center font-black text-xl shrink-0 border border-sky-800 shadow-xs">
                      +
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-950">
                        DIGICODERS SUPER SPECIALTY HOSPITAL
                      </h1>
                      <p className="text-[10px] text-slate-600 font-medium">
                        Multi-Specialty Healthcare & Trauma Center • 24x7 Emergency Services
                      </p>
                      <p className="text-[9.5px] text-slate-500">
                        Sector-C, Aliganj / Hazratganj, Lucknow, UP • Helpline: +91 91409 67607 • Reg. No: HSP/UP/2026/8941
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block bg-slate-900 text-white px-2.5 py-1 rounded text-[11px] font-black tracking-wider uppercase">
                      DISCHARGE SUMMARY
                    </span>
                    <span className="block text-[10px] font-bold text-slate-700 mt-1">
                      (IPD)
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. PATIENT DEMOGRAPHICS & CR / IP NUMBER HIGHLIGHT BOX */}
              <div className="border border-slate-300 rounded-md bg-slate-50/70 p-2.5 mb-2.5">
                <div className="grid grid-cols-4 gap-x-3 gap-y-1 text-[10.5px]">
                  
                  {/* CR & IP NUMBERS PROMINENT */}
                  <div className="col-span-2 flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-300 shadow-2xs">
                    <span className="font-bold text-slate-900">CR Number:</span>
                    <span className="font-mono font-black text-xs text-sky-800">{crNumber}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-300 shadow-2xs">
                    <span className="font-bold text-slate-900">IP Number:</span>
                    <span className="font-mono font-black text-xs text-purple-800">{ipNumber}</span>
                  </div>

                  {/* Patient Name & Age / Sex */}
                  <div className="col-span-2 flex items-baseline gap-1.5 pt-1">
                    <span className="font-bold text-slate-700">Patient Name:</span>
                    <span className="font-bold text-slate-950 uppercase">{personal.name || "N/A"}</span>
                  </div>
                  <div className="col-span-2 flex items-baseline gap-1.5 pt-1">
                    <span className="font-bold text-slate-700">Age / Gender:</span>
                    <span className="font-medium text-slate-900">{personal.age ?? "N/A"} Yrs / {personal.gender || "N/A"}</span>
                  </div>

                  {/* Guardian & Mobile */}
                  <div className="col-span-2 flex items-baseline gap-1.5">
                    <span className="font-bold text-slate-700">Father / Husband:</span>
                    <span className="text-slate-900">{personal.fatherGuardianName || "N/A"}</span>
                  </div>
                  <div className="col-span-2 flex items-baseline gap-1.5">
                    <span className="font-bold text-slate-700">Contact / Mobile:</span>
                    <span className="font-mono font-semibold text-slate-900">{contact.mobile || "N/A"}</span>
                  </div>

                  {/* Ward & Bed / Doctor */}
                  <div className="col-span-2 flex items-baseline gap-1.5">
                    <span className="font-bold text-slate-700">Ward & Bed:</span>
                    <span className="font-semibold text-slate-900">{ward.ward || "General Ward"} (Bed: {ward.bedNumber || "N/A"})</span>
                  </div>
                  <div className="col-span-2 flex items-baseline gap-1.5">
                    <span className="font-bold text-slate-700">Attending Consultant:</span>
                    <span className="font-bold text-slate-900">{doctor.doctorName || "Dr. Vikramaditya Roy"} ({doctor.departmentName || "General"})</span>
                  </div>

                  {/* Dates of Admission & Discharge */}
                  <div className="col-span-2 flex items-baseline gap-1.5 pt-0.5 border-t border-slate-200">
                    <span className="font-bold text-slate-700">Date of Admission:</span>
                    <span className="font-semibold text-slate-900">{admission.admissionDate || "N/A"}</span>
                  </div>
                  <div className="col-span-2 flex items-baseline gap-1.5 pt-0.5 border-t border-slate-200">
                    <span className="font-bold text-slate-700">Date of Discharge:</span>
                    <span className="font-bold text-emerald-800">{admission.dischargeDate || new Date().toISOString().split("T")[0]}</span>
                  </div>
                </div>
              </div>

              {/* 3. MEDICAL HISTORY SECTION:(Condition at Admission) */}
              <div className="mb-2">
                <div className="bg-slate-800 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-t tracking-wider flex items-center justify-between">
                  <span>1. Clinical Condition at Admission</span>
                  <span className="text-[9px] font-normal opacity-80">Presenting Symptoms & Vitals</span>
                </div>
                <div className="border border-t-0 border-slate-300 p-2 bg-white space-y-1">
                  <div>
                    <span className="font-bold text-slate-900">Diagnosis: </span>
                    <span className="font-bold text-sky-900">{diagnosis.diagnosisDetails || "Standard Inpatient Admission & Evaluation"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Presenting Complaints: </span>
                    <span className="text-slate-800">{diagnosis.presentingComplaints || "Admitted with generalized complaints under observation."}</span>
                  </div>
                  {diagnosis.physicalFindings && (
                    <div>
                      <span className="font-bold text-slate-800">Physical Vitals on Admission: </span>
                      <span className="text-slate-700">{diagnosis.physicalFindings}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Hospital Course & Investigations */}
              <div className="mb-2">
                <div className="bg-slate-800 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-t tracking-wider flex items-center justify-between">
                  <span>2. Hospital Course & Progress</span>
                  <span className="text-[9px] font-normal opacity-80">Diagnostics & Inpatient Course</span>
                </div>
                <div className="border border-t-0 border-slate-300 p-2 bg-white space-y-1">
                  <div>
                    <span className="font-bold text-slate-800">Course in Hospital: </span>
                    <span className="text-slate-800">
                      {patient.courseInHospital || "Patient was admitted and managed conservatively. Vitals monitored closely. Patient showed steady clinical improvement during the hospital stay."}
                    </span>
                  </div>
                  {(patient.investigationDetails || patient.histopathologyDetails) && (
                    <div>
                      <span className="font-bold text-slate-800">Key Investigations Done: </span>
                      <span className="text-slate-700 font-mono text-[10px]">
                        {patient.investigationDetails || patient.histopathologyDetails}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Treatment & Procedures Details */}
              <div className="mb-2">
                <div className="bg-slate-800 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-t tracking-wider flex items-center justify-between">
                  <span>3. Treatment & Procedures Details</span>
                  <span className="text-[9px] font-normal opacity-80">Procedures & Prescribed Rx</span>
                </div>
                <div className="border border-t-0 border-slate-300 p-2 bg-white space-y-1.5">
                  {treatment.operationProcedureDetails && (
                    <div>
                      <span className="font-bold text-slate-900">Operation / Surgical Procedure: </span>
                      <span className="font-semibold text-slate-900">{treatment.operationProcedureDetails}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-slate-800">Treatment Given in Hospital: </span>
                    <span className="text-slate-800">
                      {treatment.treatmentDetails || "Supportive medical therapy, intravenous fluids, antibiotics and analgesic regimen administered as per clinical protocol."}
                    </span>
                  </div>

                  {/* Medications Table on Discharge */}
                  {medications && medications.length > 0 && (
                    <div className="pt-1">
                      <span className="font-bold text-slate-800 block mb-1">Prescribed Discharge Medications:</span>
                      <table className="w-full border-collapse border border-slate-300 text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold">
                            <th className="border border-slate-300 px-1.5 py-0.5 text-left">#</th>
                            <th className="border border-slate-300 px-1.5 py-0.5 text-left">Medicine Name</th>
                            <th className="border border-slate-300 px-1.5 py-0.5 text-left">Dosage</th>
                            <th className="border border-slate-300 px-1.5 py-0.5 text-left">Frequency</th>
                            <th className="border border-slate-300 px-1.5 py-0.5 text-left">Duration</th>
                            <th className="border border-slate-300 px-1.5 py-0.5 text-left">Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medications.slice(0, 5).map((med, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="border border-slate-300 px-1.5 py-0.5 text-center">{idx + 1}</td>
                              <td className="border border-slate-300 px-1.5 py-0.5 font-bold text-slate-900">{med.medicine || "—"}</td>
                              <td className="border border-slate-300 px-1.5 py-0.5">{med.dosage || "—"}</td>
                              <td className="border border-slate-300 px-1.5 py-0.5">{med.frequency || "—"}</td>
                              <td className="border border-slate-300 px-1.5 py-0.5">{med.duration || "—"}</td>
                              <td className="border border-slate-300 px-1.5 py-0.5 text-slate-600">{med.instructions || "After meals"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* 6.(Discharge Remarks & Follow-up Instructions) */}
              <div className="mb-2">
                <div className="bg-slate-800 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-t tracking-wider flex items-center justify-between">
                  <span>4. Discharge Remarks & Advice</span>
                  <span className="text-[9px] font-normal opacity-80">Condition & Advice</span>
                </div>
                <div className="border border-t-0 border-slate-300 p-2 bg-amber-50/40 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-red-800 shrink-0">Discharge Remarks:</span>
                    <span className="font-semibold text-slate-950">
                      {dischargeRemarks}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-[10px]">
                    <div>
                      <span className="font-bold text-slate-800">Condition on Discharge: </span>
                      <span className="font-semibold text-emerald-800">{patient.statusOnDischarge || patient.status || "Stable & Improved"}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Follow-up Review: </span>
                      <span className="font-bold text-slate-900">{followUp.date || "After 7 Days in OPD"}</span>
                    </div>
                  </div>
                  {followUp.instructions && (
                    <div className="text-[9.5px] text-slate-600">
                      <span className="font-bold">Follow-up Advice: </span>{followUp.instructions}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 7. AUTHENTICATION & SIGNATURE FOOTER (Stays pinned at bottom of A4) */}
            <div className="pt-3 border-t-2 border-slate-800 mt-2">
              <div className="flex items-end justify-between text-[9.5px]">
                <div className="text-left space-y-0.5">
                  <p className="text-slate-500">
                    Generated: {new Date().toLocaleString("en-IN")} • Digicoders PMS Auth
                  </p>
                  <p className="text-slate-400 text-[8.5px]">
                    Valid legal medical document. Immediate hospital consultation advised if emergency symptoms arise.
                  </p>
                </div>

                <div className="flex items-center gap-12 text-center">
                  <div>
                    <div className="h-9"></div>
                    <div className="border-t border-slate-400 pt-1 w-32 font-bold text-slate-800">
                      Resident Medical Officer
                    </div>
                  </div>
                  <div>
                    <div className="h-9"></div>
                    <div className="border-t border-slate-400 pt-1 w-44 font-bold text-slate-900">
                      Consultant's Signature & Seal
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DischargePrintModal;
