import api from "./api.js";

export const historyService = {
  // Get all visits / medical history timeline for a patient
  async getPatientHistory(patientId) {
    const response = await api.get(`/patients/${patientId}/history`);
    return response.data;
  },

  // Get filtered/paginated list of visits
  async getPatientVisits(patientId, params = {}) {
    const response = await api.get(`/patients/${patientId}/visits`, { params });
    return response.data;
  },

  // Add new visit entry to patient history (OPD, IPD, Follow-up, Emergency, Procedure)
  async addVisit(patientId, visitData) {
    const response = await api.post(`/patients/${patientId}/visits`, visitData);
    return response.data;
  },

  // Get specific visit record details
  async getVisitById(patientId, visitId) {
    const response = await api.get(`/patients/${patientId}/visits/${visitId}`);
    return response.data;
  },

  // Update visit record
  async updateVisit(patientId, visitId, visitData) {
    const response = await api.put(`/patients/${patientId}/visits/${visitId}`, visitData);
    return response.data;
  },

  // Discharge patient / patch visit status
  async patchVisitStatus(patientId, visitId, patchData) {
    const response = await api.patch(`/patients/${patientId}/visits/${visitId}`, patchData);
    return response.data;
  },

  // Delete visit record
  async deleteVisit(patientId, visitId) {
    const response = await api.delete(`/patients/${patientId}/visits/${visitId}`);
    return response.data;
  },

  // Direct delete visit by visitId
  async deleteVisitDirect(visitId) {
    const response = await api.delete(`/patients/visits/${visitId}`);
    return response.data;
  },
};
