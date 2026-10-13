import api from "./api.js";

export const notificationService = {
  // Get notifications for current user
  async getNotifications() {
    const response = await api.get("/notifications");
    return response.data;
  },

  // Mark single notification as read
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead() {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },
};
