import api from "./api";

export interface Asset {
  id: string;
  filename: string;
  url: string;
  meta: {
    duration?: number;
    start_time?: number;
    end_time?: number;
    width?: number;
    height?: number;
  };
  type: "image" | "video";
  duration?: number;
  start_time?: number;
  end_time?: number;
}

export interface Post {
  id: string;
  caption: string;
  status: "pending" | "approved" | "rejected";
  is_club_approved: boolean;
  club_approved_at?: string;
  pinned_at?: string;
  user_id: string;
  club_id: string;
  club_name?: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  assets: Asset[];
  inserted_at: string;
  updated_at: string;
  like_count: number;
  has_liked: boolean;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface CreatePostParams {
  club_id: string;
  asset_ids: string[];
  caption?: string;
}

class PostsService {
  /**
   * Upload a media file (image or video) to S3
   */
  async uploadMedia(
    file: {
      uri: string;
      type: "image" | "video";
      name?: string;
    },
    metadata?: {
      duration?: number;
      start_time?: number;
      end_time?: number;
    },
    onProgress?: (progress: number) => void,
  ): Promise<Asset> {
    const formData = new FormData();

    // For React Native, we need to create a file-like object
    const fileData: any = {
      uri: file.uri,
      type: file.type === "video" ? "video/mp4" : "image/jpeg",
      name:
        file.name ||
        `upload_${Date.now()}.${file.type === "video" ? "mp4" : "jpg"}`,
    };

    formData.append("file", fileData as any);

    // Add metadata if provided (for videos with trim info)
    if (metadata) {
      formData.append("meta", JSON.stringify(metadata));
    }

    return api.upload<Asset>("/assets", formData, true, onProgress);
  }

  /**
   * Create a new post with uploaded assets
   */
  async createPost(params: CreatePostParams): Promise<Post> {
    return api.post<Post>("/posts", params, true);
  }

  /**
   * Get posts for a specific club
   */
  async getClubPosts(
    clubId: string,
    page: number = 1,
    perPage: number = 20,
  ): Promise<PostsResponse> {
    return api.get<PostsResponse>(
      `/clubs/${clubId}/posts?page=${page}&per_page=${perPage}`,
      true,
    );
  }

  /**
   * Get a single post by ID
   */
  async getPost(postId: string): Promise<Post> {
    return api.get<Post>(`/posts/${postId}`, true);
  }

  /**
   * Get posts created by the current user
   */
  async getUserPosts(
    page: number = 1,
    perPage: number = 20,
  ): Promise<PostsResponse> {
    return api.get<PostsResponse>(
      `/posts/user/me?page=${page}&per_page=${perPage}`,
      true,
    );
  }

  /**
   * Get approved posts for a specific user (visible to profile viewers)
   */
  async getUserPostsById(
    userId: string,
    page: number = 1,
    perPage: number = 20,
  ): Promise<PostsResponse> {
    return api.get<PostsResponse>(
      `/posts/user/${userId}?page=${page}&per_page=${perPage}`,
      true,
    );
  }

  /**
   * Update a post's caption
   */
  async updatePost(postId: string, caption: string): Promise<Post> {
    return api.put<Post>(`/posts/${postId}`, { caption }, true);
  }

  /**
   * Delete a post and its associated assets
   */
  async deletePost(postId: string): Promise<void> {
    return api.delete(`/posts/${postId}`, true);
  }

  /**
   * Pin a post to the top of the user's profile grid
   */
  async pinPost(postId: string): Promise<Post> {
    return api.put<Post>(`/posts/${postId}/pin`, {}, true);
  }

  /**
   * Unpin a post from the user's profile grid
   */
  async unpinPost(postId: string): Promise<Post> {
    return api.put<Post>(`/posts/${postId}/unpin`, {}, true);
  }
}

export default new PostsService();
