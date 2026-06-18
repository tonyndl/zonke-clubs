export type MediaType = "image" | "video";

export interface MediaAsset {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string; // For videos
  width?: number;
  height?: number;
  duration?: number; // For videos in seconds
  startTime?: number; // For trimmed videos - start time in seconds
  endTime?: number; // For trimmed videos - end time in seconds
  // Post metadata (when media is part of a post)
  postId?: string;
  likeCount?: number;
  isLiked?: boolean;
}

export interface ClubPost {
  id: string;
  clubId: string;
  clubName?: string;
  clubLocation?: string;
  description?: string;
  media: MediaAsset[];
  likeCount: number;
  isLiked: boolean;
  likes: number;
  comments: number;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  isClubApproved: boolean;
  clubApprovedAt?: string;
  pinnedAt?: string;
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

// TODO: Posts feature requires backend implementation
// Required endpoints:
// - GET /api/clubs/:id/posts - Get approved posts for a club
// - POST /api/posts - Create a new post (with media upload)
// - DELETE /api/posts/:id - Delete user's own post
// - POST /api/posts/:id/like - Like a post
// - DELETE /api/posts/:id/like - Unlike a post
//
// Backend currently only has admin moderation endpoints:
// - GET /api/admin/posts - List all posts for moderation
// - PUT /api/admin/posts/:id/approve - Approve a post
// - PUT /api/admin/posts/:id/reject - Reject a post
//
// For now, this feature is not functional in the mobile app.
