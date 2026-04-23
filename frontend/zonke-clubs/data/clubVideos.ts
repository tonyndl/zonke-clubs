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

// LocalStack S3 base — update LOCAL_IP to match your machine's IP
// Same IP used in services/api.ts and services/websocketService.ts
const LOCAL_IP = "192.168.1.140";
const S3_BASE = `http://${LOCAL_IP}:4566/zonke-clubs-bucket/club-videos`;

export const CLUB_VIDEOS: Record<string, ClubVideo[]> = {
  default: [
    {
      id: "vid-1",
      url: `${S3_BASE}/vid1.mp4`,
      duration: 30,
      uploaded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 834,
    },
    {
      id: "vid-2",
      url: `${S3_BASE}/vid2.mp4`,
      duration: 30,
      uploaded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 1056,
    },
    {
      id: "vid-3",
      url: `${S3_BASE}/vid3.mp4`,
      duration: 45,
      uploaded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 1523,
    },
    {
      id: "vid-4",
      url: `${S3_BASE}/vid4.mp4`,
      duration: 30,
      uploaded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 689,
    },
    {
      id: "vid-5",
      url: `${S3_BASE}/vid5.mp4`,
      duration: 15,
      uploaded_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      likes: 1178,
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
  const effectiveClubs =
    clubs.length > 0
      ? clubs
      : [
          {
            id: "demo-1",
            name: "Konka",
            location: { name: "Soweto, Johannesburg" },
          },
          { id: "demo-2", name: "Truth", location: { name: "Cape Town" } },
          {
            id: "demo-3",
            name: "Club Ultra",
            location: { name: "Sandton, Johannesburg" },
          },
        ];

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
    const club = effectiveClubs[i % effectiveClubs.length];
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
