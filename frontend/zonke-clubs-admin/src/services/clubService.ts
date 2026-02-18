import { apiService } from "./api";
import { Club, PaginatedResponse } from "../types";

export const clubService = {
  // Get current club (business profile)
  getCurrentClub: async (): Promise<Club> => {
    return apiService.get<Club>("/business_profiles/current");
  },

  // Get club by ID
  getClub: async (id: string): Promise<Club> => {
    return apiService.get<Club>(`/business_profiles/${id}`);
  },

  // Update club information
  updateClub: async (id: string, data: Partial<Club>): Promise<Club> => {
    return apiService.put<Club>(`/business_profiles/${id}`, data);
  },

  // Update cover image
  updateCoverImage: async (
    id: string,
    file: File,
  ): Promise<{ url: string }> => {
    return apiService.uploadFile<{ url: string }>(
      `/business_profiles/${id}/cover`,
      file,
    );
  },

  // Update logo
  updateLogo: async (id: string, file: File): Promise<{ url: string }> => {
    return apiService.uploadFile<{ url: string }>(
      `/business_profiles/${id}/logo`,
      file,
    );
  },

  // Update opening hours
  updateOpeningHours: async (
    id: string,
    openingHours: Club["opening_hours"],
  ): Promise<Club> => {
    return apiService.patch<Club>(`/business_profiles/${id}/opening-hours`, {
      openingHours,
    });
  },

  // Update DJ schedule
  updateDJSchedule: async (
    id: string,
    djSchedule: Club["dj_schedule"],
  ): Promise<Club> => {
    return apiService.patch<Club>(`/business_profiles/${id}/dj-schedule`, {
      djSchedule,
    });
  },
};
