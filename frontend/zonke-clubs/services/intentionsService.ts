import { api } from "./api";
import { MeetupIntention, ActivityType } from "@/types/meetup";

export type IntentionResponse = {
  intentions: MeetupIntention[];
};

export type SingleIntentionResponse = {
  intention: MeetupIntention;
};

export type CreateIntentionParams = {
  activity_type: ActivityType;
  club_id: string;
  planned_date: string; // ISO date string (YYYY-MM-DD)
  planned_time?: string;
  message?: string;
};

export type UpdateIntentionParams = {
  activity_type?: ActivityType;
  planned_date?: string;
  planned_time?: string;
  message?: string;
  active?: boolean;
};

// Transform API response from snake_case to camelCase
function transformIntention(apiIntention: any): MeetupIntention {
  return {
    id: apiIntention.id,
    activityType: apiIntention.activity_type,
    clubId: apiIntention.club_id,
    clubName: apiIntention.club_name || undefined,
    plannedDate: apiIntention.planned_date,
    plannedTime: apiIntention.planned_time,
    message: apiIntention.message,
    active: apiIntention.active,
    expiresAt: apiIntention.expires_at,
    user: {
      id: apiIntention.user.id,
      username: apiIntention.user.username,
      avatarUrl: apiIntention.user.avatar_url,
    },
    createdAt: apiIntention.inserted_at,
  };
}

class IntentionsService {
  /**
   * Fetch the authenticated user's own active intentions (requires auth)
   */
  getMyIntentions(): Promise<IntentionResponse> {
    return api.get<any>("/intentions/mine", true).then((response) => ({
      intentions: response.intentions.map(transformIntention),
    }));
  }

  /**
   * Fetch all active intentions across all clubs (public)
   * @param excludeUserId - Optional user ID to exclude from results
   */
  getAllIntentions(excludeUserId?: string): Promise<IntentionResponse> {
    const params = excludeUserId ? `?exclude_user_id=${excludeUserId}` : "";
    return api.get<any>(`/intentions${params}`, false).then((response) => ({
      intentions: response.intentions.map(transformIntention),
    }));
  }

  /**
   * Fetch all intentions for a specific club (public)
   * @param excludeUserId - Optional user ID to exclude from results
   */
  getClubIntentions(
    clubId: string,
    excludeUserId?: string,
  ): Promise<IntentionResponse> {
    const params = excludeUserId ? `?exclude_user_id=${excludeUserId}` : "";
    return api
      .get<any>(`/clubs/${clubId}/intentions${params}`, false)
      .then((response) => ({
        intentions: response.intentions.map(transformIntention),
      }));
  }

  /**
   * Create a new intention (requires authentication)
   */
  createIntention(
    params: CreateIntentionParams,
  ): Promise<SingleIntentionResponse> {
    return api.post<any>("/intentions", params, true).then((response) => ({
      intention: transformIntention(response.intention),
    }));
  }

  /**
   * Update an intention (requires authentication)
   */
  updateIntention(
    id: string,
    params: UpdateIntentionParams,
  ): Promise<SingleIntentionResponse> {
    return api.put<any>(`/intentions/${id}`, params, true).then((response) => ({
      intention: transformIntention(response.intention),
    }));
  }

  /**
   * Delete an intention (requires authentication)
   */
  deleteIntention(id: string): Promise<void> {
    return api.delete<void>(`/intentions/${id}`, true).then(() => undefined);
  }
}

export const intentionsService = new IntentionsService();
