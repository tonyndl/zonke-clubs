defmodule Backend.PostsTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Posts
  alias Backend.Posts.Post

  describe "create_post/1" do
    test "creates post with valid attributes" do
      user = insert(:user)
      club = insert(:club)

      attrs = %{
        "user_id" => user.id,
        "club_id" => club.id,
        "caption" => "Amazing night at the club!",
        "media_type" => "image",
        "media_url" => "https://example.com/image.jpg"
      }

      assert {:ok, post} = Posts.create_post(attrs)
      assert post.caption == "Amazing night at the club!"
      assert post.user_id == user.id
      assert post.club_id == club.id
      assert post.status == "pending"
    end

    test "creates post without user (admin post)" do
      club = insert(:club)

      attrs = %{
        "club_id" => club.id,
        "caption" => "Official club announcement"
      }

      assert {:ok, post} = Posts.create_post(attrs)
      assert is_nil(post.user_id)
      assert post.club_id == club.id
    end

    test "validates required club_id" do
      assert {:error, changeset} = Posts.create_post(%{})
      assert "can't be blank" in errors_on(changeset).club_id
    end

    test "validates status is valid value" do
      club = insert(:club)

      attrs = %{
        "club_id" => club.id,
        "status" => "invalid_status"
      }

      assert {:error, changeset} = Posts.create_post(attrs)
      assert "is invalid" in errors_on(changeset).status
    end

    test "validates media_type is valid value" do
      club = insert(:club)

      attrs = %{
        "club_id" => club.id,
        "media_type" => "audio"
      }

      assert {:error, changeset} = Posts.create_post(attrs)
      assert "is invalid" in errors_on(changeset).media_type
    end
  end

  describe "get_post/1" do
    test "returns post with user and assets preloaded" do
      post = insert(:post)
      asset = insert(:asset, post_id: post.id, user: post.user)

      assert {:ok, found} = Posts.get_post(post.id)
      assert found.id == post.id
      assert found.user.id == post.user_id
      assert length(found.assets) == 1
      assert hd(found.assets).id == asset.id
    end

    test "returns error when post not found" do
      assert {:error, :not_found} = Posts.get_post(Ecto.UUID.generate())
    end
  end

  describe "list_posts/2" do
    test "returns paginated posts for club with assets" do
      club = insert(:club)
      user = insert(:user)

      # Create posts with assets
      post1 = insert(:post, club: club, user: user, inserted_at: ~N[2024-01-01 10:00:00])
      insert(:asset, post_id: post1.id, user: user)

      post2 = insert(:post, club: club, user: user, inserted_at: ~N[2024-01-02 10:00:00])
      insert(:asset, post_id: post2.id, user: user)

      # Post without asset should be excluded
      _post_no_asset = insert(:post, club: club, user: user)

      result = Posts.list_posts(club.id, page: 1, per_page: 10)

      assert result.total_count == 2
      assert length(result.posts) == 2
      assert result.page == 1
      assert result.has_next == false
      assert result.has_prev == false

      # Should be ordered by inserted_at desc (most recent first)
      assert Enum.map(result.posts, & &1.id) == [post2.id, post1.id]
    end

    test "filters by status" do
      club = insert(:club)
      user = insert(:user)

      approved = insert(:post, status: "approved", club: club, user: user)
      insert(:asset, post_id: approved.id, user: user)

      pending = insert(:post, status: "pending", club: club, user: user)
      insert(:asset, post_id: pending.id, user: user)

      result = Posts.list_posts(club.id, status: "approved")

      assert result.total_count == 1
      assert hd(result.posts).id == approved.id
    end

    test "filters out pending posts older than 24 hours" do
      club = insert(:club)
      user = insert(:user)

      # Recent pending post (within 24 hours)
      recent_pending = insert(:post,
        status: "pending",
        club: club,
        user: user,
        inserted_at: NaiveDateTime.add(NaiveDateTime.utc_now(), -20 * 60 * 60, :second)
      )
      insert(:asset, post_id: recent_pending.id, user: user)

      # Old pending post (over 24 hours)
      old_pending = insert(:post,
        status: "pending",
        club: club,
        user: user,
        inserted_at: NaiveDateTime.add(NaiveDateTime.utc_now(), -30 * 60 * 60, :second)
      )
      insert(:asset, post_id: old_pending.id, user: user)

      result = Posts.list_posts(club.id, status: "pending")

      # Should only return recent pending post
      assert result.total_count == 1
      assert hd(result.posts).id == recent_pending.id
    end

    test "includes like count and has_liked status" do
      club = insert(:club)
      user1 = insert(:user)
      user2 = insert(:user)

      post = insert(:post, club: club, user: user1)
      insert(:asset, post_id: post.id, user: user1)

      # User1 and another user like the post
      insert(:post_like, post: post, user: user1)
      insert(:post_like, post: post, user: user2)

      result = Posts.list_posts(club.id, user_id: user1.id)

      post_result = hd(result.posts)
      assert post_result.like_count == 2
      assert post_result.has_liked == true
    end

    test "pagination works correctly" do
      club = insert(:club)
      user = insert(:user)

      # Create 5 posts with assets
      for i <- 1..5 do
        post = insert(:post, club: club, user: user)
        insert(:asset, post_id: post.id, user: user)
      end

      # Page 1 (first 2 posts)
      page1 = Posts.list_posts(club.id, page: 1, per_page: 2)
      assert length(page1.posts) == 2
      assert page1.page == 1
      assert page1.total_count == 5
      assert page1.total_pages == 3
      assert page1.has_next == true
      assert page1.has_prev == false

      # Page 2 (next 2 posts)
      page2 = Posts.list_posts(club.id, page: 2, per_page: 2)
      assert length(page2.posts) == 2
      assert page2.has_next == true
      assert page2.has_prev == true

      # Page 3 (last post)
      page3 = Posts.list_posts(club.id, page: 3, per_page: 2)
      assert length(page3.posts) == 1
      assert page3.has_next == false
      assert page3.has_prev == true
    end
  end

  describe "approve_post/1" do
    test "approves post and sets club_approved_at timestamp" do
      post = insert(:post, status: "pending")

      assert {:ok, approved} = Posts.approve_post(post.id)
      assert approved.status == "approved"
      assert approved.club_approved_at != nil
    end

    test "returns error when post not found" do
      assert {:error, :not_found} = Posts.approve_post(Ecto.UUID.generate())
    end
  end

  describe "reject_post/1" do
    test "rejects post" do
      post = insert(:post, status: "pending")

      assert {:ok, rejected} = Posts.reject_post(post.id)
      assert rejected.status == "rejected"
    end

    test "returns error when post not found" do
      assert {:error, :not_found} = Posts.reject_post(Ecto.UUID.generate())
    end
  end

  describe "get_stats/1" do
    test "returns post statistics for club" do
      club = insert(:club)
      user = insert(:user)

      # Create posts with different statuses (all with assets)
      approved1 = insert(:post, status: "approved", club: club, user: user)
      insert(:asset, post_id: approved1.id, user: user)

      approved2 = insert(:post, status: "approved", club: club, user: user)
      insert(:asset, post_id: approved2.id, user: user)

      rejected = insert(:post, status: "rejected", club: club, user: user)
      insert(:asset, post_id: rejected.id, user: user)

      pending = insert(:post, status: "pending", club: club, user: user)
      insert(:asset, post_id: pending.id, user: user)

      stats = Posts.get_stats(club.id)

      assert stats.approved == 2
      assert stats.rejected == 1
      assert stats.pending == 1
      assert stats.total == 4
    end

    test "only counts pending posts within 24 hours" do
      club = insert(:club)
      user = insert(:user)

      # Recent pending (within 24 hours)
      recent = insert(:post,
        status: "pending",
        club: club,
        user: user,
        inserted_at: NaiveDateTime.add(NaiveDateTime.utc_now(), -20 * 60 * 60, :second)
      )
      insert(:asset, post_id: recent.id, user: user)

      # Old pending (over 24 hours)
      old = insert(:post,
        status: "pending",
        club: club,
        user: user,
        inserted_at: NaiveDateTime.add(NaiveDateTime.utc_now(), -30 * 60 * 60, :second)
      )
      insert(:asset, post_id: old.id, user: user)

      stats = Posts.get_stats(club.id)

      # Only counts recent pending
      assert stats.pending == 1
      # But total includes both
      assert stats.total == 2
    end

    test "only counts posts with assets" do
      club = insert(:club)
      user = insert(:user)

      # Post with asset
      with_asset = insert(:post, status: "approved", club: club, user: user)
      insert(:asset, post_id: with_asset.id, user: user)

      # Post without asset
      _without_asset = insert(:post, status: "approved", club: club, user: user)

      stats = Posts.get_stats(club.id)

      assert stats.approved == 1
      assert stats.total == 1
    end
  end

  describe "get_dashboard_stats/1" do
    test "returns dashboard statistics for club" do
      club = insert(:club)
      user = insert(:user)

      # Create posts with assets
      post1 = insert(:post, club: club, user: user, status: "approved")
      insert(:asset, post_id: post1.id, user: user)

      post2 = insert(:post, club: club, user: user, status: "approved")
      insert(:asset, post_id: post2.id, user: user)

      pending = insert(:post, club: club, user: user, status: "pending")
      insert(:asset, post_id: pending.id, user: user)

      # Add likes
      insert(:post_like, post: post1, user: user)
      insert(:post_like, post: post2, user: user)

      stats = Posts.get_dashboard_stats(club.id)

      assert stats.total_posts == 3
      assert stats.pending_posts == 1
      assert stats.total_likes == 2
    end

    test "only counts posts with assets" do
      club = insert(:club)
      user = insert(:user)

      # Post with asset
      with_asset = insert(:post, club: club, user: user)
      insert(:asset, post_id: with_asset.id, user: user)

      # Post without asset
      _without_asset = insert(:post, club: club, user: user)

      stats = Posts.get_dashboard_stats(club.id)

      assert stats.total_posts == 1
    end
  end

  describe "update_post/2" do
    test "updates post caption" do
      post = insert(:post, caption: "Old caption")

      assert {:ok, updated} = Posts.update_post(post, %{"caption" => "New caption"})
      assert updated.caption == "New caption"
    end

    test "validates on update" do
      post = insert(:post)

      assert {:error, changeset} = Posts.update_post(post, %{"status" => "invalid"})
      assert "is invalid" in errors_on(changeset).status
    end
  end

  describe "delete_post/1" do
    test "deletes post and its assets" do
      user = insert(:user)
      post = insert(:post, user: user)
      asset = insert(:asset, post_id: post.id, user: user)

      assert {:ok, deleted} = Posts.delete_post(post)
      assert deleted.id == post.id

      # Verify post is gone
      assert {:error, :not_found} = Posts.get_post(post.id)
    end
  end

  describe "toggle_like/2" do
    test "creates like when not already liked" do
      user = insert(:user)
      post = insert(:post, user: user)

      assert {:ok, result} = Posts.toggle_like(post.id, user.id)
      assert result.liked == true
      assert result.like_count == 1
    end

    test "removes like when already liked" do
      user = insert(:user)
      post = insert(:post, user: user)
      insert(:post_like, post: post, user: user)

      assert {:ok, result} = Posts.toggle_like(post.id, user.id)
      assert result.liked == false
      assert result.like_count == 0
    end

    test "multiple users can like same post" do
      user1 = insert(:user)
      user2 = insert(:user)
      post = insert(:post, user: user1)

      assert {:ok, result1} = Posts.toggle_like(post.id, user1.id)
      assert result1.liked == true

      assert {:ok, result2} = Posts.toggle_like(post.id, user2.id)
      assert result2.liked == true
      assert result2.like_count == 2
    end
  end

  describe "get_like_count/1" do
    test "returns count of likes for post" do
      post = insert(:post)
      user1 = insert(:user)
      user2 = insert(:user)

      insert(:post_like, post: post, user: user1)
      insert(:post_like, post: post, user: user2)

      assert Posts.get_like_count(post.id) == 2
    end

    test "returns 0 when no likes" do
      post = insert(:post)

      assert Posts.get_like_count(post.id) == 0
    end
  end

  describe "has_user_liked?/2" do
    test "returns true when user has liked post" do
      user = insert(:user)
      post = insert(:post, user: user)
      insert(:post_like, post: post, user: user)

      assert Posts.has_user_liked?(post.id, user.id) == true
    end

    test "returns false when user has not liked post" do
      user = insert(:user)
      post = insert(:post, user: user)

      assert Posts.has_user_liked?(post.id, user.id) == false
    end

    test "returns false when user_id is nil" do
      post = insert(:post)

      assert Posts.has_user_liked?(post.id, nil) == false
    end
  end
end
