export const initialPatientsData = [
  {
    id: "PAT-001",
    crNo: "CR-2026-00001",
    hospitalNo: "HOSP-88490",
    patientNo: "P-10042",
    personal: {
      patientName: "Rajesh Kumar Sharma",
      fatherName: "Rameshwar Sharma",
      age: 45,
      gender: "Male",
      dob: "1981-05-14",
      bloodGroup: "O+",
      maritalStatus: "Married",
      aadhaarNo: "4839-2049-1092"
    },
    contact: {
      mobile: "+91 98765 43210",
      email: "rajesh.sharma@example.com",
      address: "H.No 142, Vivek Khand, Gomti Nagar",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226010",
      emergencyName: "Sunita Sharma (Wife)",
      emergencyPhone: "+91 98765 43211"
    },
    hospital: {
      ward: "ICU / Cardiac Care Unit",
      bedNumber: "CCU-04",
      doctor: "Dr. Vikramaditya Roy",
      department: "Cardiology",
      status: "Discharged",
      admissionType: "IPD Emergency"
    },
    admission: {
      dateOfAdmission: "2026-10-01",
      dateOfDischarge: "2026-10-07"
    },
    diagnosis: {
      diagnosisDetails: "Acute Anterior Wall Myocardial Infarction (STEMI)",
      presentingComplaints: "Severe retrosternal chest pain radiating to left arm for 3 hours, associated with diaphoresis.",
      physicalFindings: "Pulse: 104 bpm, BP: 150/95 mmHg, SpO2: 94% on room air."
    },
    investigation: {
      investigationDetails: "ECG: ST elevation in V1-V4. Troponin-I: High Positive (4.8 ng/mL). Echo: EF 48%, anterior wall hypokinesia."
    },
    treatment: {
      treatmentDetails: "Thrombolysis with Streptokinase 1.5M IU in 100ml NS. Dual Antiplatelet therapy (Aspirin + Clopidogrel).",
      operationProcedureDetails: "Emergency Coronary Angiography & PCI to LAD with 1 Drug Eluting Stent (DES 3.0 x 24mm)."
    },
    opd: {
      opdFindings: "Post-PCI stable. No chest pain reported during OPD review."
    },
    courseInHospital: {
      courseInHospital: "Patient transferred to CCU post-stenting. Monitored for 48 hours. Hemodynamically stable, mobilized on Day 4."
    },
    discharge: {
      statusOnDischarge: "Recovered & Stable"
    },
    doctorComments: {
      doctorComments: "Patient responded well to primary stenting. Advised strict adherence to antiplatelet drugs."
    },
    medications: [
      { id: 1, medicine: "Tab. Ecosprin", dosage: "75mg", frequency: "Once Daily (OD)", duration: "3 Months", instructions: "After lunch" },
      { id: 2, medicine: "Tab. Clopilet", dosage: "75mg", frequency: "Once Daily (OD)", duration: "1 Year", instructions: "After breakfast" },
      { id: 3, medicine: "Tab. Atorva", dosage: "40mg", frequency: "At Bedtime (HS)", duration: "Long term", instructions: "Night" }
    ],
    followUp: {
      followUpDate: "2026-10-18",
      followUpInstructions: "Repeat ECG and Lipid Profile before visit.",
      followUpNotes: "Check for any exertional shortness of breath or chest discomfort."
    },
    histopathology: {
      histopathologyDetails: "N/A - Non-surgical coronary intervention."
    },
    uploadedFiles: [
      { id: 1, name: "Pre_PCI_Angiogram.png", size: "2.4 MB", type: "image/png" },
      { id: 2, name: "Post_Stent_Angiogram.png", size: "3.1 MB", type: "image/png" }
    ]
  },
  {
    id: "PAT-002",
    crNo: "CR-2026-00002",
    hospitalNo: "HOSP-88491",
    patientNo: "P-10043",
    personal: {
      patientName: "Priyanka Verma",
      fatherName: "Anil Verma",
      age: 29,
      gender: "Female",
      dob: "1997-08-22",
      bloodGroup: "B+",
      maritalStatus: "Single",
      aadhaarNo: "7721-9920-3341"
    },
    contact: {
      mobile: "+91 91234 56789",
      email: "priyanka.v@example.com",
      address: "Flat 402, Royal Palms, Aliganj",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226024",
      emergencyName: "Anil Verma (Father)",
      emergencyPhone: "+91 91234 56780"
    },
    hospital: {
      ward: "Female Surgical Ward",
      bedNumber: "FSW-12",
      doctor: "Dr. Shalini Srivastava",
      department: "General Surgery",
      status: "Admitted",
      admissionType: "IPD Regular"
    },
    admission: {
      dateOfAdmission: "2026-10-06",
      dateOfDischarge: ""
    },
    diagnosis: {
      diagnosisDetails: "Acute Suppurative Appendicitis",
      presentingComplaints: "Right lower quadrant abdominal pain for 24 hours, fever (101°F), anorexia, and nausea.",
      physicalFindings: "Pulse: 96 bpm, Temp: 100.8°F. Abdomen: Tender at McBurney's point with rebound tenderness."
    },
    investigation: {
      investigationDetails: "USG Abdomen: Inflamed, non-compressible appendix measuring 9.2mm. TLC: 14,800/mm³."
    },
    treatment: {
      treatmentDetails: "Pre-op IV Antibiotics (Ceftriaxone + Metronidazole), IV Fluids (NS/DNS), Analgesics.",
      operationProcedureDetails: "Laparoscopic Appendectomy performed on 2026-10-06 under GA."
    },
    opd: {
      opdFindings: "Port site clean, minimal pain, bowel sounds present."
    },
    courseInHospital: {
      courseInHospital: "Patient tolerated surgery well. Soft diet resumed on Post-Op Day 1. Afebrile."
    },
    discharge: {
      statusOnDischarge: "Admitted - Post Op Day 2"
    },
    doctorComments: {
      doctorComments: "Surgical wound clean. Plan discharge tomorrow if vitals stay stable."
    },
    medications: [
      { id: 1, medicine: "Inj. Augmentin", dosage: "1.2g", frequency: "Twice Daily (BD)", duration: "3 Days", instructions: "IV infusion" },
      { id: 2, medicine: "Tab. Zero-P", dosage: "1 Tab", frequency: "Twice Daily (BD)", duration: "5 Days", instructions: "After meals" }
    ],
    followUp: {
      followUpDate: "2026-10-14",
      followUpInstructions: "Post-op suture line inspection in surgical OPD.",
      followUpNotes: "Advised no heavy weight lifting for 3 weeks."
    },
    histopathology: {
      histopathologyDetails: "Specimen sent: Appendix (6.5cm length). Report pending."
    },
    uploadedFiles: [
      { id: 1, name: "USG_Abdomen_Scan.jpg", size: "1.8 MB", type: "image/jpeg" }
    ]
  },
  {
    id: "PAT-003",
    crNo: "CR-2026-00003",
    hospitalNo: "HOSP-88492",
    patientNo: "P-10044",
    personal: {
      patientName: "Amitabh Srivastava",
      fatherName: "K. N. Srivastava",
      age: 62,
      gender: "Male",
      dob: "1964-03-10",
      bloodGroup: "AB+",
      maritalStatus: "Married",
      aadhaarNo: "3302-8819-4410"
    },
    contact: {
      mobile: "+91 99887 76655",
      email: "amitabh.s@example.com",
      address: "12/484, Indira Nagar",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226016",
      emergencyName: "Seema Srivastava (Wife)",
      emergencyPhone: "+91 99887 76654"
    },
    hospital: {
      ward: "OPD Consultation Chamber",
      bedNumber: "OPD-Chamber 4",
      doctor: "Dr. Alok Nath Tripathy",
      department: "Neurology",
      status: "Under Treatment",
      admissionType: "OPD"
    },
    admission: {
      dateOfAdmission: "2026-10-08",
      dateOfDischarge: "2026-10-08"
    },
    diagnosis: {
      diagnosisDetails: "Cervical Spondylosis with Tension Headache",
      presentingComplaints: "Chronic tension headache for 2 months, numbness in bilateral hands.",
      physicalFindings: "Cranial nerves intact. Motor power 5/5 all limbs."
    },
    investigation: {
      investigationDetails: "MRI Cervical Spine: Degenerative disc disease at C5-C6 level."
    },
    treatment: {
      treatmentDetails: "Physical therapy & Cervical isometric exercises advised.",
      operationProcedureDetails: "Conservative medical & physiotherapy management."
    },
    opd: {
      opdFindings: "OPD routine evaluation."
    },
    courseInHospital: {
      courseInHospital: "Treated in OPD."
    },
    discharge: {
      statusOnDischarge: "OPD Treated"
    },
    doctorComments: {
      doctorComments: "Avoid forward head posture. Use cervical pillow while sleeping."
    },
    medications: [
      { id: 1, medicine: "Tab. Myoril", dosage: "4mg", frequency: "Twice Daily (BD)", duration: "5 Days", instructions: "Muscle relaxant" }
    ],
    followUp: {
      followUpDate: "2026-10-29",
      followUpInstructions: "Review after 3 weeks with physiotherapy report.",
      followUpNotes: "Continue neck exercises daily."
    },
    histopathology: {
      histopathologyDetails: "Not applicable."
    },
    uploadedFiles: []
  }
];

export const mockDashboardMetrics = {
  totalPatients: 148,
  admittedPatients: 42,
  dischargedPatients: 94,
  pendingReports: 12
};

export const mockRegistrationTrend = [
  { day: "Mon", registrations: 18, admissions: 8 },
  { day: "Tue", registrations: 24, admissions: 12 },
  { day: "Wed", registrations: 29, admissions: 15 },
  { day: "Thu", registrations: 22, admissions: 9 },
  { day: "Fri", registrations: 31, admissions: 14 },
  { day: "Sat", registrations: 19, admissions: 7 },
  { day: "Sun", registrations: 12, admissions: 4 }
];

export const mockStatusDistribution = [
  { name: "Admitted", value: 42, color: "#ef4444" },
  { name: "Discharged", value: 94, color: "#10b981" },
  { name: "Under Treatment", value: 24, color: "#0284c7" },
  { name: "Pending", value: 12, color: "#f59e0b" }
];
