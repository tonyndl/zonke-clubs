defmodule Backend.Reviews.ReviewTest do
  use Backend.DataCase, async: true
  use Backend.MoxCase

  alias Backend.Utils.BroadcastMock
  alias Backend.Reviews.{Reviews, Review}

  import Backend.Factory

  setup do
    user = insert(:user)
    service = insert(:service, user: user)

    params = %{
      comment: "Good Service Dawg!",
      service_id: service.id
    }

    %{user: user, params: params, service: service}
  end

  describe "create/2" do
    test "successfully creates a review", %{user: user, params: params} do
      BroadcastMock
      |> Mox.expect(:broadcast, fn topic, event, payload ->
        assert payload.user_id == user.id
      end)

      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :review
      end)

      assert {:ok, %Review{} = review} = Reviews.create(params, %{user_id: user.id})
      assert review.user_id == user.id
    end

    test "returns error for invalid params", %{user: user} do
      params = %{service_id: nil, status: nil}

      assert {:error, %Ecto.Changeset{}} = Reviews.create(params, %{user_id: user.id})
    end
  end

  describe "like_or_unlike_review/2" do
    test "successfully likes a review", %{user: user, service: service} do
      review = insert(:review, user: user, service: service)

      BroadcastMock
      |> Mox.expect(:broadcast, fn topic, event, payload ->
        assert payload.user_id == user.id
      end)

      {:ok, updated_review} = Reviews.like_or_unlike_review(review, %{user_id: user.id})

      assert updated_review.likes == 1
      assert length(updated_review.users_liked) == 1
    end

    test "successfully unlikes a review", %{user: user, service: service} do
      review = insert(:review, user: user, service: service, likes: 1, users_liked: [user.id])

      BroadcastMock
      |> Mox.expect(:broadcast, fn topic, event, payload ->
        assert payload.user_id == user.id
      end)

      {:ok, updated_review} = Reviews.like_or_unlike_review(review, %{user_id: user.id})

      assert updated_review.likes == 0
      assert length(updated_review.users_liked) == 0
    end
  end

  describe "delete/1" do
    test "successfully deletes a review", %{user: user, params: params} do
      BroadcastMock
      |> Mox.expect(:broadcast, fn topic, event, payload ->
        assert payload.user_id == user.id
      end)

      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :review
      end)

      {:ok, review} = Reviews.create(params, %{user_id: user.id})

      assert {:ok, _} = Reviews.delete(review)
      assert {:error, :not_found} = Reviews.get_review(review.id)
    end
  end

  describe "get_review/1" do
    test "returns review if found", %{user: user, params: params} do
      BroadcastMock
      |> Mox.expect(:broadcast, fn topic, event, payload ->
        assert payload.user_id == user.id
      end)

      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :review
      end)

      {:ok, review} = Reviews.create(params, %{user_id: user.id})

      assert {:ok, %Review{id: id}} = Reviews.get_review(review.id)
      assert review.user_id == user.id
    end

    test "returns error if not found", %{user: user, params: params} do
      assert {:error, :not_found} = Reviews.get_review(uuid())
    end
  end
end
