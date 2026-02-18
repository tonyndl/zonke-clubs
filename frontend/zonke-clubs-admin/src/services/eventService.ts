import { apiService } from "./api";
import { Event } from "../types";

export const eventService = {
  // Get all events for the current admin
  getEvents: async (): Promise<{ events: Event[] }> => {
    return apiService.get<{ events: Event[] }>("/admin/events");
  },

  // Get single event
  getEvent: async (id: string): Promise<{ event: Event }> => {
    return apiService.get<{ event: Event }>(`/admin/events/${id}`);
  },

  // Create event
  createEvent: async (data: Partial<Event>): Promise<{ event: Event }> => {
    return apiService.post<{ event: Event }>("/admin/events", data);
  },

  // Update event
  updateEvent: async (
    id: string,
    data: Partial<Event>,
  ): Promise<{ event: Event }> => {
    return apiService.put<{ event: Event }>(`/admin/events/${id}`, data);
  },

  // Delete event
  deleteEvent: async (id: string): Promise<void> => {
    return apiService.delete<void>(`/admin/events/${id}`);
  },

  // Publish event
  publishEvent: async (id: string): Promise<{ event: Event }> => {
    return apiService.put<{ event: Event }>(`/admin/events/${id}/publish`, {});
  },

  // Unpublish event
  unpublishEvent: async (id: string): Promise<{ event: Event }> => {
    return apiService.put<{ event: Event }>(
      `/admin/events/${id}/unpublish`,
      {},
    );
  },

  // Delete all past events (date before today) and their S3 cover images
  cleanupPastEvents: async (): Promise<{
    deleted: number;
    s3_errors: string[];
  }> => {
    return apiService.delete<{ deleted: number; s3_errors: string[] }>(
      "/admin/events/past",
    );
  },
};
