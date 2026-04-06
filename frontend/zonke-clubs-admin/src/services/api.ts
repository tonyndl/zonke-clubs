import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthResponse, ApiError } from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000/api";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        // Only clear token on 401 (truly unauthenticated).
        // 403 means authenticated but forbidden — do NOT logout, let the
        // calling component handle it (e.g. club not set up yet).
        // Also skip if already on the login page to prevent redirect loops.
        if (
          error.response?.status === 401 &&
          window.location.pathname !== "/login"
        ) {
          this.clearToken();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  // Token management
  private getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  clearToken(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_info");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAdminInfo(): { id?: string; name: string; email: string } | null {
    try {
      const raw = localStorage.getItem("admin_info");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private setAdminInfo(admin: {
    id?: string;
    name: string;
    email: string;
  }): void {
    localStorage.setItem("admin_info", JSON.stringify(admin));
  }

  // Auth endpoints
  login(email: string, password: string): Promise<AuthResponse> {
    return this.client
      .post<AuthResponse>("/admin/login", {
        email,
        password,
      })
      .then((response) => {
        this.setToken(response.data.jwt);
        if (response.data.admin) {
          this.setAdminInfo({
            id: response.data.admin.id,
            name: response.data.admin.name,
            email: response.data.admin.email,
          });
        }
        return response.data;
      });
  }

  signup(
    clubName: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    return this.client
      .post<AuthResponse>("/admin/register", {
        name: clubName,
        email,
        password,
        role: "club_admin",
      })
      .then((response) => {
        this.setToken(response.data.jwt);
        if (response.data.admin) {
          this.setAdminInfo({
            id: response.data.admin.id,
            name: response.data.admin.name,
            email: response.data.admin.email,
          });
        }
        return response.data;
      });
  }

  logout(): Promise<void> {
    this.clearToken();
    return Promise.resolve();
  }

  getCurrentUser() {
    return this.client.get("/admin/profile").then((response) => {
      // Cache for pages that need admin email/name without a separate call
      if (response.data?.email) {
        this.setAdminInfo({
          name: response.data.name || "",
          email: response.data.email,
        });
      }
      return response.data;
    });
  }

  updateProfile(data: { name?: string; email?: string }) {
    return this.client.put("/admin/profile", data).then((res) => res.data);
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.client
      .put("/admin/profile/password", {
        current_password: currentPassword,
        new_password: newPassword,
      })
      .then((res) => res.data);
  }

  deleteAccount(password: string) {
    return this.client
      .delete("/admin/profile", { data: { password } })
      .then((res) => res.data);
  }

  // Club endpoints
  getMyClub() {
    return this.client.get("/clubs/my-club").then((response) => response.data);
  }

  setupClub(data: any) {
    console.log("🌐 API.setupClub called with data:", data);
    console.log("🌐 API: Auth token:", this.getToken());
    console.log("🌐 API: Full URL:", `${API_BASE_URL}/clubs/setup`);

    return this.client
      .post("/clubs/setup", data)
      .then((response) => {
        console.log("🌐 API.setupClub response:", response);
        console.log("🌐 Response data:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("🌐 API.setupClub failed:", error);
        console.error("🌐 Error response:", error.response);
        console.error("🌐 Error status:", error.response?.status);
        console.error("🌐 Error data:", error.response?.data);
        throw error;
      });
  }

  // Spending Records endpoints
  searchUsers(query: string, excludeIds?: string[], limit?: number) {
    const params: any = { q: query };
    if (excludeIds && excludeIds.length > 0) {
      params.exclude_ids = excludeIds.join(",");
    }
    if (limit) {
      params.limit = limit.toString();
    }
    return this.client
      .get("/admin/users/search", { params })
      .then((response) => response.data);
  }

  createSpendingRecord(record: any) {
    return this.client
      .post("/admin/spending-records", { record })
      .then((response) => response.data);
  }

  createGroupSpending(records: any[]) {
    return this.client
      .post("/admin/spending-records", { records })
      .then((response) => response.data);
  }

  getSpendingRecords(limit?: number) {
    const params = limit ? { limit: limit.toString() } : {};
    return this.client
      .get("/admin/spending-records", { params })
      .then((response) => response.data);
  }

  getLeaderboard(
    timePeriod: "all" | "week" | "month" = "all",
    limit: number = 10,
  ) {
    return this.client
      .get("/admin/spending-records/leaderboard", {
        params: { time_period: timePeriod, limit: limit.toString() },
      })
      .then((response) => response.data);
  }

  getSpendingStats() {
    return this.client
      .get("/admin/spending-records/stats")
      .then((response) => response.data);
  }

  // Posts/Content Moderation endpoints
  getPosts(
    page: number = 1,
    perPage: number = 20,
    status?: string,
    source?: string,
    search?: string,
  ) {
    const params: any = { page: page.toString(), per_page: perPage.toString() };
    if (status) {
      params.status = status;
    }
    if (source) {
      params.source = source;
    }
    if (search) {
      params.search = search;
    }
    return this.client
      .get("/admin/content-moderation", { params })
      .then((response) => response.data);
  }

  approvePost(postId: string) {
    return this.client
      .put(`/admin/content-moderation/${postId}/approve`)
      .then((response) => response.data);
  }

  rejectPost(postId: string) {
    return this.client
      .put(`/admin/content-moderation/${postId}/reject`)
      .then((response) => response.data);
  }

  getPostsStats() {
    return this.client
      .get("/admin/content-moderation/stats")
      .then((response) => response.data);
  }

  updateClubPost(postId: string, caption: string) {
    return this.client
      .put(`/admin/content-moderation/${postId}`, { caption })
      .then((response) => response.data);
  }

  deleteClubPost(postId: string) {
    return this.client
      .delete(`/admin/content-moderation/${postId}`)
      .then(() => undefined);
  }

  getDashboardStats() {
    return this.client
      .get("/admin/dashboard/stats")
      .then((response) => response.data);
  }

  createClubPost(assetIds: string[], caption?: string) {
    return this.client
      .post("/admin/content-moderation/posts", {
        asset_ids: assetIds,
        caption: caption || "",
      })
      .then((response) => response.data);
  }

  // DJ Management endpoints
  getDJs() {
    return this.client.get("/djs").then((response) => response.data.djs);
  }

  getDJ(id: string) {
    return this.client.get(`/djs/${id}`).then((response) => response.data.dj);
  }

  createDJ(data: any) {
    return this.client.post("/djs", data).then((response) => response.data.dj);
  }

  updateDJ(id: string, data: any) {
    return this.client
      .put(`/djs/${id}`, data)
      .then((response) => response.data.dj);
  }

  deleteDJ(id: string) {
    return this.client.delete(`/djs/${id}`).then((response) => response.data);
  }

  // DJ Schedule endpoints
  getDJSchedules() {
    return this.client
      .get("/dj-schedules")
      .then((response) => response.data.schedules);
  }

  getDJSchedule(id: string) {
    return this.client
      .get(`/dj-schedules/${id}`)
      .then((response) => response.data.schedule);
  }

  createDJSchedule(data: any) {
    return this.client
      .post("/dj-schedules", data)
      .then((response) => response.data.schedule);
  }

  updateDJSchedule(id: string, data: any) {
    console.log("🌐 API.updateDJSchedule called:", { id, data });
    return this.client
      .put(`/dj-schedules/${id}`, data)
      .then((response) => {
        console.log("🌐 API.updateDJSchedule response:", response.data);
        return response.data.schedule;
      })
      .catch((error) => {
        console.error("🌐 API.updateDJSchedule error:", error);
        console.error("🌐 Error response:", error.response?.data);
        throw error;
      });
  }

  deleteDJSchedule(id: string) {
    return this.client
      .delete(`/dj-schedules/${id}`)
      .then((response) => response.data);
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // File upload
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.client.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Asset management
  uploadAsset(
    formData: FormData,
    onProgress?: (progress: number) => void,
  ): Promise<any> {
    return this.client
      .post("/assets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: onProgress
          ? (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1),
              );
              onProgress(percentCompleted);
            }
          : undefined,
      })
      .then((response) => response.data);
  }

  getAsset(id: string): Promise<any> {
    return this.client.get(`/assets/${id}`).then((response) => response.data);
  }

  deleteAsset(id: string): Promise<void> {
    return this.client.delete(`/assets/${id}`).then(() => undefined);
  }
}

export const apiService = new ApiService();
