// Date Formatter
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// CR Number generator helper
export const generateDemoCRNumber = (existingCount = 3) => {
  const nextNum = String(existingCount + 1).padStart(5, "0");
  return `CR-2026-${nextNum}`;
};

// Hospital No generator
export const generateDemoHospitalNo = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `HOSP-${randomNum}`;
};

// Patient No generator
export const generateDemoPatientNo = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `P-${randomNum}`;
};

// Patient Status Resolver - guarantees consistency between cards, tables, and filters
export const getPatientStatus = (patient) => {
  if (!patient) return "Admitted";
  const s = patient.status;
  const sod = patient.statusOnDischarge;

  // Specific statuses take precedence over default "Admitted" if there's a mismatch
  if (s === "Discharged" || sod === "Discharged") return "Discharged";
  if (s === "Under Treatment" || sod === "Under Treatment") return "Under Treatment";
  if (s === "Pending" || sod === "Pending") return "Pending";
  if (s === "Transferred" || sod === "Transferred") return "Transferred";

  return s || sod || "Admitted";
};
