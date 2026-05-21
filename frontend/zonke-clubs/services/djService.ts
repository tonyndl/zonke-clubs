import { api } from "./api";

export type DJHandle = {
  platform: string;
  handle: string;
};

export type DJGig = {
  id: string;
  type: "weekly" | "specific";
  day_of_week?: number;
  day?: string;
  specific_date?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  club_id: string;
  club_name?: string;
  club_location?: { name: string; latitude: number; longitude: number };
  inserted_at: string;
};

export type DJProfile = {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  dj_genres?: string[];
  dj_handles?: DJHandle[];
};

class DJService {
  searchDJs(query: string): Promise<{ djs: DJProfile[] }> {
    const q = query ? `?q=${encodeURIComponent(query)}` : "";
    return api.get<{ djs: DJProfile[] }>(`/dj-profiles${q}`, false);
  }

  getDJ(id: string): Promise<{ dj: DJProfile }> {
    return api.get<{ dj: DJProfile }>(`/dj-profiles/${id}`, false);
  }

  getMyGigs(): Promise<{ schedules: DJGig[] }> {
    return api.get<{ schedules: DJGig[] }>("/dj-profiles/my-schedules", true);
  }

  updateMyProfile(data: {
    bio?: string;
    avatar_url?: string;
    dj_genres?: string[];
    dj_handles?: DJHandle[];
  }): Promise<{ dj: DJProfile }> {
    return api.put<{ dj: DJProfile }>("/dj-profiles/me", data, true);
  }
}

export const djService = new DJService();
