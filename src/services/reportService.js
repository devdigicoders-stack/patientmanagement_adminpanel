import api from "./api";

const reportService = {
  // Fetch Dashboard Analytics with optional date range filter
  getDashboardAnalytics: async (params = {}) => {
    const response = await api.get("/reports/dashboard", { params });
    return response.data;
  },

  // Advanced Multi-Field Patient Search
  getAdvancedSearch: async (params = {}) => {
    const response = await api.get("/reports/search", { params });
    return response.data;
  },

  // Topbar Global Search
  getGlobalSearch: async (q) => {
    const response = await api.get("/reports/global-search", { params: { q } });
    return response.data;
  },

  // OPD Visits Report
  getOPDReport: async (params = {}) => {
    const response = await api.get("/reports/opd", { params });
    return response.data;
  },

  // IPD Admissions & Discharges Report
  getIPDReport: async (params = {}) => {
    const response = await api.get("/reports/ipd", { params });
    return response.data;
  },

  // Discharge Report
  getDischargeReport: async (params = {}) => {
    const response = await api.get("/reports/discharges", { params });
    return response.data;
  },

  // Follow-ups Report
  getFollowUpReport: async (params = {}) => {
    const response = await api.get("/reports/followups", { params });
    return response.data;
  },

  // Histopathology Report
  getHistopathologyReport: async (params = {}) => {
    const response = await api.get("/reports/histopathology", { params });
    return response.data;
  },

  // Export CSV File
  exportReportCSV: async (type = "patients", params = {}) => {
    const response = await api.get("/reports/export", {
      params: { type, ...params },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `patient_record_${type}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Get Server-side PDF URL for Patient Summary Report
  getPatientPdfUrl: (id) => {
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return `${baseURL}/reports/patients/${id}/pdf`;
  },

  // Get Server-side PDF URL for Visit Report
  getVisitPdfUrl: (visitId) => {
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return `${baseURL}/reports/visits/${visitId}/pdf`;
  },
};

export default reportService;
