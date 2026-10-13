import api from "./api.js";

export const dashboardService = {
  // Get dashboard statistics summary, recent patients, trends and status distribution
  async getSummary() {
    const response = await api.get("/dashboard/summary");
    return response.data;
  },
};
