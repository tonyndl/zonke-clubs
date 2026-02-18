export interface BeerStats {
  total_beers: number;
  total_litres: number; // Total volume in litres
  unique_brands: number;
  unique_types: number;
  favorite_brand?: string;
  favorite_type?: string;
  favorite_serving?: string;
  current_streak: number;
  longest_streak: number;
  first_beer_date?: string;
  last_beer_date?: string;
  brands_breakdown: Record<string, number>; // Count per brand
  types_breakdown: Record<string, number>; // Count per type
  brands_litres: Record<string, number>; // Litres per brand
  global_rank?: number; // User's global rank (1-based)
  total_users?: number; // Total users in ranking
}

export interface BeerDetection {
  id: string;
  brand?: string;
  beer_type?: string;
  serving_format?: string;
  volume_ml?: number; // Volume in millilitres
  serial_code?: string; // Unique bottle/can code
  detected_at: string;
  confidence?: number;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "special";
  is_hidden: boolean;
}

export interface UserBadge extends Badge {
  unlocked_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  total_litres: number;
  total_beers: number;
  rank: number;
  is_current_user?: boolean;
}

export interface BrandLeaderboard {
  brand: string;
  entries: LeaderboardEntry[];
}

export interface BeerAnalyticsData {
  stats: BeerStats;
  recent_beers: BeerDetection[];
  unlocked_badges: UserBadge[];
  all_badges: Badge[];
  global_leaderboard?: LeaderboardEntry[]; // Top 10 overall
  brand_leaderboards?: BrandLeaderboard[]; // Top brands with their top 10
}

// Standard beer volumes in millilitres
export const BEER_VOLUMES = {
  bottle: 330, // Standard bottle
  can: 440, // Standard can
  draft: 568, // Pint
  pint: 568,
  half_pint: 284,
  large_bottle: 500,
  small_bottle: 275,
} as const;

// Helper to format litres
export function formatLitres(litres: number): string {
  if (litres >= 1) {
    return `${litres.toFixed(1)}L`;
  }
  return `${(litres * 1000).toFixed(0)}ml`;
}
