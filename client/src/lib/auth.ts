import { apiRequest } from "./queryClient";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const authAPI = {
  login: async (data: LoginData) => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return response.json();
  },

  forceChangePassword: async (data: { newPassword: string; confirmPassword: string }) => {
    const response = await apiRequest("POST", "/api/auth/force-change-password", data);
    return response.json();
  },

  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const response = await apiRequest("POST", "/api/auth/change-password", data);
    return response.json();
  },


  register: async (data: RegisterData) => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    return response.json();
  },

  logout: async () => {
    const response = await apiRequest("POST", "/api/auth/logout");
    return response.json();
  },

  getMe: async () => {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  },
};
