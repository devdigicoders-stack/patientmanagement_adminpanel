import api from "./api.js";

export const authService = {
  // Login user and set HttpOnly cookie
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Logout user and clear HttpOnly cookie
  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Get current authenticated user
  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Change password
  async changePassword(currentPassword, newPassword, confirmPassword) {
    const response = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  // Update user profile
  async updateProfile(profileData) {
    const response = await api.put("/auth/profile", profileData);
    return response.data;
  },

  // Change Login ID / Email
  async changeEmail(newEmail, currentPassword) {
    const response = await api.post("/auth/change-email", {
      newEmail,
      currentPassword,
    });
    return response.data;
  },
};

