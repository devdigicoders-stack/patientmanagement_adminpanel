import api from "./api.js";

export const patientService = {
  // Get all patients with server pagination, search & filters
  async getPatients(params = {}) {
    const response = await api.get("/patients", { params });
    return response.data;
  },

  // Search patients with advanced fields
  async searchPatients(params = {}) {
    const response = await api.get("/patients/search", { params });
    return response.data;
  },

  // Get single patient by ID or CR Number
  async getPatientById(id) {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Register new patient (CR Number generated authoritatively by server)
  async createPatient(patientData) {
    const response = await api.post("/patients", patientData);
    return response.data;
  },

  // Update patient record
  async updatePatient(id, updatedData) {
    const response = await api.put(`/patients/${id}`, updatedData);
    return response.data;
  },

  // Archive (Soft Delete) patient record
  async archivePatient(id) {
    const response = await api.put(`/patients/${id}/archive`);
    return response.data;
  },

  // Hard Delete patient record (Admin only)
  async deletePatient(id) {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },

  // Get dynamic distinct filter options (doctors, departments, wards) directly from Patient collection
  async getFilterOptions() {
    const response = await api.get("/patients/filter-options");
    return response.data;
  },
};
