import api, { getFileUrl } from "./api.js";

export const uploadService = {
  // Helper to generate file streaming URL from environment configured base URL
  getFileUrl(fileIdOrName) {
    return getFileUrl(fileIdOrName);
  },

  // Upload file under specific category ("Patient Image", "Investigation", "Histopathology", "Other")
  async uploadCategoryDocument(patientId, file, category = "Other", visitId = null) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    if (visitId) formData.append("visitId", visitId);

    const response = await api.post(`/patients/${patientId}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Backward compatible generic upload
  async uploadFile(patientId, file) {
    return this.uploadCategoryDocument(patientId, file, "Other");
  },

  // Get all documents for patient with optional category filter
  async getPatientDocuments(patientId, params = {}) {
    const response = await api.get(`/patients/${patientId}/documents`, { params });
    return response.data;
  },

  // Delete document
  async deleteDocument(patientId, fileId) {
    const response = await api.delete(`/patients/${patientId}/documents/${fileId}`);
    return response.data;
  },

  // Delete file backward compatibility
  async deleteFile(patientId, filename) {
    const response = await api.delete(`/patients/${patientId}/files/${filename}`);
    return response.data;
  },
};
