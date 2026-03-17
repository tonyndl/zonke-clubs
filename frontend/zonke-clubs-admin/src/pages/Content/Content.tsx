import React, { useState, useEffect, useRef } from "react";
import { Card, CardTitle, CardDescription } from "../../components/Card";
import {
  PrimaryButton,
  OutlineButton,
  DangerButton,
} from "../../components/Buttons";
import { apiService } from "../../services/api";
import { adminSocketService } from "../../services/adminSocketService";
import {
  RiCheckLine,
  RiCloseLine,
  RiUserLine,
  RiTimeLine,
  RiPlayCircleFill,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiHeartFill,
  RiSearchLine,
} from "react-icons/ri";
import {
  ContentContainer,
  PageHeader,
  HeaderLeft,
  PageTitle,
  PageDescription,
  FilterTabs,
  FilterTab,
  PostsGrid,
  PostCard,
  PostHeader,
  UserAvatar,
  UserInfo,
  Username,
  PostTime,
  StatusBadge,
  PostImage,
  PostVideo,
  VideoWrapper,
  PlayIconOverlay,
  PostContent,
  PostCaption,
  LikesDisplay,
  PostActions,
  EmptyState,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  DetailImage,
  DetailVideo,
  DetailSection,
  DetailUserSection,
  DetailAvatar,
  DetailUserInfo,
  DetailUsername,
  DetailTimestamp,
  DetailLabel,
  DetailCaption,
  DetailMetadata,
  MetadataItem,
  MetadataLabel,
  MetadataValue,
  ModalActions,
  StatsRow,
  StatCard,
  StatValue,
  StatLabel,
  PaginationContainer,
  PageButton,
  PageInfo,
  SearchBar,
  SearchIconWrapper,
  SearchInput,
} from "./styles";

export const Content: React.FC = () => {
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [viewingPost, setViewingPost] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterRef = useRef(filter);
  const searchRef = useRef(search);
  const currentPageRef = useRef(currentPage);
  const perPage = 20;

  // Keep refs in sync with state for use in stable callbacks
  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    doFetch(1, "pending", "");
    fetchStats();

    // Connect to channel for real-time updates
    const token = localStorage.getItem("auth_token");
    const adminInfo = apiService.getAdminInfo();
    if (token && adminInfo?.id) {
      adminSocketService.connect(token, adminInfo.id);
    }

    const unsubSubmitted = adminSocketService.on("post_submitted", () => {
      fetchStats();
      if (filterRef.current === "pending") {
        doFetch(1, "pending", searchRef.current);
      }
    });

    const unsubModerated = adminSocketService.on("post_moderated", () => {
      fetchStats();
      doFetch(currentPageRef.current, filterRef.current, searchRef.current);
    });

    return () => {
      unsubSubmitted();
      unsubModerated();
    };
  }, []);

  const transformPosts = (raw: any[]) =>
    raw.map((post: any) => {
      const firstAsset =
        post.assets && post.assets.length > 0 ? post.assets[0] : null;
      const isVideo = firstAsset?.type === "video";
      return {
        id: post.id,
        user_id: post.user_id,
        username: post.user?.username || "Unknown User",
        user_avatar: post.user?.avatar_url || "https://i.pravatar.cc/150?img=0",
        caption: post.caption || "",
        image: !isVideo && firstAsset ? firstAsset.url : null,
        video: isVideo && firstAsset ? firstAsset.url : null,
        status: post.status,
        is_club_approved: post.is_club_approved,
        time_remaining: post.time_remaining,
        like_count: post.like_count || 0,
        assets: post.assets || [],
        inserted_at: post.inserted_at,
        updated_at: post.updated_at,
        club_approved_at: post.club_approved_at,
      };
    });

  const doFetch = (page: number, status: string, searchQ: string) => {
    setIsLoading(true);
    apiService
      .getPosts(page, perPage, status, undefined, searchQ || undefined)
      .then((response) => {
        setPosts(transformPosts(response.posts));
        setTotalPages(response.pagination.total_pages);
        setCurrentPage(page);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleFilterChange = (
    newFilter: "pending" | "approved" | "rejected",
  ) => {
    setFilter(newFilter);
    doFetch(1, newFilter, search);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      doFetch(1, filter, val);
    }, 400);
  };

  const handlePageChange = (newPage: number) => {
    doFetch(newPage, filter, search);
  };

  const fetchStats = () => {
    apiService
      .getPostsStats()
      .then((response) => {
        setStats(response);
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
      });
  };

  const handleVideoHover = (
    videoRef: HTMLVideoElement | null,
    isHovering: boolean,
  ) => {
    if (!videoRef) return;

    if (isHovering) {
      videoRef.play().catch(() => {
        // Ignore play errors (e.g., user hasn't interacted with page yet)
      });
    } else {
      videoRef.pause();
      videoRef.currentTime = 0;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  const handleApprove = (postId: string) => {
    apiService
      .approvePost(postId)
      .then(() => {
        doFetch(currentPage, filter, search);
        fetchStats();
      })
      .catch((error) => {
        console.error("Error approving post:", error);
        alert("Failed to approve post. Please try again.");
      });
  };

  const handleReject = (postId: string) => {
    apiService
      .rejectPost(postId)
      .then(() => {
        doFetch(currentPage, filter, search);
        fetchStats();
      })
      .catch((error) => {
        console.error("Error rejecting post:", error);
        alert("Failed to reject post. Please try again.");
      });
  };

  const openViewModal = (post: any) => {
    setViewingPost(post);
  };

  const closeViewModal = () => {
    setViewingPost(null);
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ContentContainer>
      <PageHeader>
        <HeaderLeft>
          <PageTitle>Content Moderation</PageTitle>
          <PageDescription>
            Review and moderate user-generated content to maintain quality and
            community standards.
          </PageDescription>
        </HeaderLeft>
      </PageHeader>

      <ModalOverlay isOpen={viewingPost !== null} onClick={closeViewModal}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          {viewingPost && (
            <>
              <ModalHeader>
                <ModalTitle>Post Details</ModalTitle>
                <CloseButton onClick={closeViewModal}>
                  {React.createElement(RiCloseLine as React.ComponentType)}
                </CloseButton>
              </ModalHeader>

              <ModalBody>
                <DetailUserSection>
                  <DetailAvatar
                    src={viewingPost.user_avatar}
                    alt={viewingPost.username}
                  />
                  <DetailUserInfo>
                    <DetailUsername>{viewingPost.username}</DetailUsername>
                    <DetailTimestamp>
                      {React.createElement(RiTimeLine as React.ComponentType)}
                      Posted {formatFullDate(viewingPost.inserted_at)}
                    </DetailTimestamp>
                  </DetailUserInfo>
                  <StatusBadge status={viewingPost.status}>
                    {viewingPost.status}
                  </StatusBadge>
                </DetailUserSection>

                {viewingPost.video && (
                  <DetailVideo
                    src={viewingPost.video}
                    controls
                    playsInline
                    autoPlay
                    muted
                  />
                )}

                {!viewingPost.video && viewingPost.image && (
                  <DetailImage src={viewingPost.image} alt="Post content" />
                )}

                <DetailSection>
                  <DetailLabel>Caption</DetailLabel>
                  <DetailCaption>{viewingPost.caption}</DetailCaption>
                </DetailSection>

                {viewingPost.like_count > 0 && (
                  <DetailSection>
                    <DetailLabel>Engagement</DetailLabel>
                    <LikesDisplay style={{ marginBottom: 0 }}>
                      {React.createElement(RiHeartFill as React.ComponentType)}
                      <span>
                        {viewingPost.like_count}{" "}
                        {viewingPost.like_count === 1 ? "like" : "likes"}
                      </span>
                    </LikesDisplay>
                  </DetailSection>
                )}

                {/* <DetailSection>
                  <DetailLabel>Post Information</DetailLabel>
                  <DetailMetadata>
                    <MetadataItem>
                      <MetadataLabel>Post ID</MetadataLabel>
                      <MetadataValue>{viewingPost.id}</MetadataValue>
                    </MetadataItem>
                    <MetadataItem>
                      <MetadataLabel>Status</MetadataLabel>
                      <MetadataValue style={{ textTransform: 'capitalize' }}>
                        {viewingPost.status}
                      </MetadataValue>
                    </MetadataItem>
                    <MetadataItem>
                      <MetadataLabel>Posted Date</MetadataLabel>
                      <MetadataValue>
                        {new Date(viewingPost.inserted_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </MetadataValue>
                    </MetadataItem>
                  </DetailMetadata>
                </DetailSection> */}
              </ModalBody>

              <ModalActions>
                {viewingPost.status === "pending" && (
                  <>
                    <PrimaryButton
                      fullWidth
                      onClick={() => {
                        handleApprove(viewingPost.id);
                        closeViewModal();
                      }}
                    >
                      {React.createElement(RiCheckLine as React.ComponentType)}
                      Approve Post
                    </PrimaryButton>
                    <DangerButton
                      fullWidth
                      onClick={() => {
                        handleReject(viewingPost.id);
                        closeViewModal();
                      }}
                    >
                      {React.createElement(RiCloseLine as React.ComponentType)}
                      Reject Post
                    </DangerButton>
                  </>
                )}
                {viewingPost.status !== "pending" && (
                  <OutlineButton fullWidth onClick={closeViewModal}>
                    Close
                  </OutlineButton>
                )}
              </ModalActions>
            </>
          )}
        </ModalContainer>
      </ModalOverlay>

      {/* <StatsRow>
        <StatCard>
          <StatValue>{pendingCount}</StatValue>
          <StatLabel>Pending Review</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{approvedCount}</StatValue>
          <StatLabel>Approved</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{rejectedCount}</StatValue>
          <StatLabel>Rejected</StatLabel>
        </StatCard>
      </StatsRow> */}

      <FilterTabs>
        <FilterTab
          active={filter === "pending"}
          onClick={() => handleFilterChange("pending")}
        >
          <span>Pending ({stats.pending})</span>
        </FilterTab>
        <FilterTab
          active={filter === "approved"}
          onClick={() => handleFilterChange("approved")}
        >
          <span>Approved ({stats.approved})</span>
        </FilterTab>
        <FilterTab
          active={filter === "rejected"}
          onClick={() => handleFilterChange("rejected")}
        >
          <span>Rejected ({stats.rejected})</span>
        </FilterTab>
      </FilterTabs>

      <SearchBar>
        <SearchIconWrapper>
          {React.createElement(RiSearchLine as React.ComponentType)}
        </SearchIconWrapper>
        <SearchInput
          type="text"
          placeholder="Search by username or caption..."
          value={search}
          onChange={handleSearchChange}
        />
      </SearchBar>

      {isLoading ? (
        <EmptyState>
          <CardDescription>Loading content...</CardDescription>
        </EmptyState>
      ) : posts.length > 0 ? (
        <>
          <PostsGrid>
            {posts.map((post) => (
              <PostCard key={post.id}>
                <PostHeader>
                  <UserAvatar src={post.user_avatar} alt={post.username} />
                  <UserInfo>
                    <Username>{post.username}</Username>
                    <PostTime>
                      {React.createElement(RiTimeLine as React.ComponentType)}
                      {formatTimeAgo(post.inserted_at)}
                    </PostTime>
                  </UserInfo>
                  <StatusBadge status={post.status}>{post.status}</StatusBadge>
                </PostHeader>

                {post.video && (
                  <VideoWrapper
                    onClick={() => openViewModal(post)}
                    onMouseEnter={(e) => {
                      const video = e.currentTarget.querySelector("video");
                      handleVideoHover(video, true);
                    }}
                    onMouseLeave={(e) => {
                      const video = e.currentTarget.querySelector("video");
                      handleVideoHover(video, false);
                    }}
                  >
                    <PostVideo
                      src={post.video}
                      controls={false}
                      loop
                      muted
                      playsInline
                    />
                    <PlayIconOverlay>
                      {React.createElement(
                        RiPlayCircleFill as React.ComponentType,
                      )}
                    </PlayIconOverlay>
                  </VideoWrapper>
                )}

                {!post.video && post.image && (
                  <PostImage
                    src={post.image}
                    alt="Post content"
                    onClick={() => openViewModal(post)}
                  />
                )}

                <PostContent>
                  <PostCaption>{post.caption}</PostCaption>

                  {post.like_count > 0 && (
                    <LikesDisplay>
                      {React.createElement(RiHeartFill as React.ComponentType)}
                      <span>
                        {post.like_count}{" "}
                        {post.like_count === 1 ? "like" : "likes"}
                      </span>
                    </LikesDisplay>
                  )}

                  {post.status === "pending" && (
                    <PostActions>
                      <PrimaryButton
                        fullWidth
                        onClick={() => handleApprove(post.id)}
                      >
                        {React.createElement(
                          RiCheckLine as React.ComponentType,
                        )}
                        Approve
                      </PrimaryButton>
                      <DangerButton
                        fullWidth
                        onClick={() => handleReject(post.id)}
                      >
                        {React.createElement(
                          RiCloseLine as React.ComponentType,
                        )}
                        Reject
                      </DangerButton>
                    </PostActions>
                  )}
                </PostContent>
              </PostCard>
            ))}
          </PostsGrid>

          {totalPages > 1 && (
            <PaginationContainer>
              <PageButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {React.createElement(RiArrowLeftLine as React.ComponentType)}
                Previous
              </PageButton>
              <PageInfo>
                Page {currentPage} of {totalPages}
              </PageInfo>
              <PageButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
                {React.createElement(RiArrowRightLine as React.ComponentType)}
              </PageButton>
            </PaginationContainer>
          )}
        </>
      ) : (
        <EmptyState>
          {React.createElement(RiUserLine as React.ComponentType)}
          <CardTitle>No posts found</CardTitle>
          <CardDescription>
            {`No ${filter} posts at the moment`}
          </CardDescription>
        </EmptyState>
      )}
    </ContentContainer>
  );
};
