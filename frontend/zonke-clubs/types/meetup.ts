export type ActivityType =
  | "dancing_partner"
  | "drinking_buddy"
  | "new_friends"
  | "open_to_anything";

export type ConnectionStatus = "pending" | "accepted" | "declined" | "expired";

export interface MeetupUser {
  id: string;
  username: string;
  avatarUrl?: string;
  age?: number;
  bio?: string;
}

export interface MeetupIntention {
  id: string;
  activityType: ActivityType;
  clubId: string;
  clubName?: string; // Club name (for dummy data or if returned by API)
  plannedDate: string; // ISO date string (YYYY-MM-DD)
  plannedTime?: string; // Optional time like "evening", "late night", or specific time
  time?: string; // Display time string (e.g., "9:00 PM", "Evening", "Late Night")
  message?: string;
  active: boolean;
  expiresAt?: string;
  user: MeetupUser;
  createdAt: string;
}

// Helper to format planned date for display
export function formatPlannedDate(dateStr: string): string {
  // Parse date in local timezone to avoid UTC conversion issues
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time for comparison
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return "Tonight";
  } else if (date.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  } else {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  }
}

export interface ConnectionRequest {
  id: string;
  status: ConnectionStatus;
  message?: string;
  clubId: string;
  sender: MeetupUser;
  receiver: MeetupUser;
  intention?: MeetupIntention;
  createdAt: string;
}

export const ACTIVITY_CONFIG: Record<
  ActivityType,
  {
    label: string;
    shortLabel: string;
    icon: string;
    emoji: string;
    color: string;
  }
> = {
  dancing_partner: {
    label: "Looking for a Dancing Partner",
    shortLabel: "Dancing",
    icon: "musical-notes",
    emoji: "💃",
    color: "#FF6B9D",
  },
  drinking_buddy: {
    label: "Looking for a Drinking Buddy",
    shortLabel: "Drinks",
    icon: "beer-outline",
    emoji: "🍻",
    color: "#FFB347",
  },
  new_friends: {
    label: "Looking to Make New Friends",
    shortLabel: "Friends",
    icon: "people",
    emoji: "👋",
    color: "#7DD3FC",
  },
  open_to_anything: {
    label: "Open to Anything",
    shortLabel: "Open",
    icon: "sparkles",
    emoji: "✨",
    color: "#A78BFA",
  },
};

// Get intentions for a club - only returns real API data
export function getIntentionsForClub(
  realIntentions: MeetupIntention[] = [],
): MeetupIntention[] {
  // Only return real intentions from the API
  return realIntentions;
}
