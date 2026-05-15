// User & Authentication
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  account_type: "club-account" | "club-goer";
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "club_admin" | "super_admin";
  avatar_url?: string;
  active: boolean;
  inserted_at: string;
  updated_at: string;
}

export interface AuthResponse {
  jwt: string;
  admin: Admin;
}

// Club / Business Profile
export interface Club {
  id: string;
  name: string;
  description: string;
  cover_image?: string;
  logo?: string;
  phone: string;
  email?: string;
  website?: string;
  address: string;
  followers_count: number;
  rating: number;
  opening_hours: OpeningHours;
  dj_schedule: DJSchedule;
  media: MediaItem[];
  inserted_at: string;
  updated_at: string;
}

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string; // 24-hour format "09:00"
  close: string; // 24-hour format "02:00"
  closed: boolean;
}

// Events
export interface Event {
  id: string;
  admin_id: string;
  title: string;
  description: string;
  cover_image?: string;
  date: string;
  start_time: string;
  end_time?: string;
  general_entry_price: number;
  vip_entry_price: number;
  dj_lineup: string[];
  status: "draft" | "published";
  inserted_at: string;
  updated_at: string;
}

export interface DJ {
  id: string;
  name: string;
  genre?: string;
  start_time?: string;
  end_time?: string;
}

export interface DJSchedule {
  monday: DJ[];
  tuesday: DJ[];
  wednesday: DJ[];
  thursday: DJ[];
  friday: DJ[];
  saturday: DJ[];
  sunday: DJ[];
}

// Content & Posts
export interface Post {
  id: string;
  user_id: string;
  username: string;
  user_avatar?: string;
  caption: string;
  image?: string;
  video?: string;
  club_id: string;
  status: "pending" | "approved" | "rejected";
  like_count: number;
  inserted_at: string;
  updated_at: string;
}

// Media
export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  thumbnail?: string;
  inserted_at: string;
}

// Spending
export interface SpendingRecord {
  id: string;
  club_id: string;
  user_id: string;
  username: string;
  user_avatar?: string;
  amount: number;
  visit_date: string;
  notes?: string;
  rank?: number;
  position_change?: number | "new";
  inserted_at: string;
  updated_at: string;
}

export interface GroupSpending {
  members: string[]; // User IDs
  total_amount: number;
  split_amount: number;
  visit_date: string;
  notes?: string;
}

// Settings
export interface PostingPermissions {
  who_can_post: {
    all_visitors: boolean;
    only_connections: boolean;
    verified_only: boolean;
  };
  content_moderation: {
    require_approval: boolean;
    club_tag_required: boolean;
  };
  allowed_content_types: {
    allow_videos: boolean;
    multiple_photos: boolean;
  };
}

export interface BlockedUser {
  id: string;
  user_id: string;
  username: string;
  user_avatar?: string;
  reason: string;
  blocked_at: string;
}

export interface ContentGuideline {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface Subscription {
  id: string;
  plan: "basic" | "pro" | "premium";
  price: number;
  renewal_date: string;
  status: "active" | "cancelled" | "expired";
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

// Analytics
export interface DashboardStats {
  new_favorites: number;
  active_meetups: number;
  upcoming_events: number;
  avg_rating: number;
  weekly_highlights: {
    trending_events: string[];
    peak_nights: string[];
  };
}

export interface SpendingStats {
  total_recorded: number;
  unique_visitors: number;
  total_records: number;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
