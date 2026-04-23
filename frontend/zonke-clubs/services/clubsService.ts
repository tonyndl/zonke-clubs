import { api } from "./api";

export type ClubVideo = {
  id: string;
  url: string;
  thumbnail?: string;
  duration: number;
  uploaded_at: string; // ISO date string
  likes: number;
};

export type Club = {
  id: string;
  name: string;
  description: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  email?: string;
  phone?: string;
  active: boolean;
  vibes?: string[];
  music_genres?: string[];
  dress_code?: string;
  entry_fee?: string;
  table_reservation_numbers?: string[];
  is_liked?: boolean;
  opening_hours?: Record<string, { open: string; close: string } | null>;
  inserted_at: string;
  updated_at: string;
  // Frontend-only dummy data
  videos?: ClubVideo[];
};

export type Paginate = {
  page: number;
  per_page: number;
  max_page: number;
  total_count: number;
};

export type ClubsResponse = {
  clubs: Club[];
  paginate: Paginate;
};

export type ClubResponse = {
  club: Club;
};

export type DJSchedule = {
  id: string;
  dj_id: string;
  dj_name: string;
  dj_instagram?: string;
  dj_tiktok?: string;
  day: string;
  day_of_week: number;
  start_time?: string;
  end_time?: string;
  notes?: string;
  type: "weekly" | "specific";
  specific_date?: string;
};

export type ClubEvent = {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  general_entry_price: number;
  vip_entry_price: number;
  dj_lineup: Array<{
    id: string;
    name: string;
    instagram?: string;
    tiktok?: string;
  }>;
  cover_image?: string;
  status: "draft" | "published";
};

export type SchedulesResponse = {
  schedules: DJSchedule[];
};

export type EventsResponse = {
  events: ClubEvent[];
};

class ClubsService {
  /**
   * Fetch paginated clubs (with is_liked if authenticated)
   */
  getClubs(
    authenticated: boolean = false,
    page: number = 1,
    perPage: number = 10,
    search?: string,
  ): Promise<ClubsResponse> {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    return api.get<ClubsResponse>(
      `/clubs?page=${page}&per_page=${perPage}${searchParam}`,
      authenticated,
    );
  }

  /**
   * Fetch a single club by ID
   */
  getClub(id: string): Promise<ClubResponse> {
    return api.get<ClubResponse>(`/clubs/${id}`, false);
  }

  /**
   * Like a club (add to favorites)
   */
  likeClub(clubId: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/clubs/${clubId}/like`, {}, true);
  }

  /**
   * Unlike a club (remove from favorites)
   */
  unlikeClub(clubId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/clubs/${clubId}/like`, true);
  }

  /**
   * Get user's favorite clubs
   */
  getFavoriteClubs(): Promise<ClubsResponse> {
    return api.get<ClubsResponse>("/clubs/favorites", true);
  }

  /**
   * Get DJ schedule for a specific club.
   * Pass an optional weekStart (YYYY-MM-DD, must be a Sunday) to fetch a specific week.
   * Defaults to the current week on the backend.
   */
  getClubSchedule(
    clubId: string,
    weekStart?: string,
  ): Promise<SchedulesResponse> {
    const query = weekStart ? `?week_start=${weekStart}` : "";
    return api.get<SchedulesResponse>(
      `/clubs/${clubId}/schedule${query}`,
      false,
    );
  }

  /**
   * Get upcoming events for a specific club
   */
  getClubEvents(clubId: string): Promise<EventsResponse> {
    return api.get<EventsResponse>(`/clubs/${clubId}/events`, false);
  }

  /**
   * Get approved posts for a specific club
   */
  getClubPosts(
    clubId: string,
    page: number = 1,
    perPage: number = 20,
  ): Promise<ClubPostsResponse> {
    return api.get<ClubPostsResponse>(
      `/clubs/${clubId}/posts?page=${page}&per_page=${perPage}`,
      true,
    );
  }

  /**
   * Toggle like on a post (like if not liked, unlike if already liked)
   */
  togglePostLike(
    postId: string,
  ): Promise<{ liked: boolean; like_count: number }> {
    return api.post<{ liked: boolean; like_count: number }>(
      `/posts/${postId}/like`,
      {},
      true,
    );
  }
}

export type ClubPostsResponse = {
  posts: ClubPost[];
  pagination: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

export type ClubPost = {
  id: string;
  caption: string | null;
  status: string;
  user_id: string;
  club_id: string;
  club_approved_at: string | null;
  is_club_approved: boolean;
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  assets: Array<{
    id: string;
    filename: string;
    url: string;
    meta: Record<string, any>;
    type: string;
    duration?: number;
    start_time?: number;
    end_time?: number;
  }>;
  inserted_at: string;
  updated_at: string;
  media_type: string | null;
  media_url: string | null;
  like_count: number;
  has_liked: boolean;
};

export const clubsService = new ClubsService();
