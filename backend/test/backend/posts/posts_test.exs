defmodule Backend.Posts.PostsTest do
  use Backend.DataCase, async: true
  use Backend.MoxCase

  alias Backend.Posts.{Post, Posts}

  import Backend.Factory

  setup do
    user = insert(:user)
    business_profile = insert(:business_profile, user: user)

    {:ok, tmp} = Briefly.create()
    File.write!(tmp, "test file content")

    asset = %{file_path: tmp, filename: "uploads/test.png"}

    params = %{
      description: "I am looking for a truck post to drive this truck",
      business_profile_id: business_profile.id,
      asset: asset
    }

    session = %{user_id: user.id}

    %{
      params: params,
      business_profile: business_profile,
      session: session
    }
  end

  describe "create/1" do
    test "successfully creates a post", %{params: params, business_profile: business_profile} do
      assert {:ok, %Post{} = post} = Posts.create(params)

      preloaded_post = Repo.preload(post, :asset)

      assert preloaded_post.business_profile_id == business_profile.id
      assert is_binary(preloaded_post.asset.url)
    end

    test "returns error for invalid params", %{params: params} do
      params = Map.delete(params, :description)

      assert {:error, :post, %Ecto.Changeset{}} = Posts.create(params)
    end
  end

  describe "update/2" do
    test "successfully updates a post", %{params: params} do
      {:ok, post} = Posts.create(params)

      updated_params = %{description: "Looking for someone who can drive a scooter"}

      assert {:ok, %Post{} = updated_post} = Posts.update(post, updated_params)
      assert updated_post.description == updated_params.description
    end
  end

  describe "delete/1" do
    test "successfully deletes a post", %{params: params} do
      {:ok, post} = Posts.create(params)

      assert {:ok, _} = Posts.delete(post)
      assert {:error, :not_found} = Posts.get_post(post.id)
    end
  end

  describe "get_posts/1" do
    test "returns user posts if found", %{
      params: params,
      session: session,
      business_profile: business_profile
    } do
      insert_list(10, :post)
      insert_list(2, :post, business_profile: business_profile)

      {:ok, _posts, %{total_count: total_count}} = Posts.get_posts(%{}, session)

      assert total_count == 2
    end
  end

  describe "get_posts/2" do
    test "returns public posts if found" do
      insert_list(10, :post)

      {:ok, _posts, %{total_count: total_count}} = Posts.get_posts(%{}, :public)

      assert total_count == 10
    end
  end
end
