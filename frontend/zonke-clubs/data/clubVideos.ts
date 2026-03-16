import { ClubVideo } from "@/services/clubsService";

// Helper function to format date relative to now
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
};

// Sample video URLs - using club/party atmosphere videos
// In production, these would come from your CDN/storage
// NOTE: These are placeholder videos. Replace with actual club videos in production.
export const CLUB_VIDEOS: Record<string, ClubVideo[]> = {
  // This will be populated dynamically with club IDs
  // For now, we'll use a default set of videos that simulate club atmosphere
  default: [
    {
      id: "vid-1",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=60",
      duration: 15,
      uploaded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      likes: 834,
    },
    {
      id: "vid-2",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=60",
      duration: 20,
      uploaded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      likes: 1056,
    },
    {
      id: "vid-3",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60",
      duration: 15,
      uploaded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      likes: 1523,
    },
    {
      id: "vid-4",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=60",
      duration: 15,
      uploaded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      likes: 689,
    },
    {
      id: "vid-5",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=60",
      duration: 60,
      uploaded_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      likes: 1178,
    },
    {
      id: "vid-6",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=800&q=60",
      duration: 15,
      uploaded_at: new Date(
        Date.now() - 14 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 2 weeks ago
      likes: 445,
    },
    {
      id: "vid-7",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=60",
      duration: 15,
      uploaded_at: new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 10 days ago
      likes: 312,
    },
    {
      id: "vid-8",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=60",
      duration: 30,
      uploaded_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      likes: 1456,
    },
    {
      id: "vid-9",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1519167758481-83f29da8fd14?auto=format&fit=crop&w=800&q=60",
      duration: 14,
      uploaded_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      likes: 923,
    },
    {
      id: "vid-10",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1571266028243-d220c0b3e123?auto=format&fit=crop&w=800&q=60",
      duration: 45,
      uploaded_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      likes: 1634,
    },
    {
      id: "vid-11",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=60",
      duration: 22,
      uploaded_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      likes: 567,
    },
    {
      id: "vid-12",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=60",
      duration: 11,
      uploaded_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      likes: 2103,
    },
    {
      id: "vid-13",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60",
      duration: 27,
      uploaded_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
      likes: 734,
    },
  ],
};

// Helper function to get random videos for a club
export const getClubVideos = (
  clubId: string,
  count: number = 5,
): ClubVideo[] => {
  const allVideos = CLUB_VIDEOS[clubId] || CLUB_VIDEOS.default;

  // Shuffle and return random videos
  const shuffled = [...allVideos].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Helper to get all videos from all clubs (for discovery feed).
// Distributes the video pool across nearby clubs so each video appears
// once and is attributed to a different club — then shuffles the feed.
export const getAllClubVideos = (
  clubs: Array<{ id: string; name: string; location?: { name: string } }>,
): Array<
  ClubVideo & { clubId: string; clubName: string; clubLocation?: string }
> => {
  if (clubs.length === 0) return [];

  // Shuffle the pool using Fisher-Yates so assignment is random each time
  const pool = [...CLUB_VIDEOS.default];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Assign each video to a club round-robin so there are no duplicates
  const result: Array<
    ClubVideo & { clubId: string; clubName: string; clubLocation?: string }
  > = pool.map((video, i) => {
    const club = clubs[i % clubs.length];
    return {
      ...video,
      id: `${club.id}-${video.id}`,
      clubId: club.id,
      clubName: club.name,
      clubLocation: club.location?.name,
    };
  });

  // Final shuffle so videos from the same club aren't grouped together
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};
