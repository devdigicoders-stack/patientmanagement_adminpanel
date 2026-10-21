/**
 * Clinical Master Data
 * NOTE FOR CLIENT / ADMIN:
 * This file contains the master reference lists for auto-suggestions / dropdowns.
 * Whenever the client provides the official list of diseases, complaints, or other names,
 * you can easily append, edit, or replace the items in this file.
 */

// 1. Diseases / Diagnosis Suggestions
export const DISEASES_SUGGESTIONS = [
  // Cardiovascular Diseases
  "Acute Anterior Wall ST-Elevation Myocardial Infarction (STEMI)",
  "Acute Coronary Syndrome (ACS) / NSTEMI",
  "Coronary Artery Disease (CAD) with Angina Pectoris",
  "Congestive Heart Failure (CHF)",
  "Hypertensive Heart Disease / Essential Hypertension",
  "Atrial Fibrillation / Cardiac Arrhythmia",
  "Rheumatic Heart Disease (RHD)",
  "Deep Vein Thrombosis (DVT)",

  // Respiratory Diseases 
  "Community Acquired Pneumonia (CAP)",
  "Chronic Obstructive Pulmonary Disease (COPD) Acute Exacerbation",
  "Bronchial Asthma Acute Attack",
  "Pulmonary Tuberculosis (PTB)",
  "Pleural Effusion (Exudative / Transudative)",
  "Acute Upper Respiratory Tract Infection (URTI)",
  "Bronchiectasis",
  "COVID-19 Associated Respiratory Distress",

  // Gastrointestinal & Hepatobiliary
  "Acute Gastroenteritis with Severe Dehydration",
  "Acute Calculous Cholecystitis",
  "Cholelithiasis with Biliary Colic",
  "Acute Appendicitis / Perforated Appendicitis",
  "Acute Pancreatitis (Mild / Severe)",
  "Chronic Liver Disease (CLD) with Cirrhosis & Portal Hypertension",
  "Upper Gastrointestinal Bleed (UGIB) / Peptic Ulcer Disease",
  "Intestinal Obstruction",
  "Inguinal Hernia (Obstructed / Strangulated)",
  "Hemorrhoids / Anal Fissure / Fistula-in-Ano",
  "Enteric Fever (Typhoid)",

  // Endocrine & Metabolic 
  "Type 2 Diabetes Mellitus with Hyperglycemia",
  "Diabetic Ketoacidosis (DKA)",
  "Hypothyroidism / Hyperthyroidism",
  "Severe Anemia (Nutritional / Iron Deficiency)",
  "Electrolyte Imbalance (Hyponatremia / Hypokalemia)",

  // Infectious & Tropical
  "Dengue Fever with Thrombocytopenia",
  "Malaria (Plasmodium Vivax / Falciparum)",
  "Viral Hepatitis (Hepatitis A / B / C / E)",
  "Urinary Tract Infection (UTI) / Pyelonephritis",
  "Sepsis / Septic Shock",
  "Chikungunya Viral Fever",

  // Neurology & Trauma 
  "Acute Ischemic Stroke / Cerebrovascular Accident (CVA)",
  "Intracranial Hemorrhage (ICH)",
  "Generalized Tonic-Clonic Seizure Disorder / Epilepsy",
  "Meningitis / Encephalitis",
  "Migraine / Tension Headache",
  "Head Injury / Concussion / Blunt Trauma",

  // Orthopedics & Musculoskeletal 
  "Fracture Neck of Femur (Right / Left)",
  "Compound Fracture Tibia-Fibula",
  "Intertrochanteric (IT) Fracture Femur",
  "Lumbar Disc Herniation / Sciatica / Spondylosis",
  "Osteoarthritis Both Knees (Grade III/IV)",
  "Rheumatoid Arthritis with Synovitis",

  // Nephrology & Urology 
  "Chronic Kidney Disease (CKD) Stage 5 on Hemodialysis",
  "Acute Kidney Injury (AKI)",
  "Nephrolithiasis / Ureteric Calculus with Hydronephrosis",
  "Benign Prostatic Hyperplasia (BPH) with Urinary Retention",

  // Obstetrics & Gynecology 
  "Full Term Pregnancy (FTP) with Labor Pains",
  "Previous LSCS in Active Labor",
  "Pre-Eclampsia / Gestational Hypertension",
  "Pelvic Inflammatory Disease (PID)",
  "Abnormal Uterine Bleeding (AUB) / Fibroid Uterus",
  "Ovarian Cystic Mass",

  // ENT & Ophthalmology
  "Chronic Suppurative Otitis Media (CSOM)",
  "Deviated Nasal Septum (DNS) with Sinusitis",
  "Senile Immature Cataract",
];

// 2. Presenting Complaints Suggestions
export const COMPLAINTS_SUGGESTIONS = [
  "High grade fever with chills and rigor since 3 days",
  "Acute crushing retrosternal chest pain radiating to left shoulder and jaw",
  "Shortness of breath (Dyspnea on exertion / at rest) and orthopnea",
  "Severe colicky abdominal pain localized to right upper quadrant",
  "Acute pain in right iliac fossa associated with nausea and vomiting",
  "Multiple episodes of loose watery stools and recurrent vomiting",
  "Burning micturition, increased frequency, and lower abdominal heaviness",
  "Sudden onset right/left sided hemiparesis and facial deviation",
  "Generalized weakness, fatigue, loss of appetite, and pallor",
  "Chronic persistent cough with yellowish expectoration and mild hemoptysis",
  "Severe headache, photophobia, and neck stiffness",
  "Swelling of bilateral lower limbs (Pedal edema) and facial puffiness",
  "Inability to bear weight on leg following fall / road traffic accident",
  "Joint pain with morning stiffness and swelling in knees/hands",
  "Labor pains with leaking per vaginum at term",
  "Bleeding per rectum during defecation",
];

// 3. Procedures & Surgical Interventions
export const PROCEDURES_SUGGESTIONS = [
  "Laparoscopic Cholecystectomy under General Anesthesia",
  "Open / Laparoscopic Appendectomy",
  "Emergency Coronary Angiography (CAG) & Percutaneous Coronary Intervention (PCI)",
  "Right / Left Bipolar Hemiarthroplasty of Hip",
  "Open Reduction and Internal Fixation (ORIF) with Plating / Interlocking Nailing",
  "Lower Segment Cesarean Section (LSCS)",
  "Normal Vaginal Delivery with Episiotomy & Repair",
  "Laparoscopic Hernioplasty (TEP / TAPP) with Mesh Placement",
  "Total Abdominal Hysterectomy with Bilateral Salpingo-Oophorectomy (TAH-BSO)",
  "Transurethral Resection of the Prostate (TURP)",
  "Wound Debridement, Washing and Primary Closure",
  "Temporary Hemodialysis via Internal Jugular Venous Catheter",
  "Chest Tube / Intercostal Drainage (ICD) Insertion",
  "Lumbar Puncture (Diagnostic / Therapeutic)",
  "Endotracheal Intubation & Mechanical Ventilation",
  "Closed Reduction & Cast Immobilization",
];

// 4. Discharge Remarks Suggestions
export const DISCHARGE_REMARKS_SUGGESTIONS = [
  "Patient discharged in hemodynamically stable and improved clinical condition. All vitals normal.",
  "Condition significantly improved with conservative and medical management. Tolerating normal oral diet.",
  "Post-operative recovery smooth and uneventful. Surgical wound clean, healthy, and dry. Sutures intact.",
  "Discharged in stable condition. Advised strict adherence to dual antiplatelets, low salt and diabetic diet.",
  "Patient afebrile with normalized hemogram and stable vitals. Prescribed full course of oral antibiotics.",
  "Wound dressing done with antiseptic solution. Suture removal advised on 8th post-operative day in OPD.",
  "Advised high protein diet, plenty of oral fluids, and chest physiotherapy with incentive spirometry.",
  "Patient and relatives counseled regarding danger signs (fever, bleeding, dyspnea). Advised emergency visit if noted.",
  "Discharged on request (LAMA - Left Against Medical Advice) after explaining all clinical risks in vernacular.",
  "Referred to Higher Tertiary Care Medical Center for advanced super-specialty management.",
];

// 5. Investigations Suggestions
export const INVESTIGATION_SUGGESTIONS = [
  "CBC: Hb 12.8 gm%, TLC 8,400/cumm, Platelets 2.2 Lakhs/cumm",
  "LFT: Bilirubin 0.8 mg/dL, SGOT 32 U/L, SGPT 38 U/L, Alk Phos 110 U/L",
  "KFT: Blood Urea 28 mg/dL, Serum Creatinine 0.9 mg/dL, Uric Acid 5.2 mg/dL",
  "Electrolytes: Sodium 138 mEq/L, Potassium 4.2 mEq/L, Chloride 101 mEq/L",
  "Blood Sugar: Fasting 108 mg/dL, PP 152 mg/dL, HbA1c 6.8%",
  "Cardiac Enzymes: Troponin-I Elevated (3.4 ng/mL), CPK-MB 48 U/L",
  "ECG 12-Lead: Normal Sinus Rhythm, No acute ST-T changes",
  "Chest X-Ray (PA View): Bilateral lung fields clear, Costophrenic angles sharp, Normal cardiothoracic ratio",
  "USG Whole Abdomen: Normal liver, spleen, kidneys. No free fluid or cholelithiasis",
  "CT Scan Brain (Plain): No intracranial hemorrhage or acute major infarct",
  "Urine Routine & Microscopic: Albumin Nil, Sugar Nil, Pus cells 2-3 /HPF",
];
