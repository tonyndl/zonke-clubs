defmodule Backend.Accounts.PushTokensTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Accounts.PushTokens

  describe "register_token/2" do
    test "registers a new token for a user" do
      user = insert(:user)
      attrs = %{"expo_push_token" => "ExponentPushToken[abc123]", "platform" => "android"}

      assert {:ok, token} = PushTokens.register_token(user, attrs)
      assert token.expo_push_token == "ExponentPushToken[abc123]"
      assert token.user_id == user.id
      assert token.platform == "android"
    end

    test "upserts existing token to new user" do
      user1 = insert(:user)
      user2 = insert(:user)
      attrs = %{"expo_push_token" => "ExponentPushToken[shared]"}

      {:ok, _} = PushTokens.register_token(user1, attrs)
      {:ok, updated} = PushTokens.register_token(user2, attrs)

      assert updated.user_id == user2.id
      assert updated.expo_push_token == "ExponentPushToken[shared]"
    end

    test "same user re-registering the same token succeeds" do
      user = insert(:user)
      attrs = %{"expo_push_token" => "ExponentPushToken[same]"}

      {:ok, _} = PushTokens.register_token(user, attrs)
      assert {:ok, token} = PushTokens.register_token(user, attrs)
      assert token.user_id == user.id
    end
  end

  describe "get_tokens_for_user/1" do
    test "returns all tokens for a user" do
      user = insert(:user)
      PushTokens.register_token(user, %{"expo_push_token" => "ExponentPushToken[t1]"})
      PushTokens.register_token(user, %{"expo_push_token" => "ExponentPushToken[t2]"})

      tokens = PushTokens.get_tokens_for_user(user.id)
      assert length(tokens) == 2
      assert "ExponentPushToken[t1]" in tokens
      assert "ExponentPushToken[t2]" in tokens
    end

    test "returns empty list for user with no tokens" do
      user = insert(:user)
      assert PushTokens.get_tokens_for_user(user.id) == []
    end

    test "does not return tokens belonging to other users" do
      user1 = insert(:user)
      user2 = insert(:user)
      PushTokens.register_token(user1, %{"expo_push_token" => "ExponentPushToken[u1]"})
      PushTokens.register_token(user2, %{"expo_push_token" => "ExponentPushToken[u2]"})

      tokens = PushTokens.get_tokens_for_user(user1.id)
      assert tokens == ["ExponentPushToken[u1]"]
    end
  end

  describe "delete_token/2" do
    test "deletes a token belonging to the user" do
      user = insert(:user)
      PushTokens.register_token(user, %{"expo_push_token" => "ExponentPushToken[del]"})

      assert {:ok, :deleted} = PushTokens.delete_token(user, "ExponentPushToken[del]")
      assert PushTokens.get_tokens_for_user(user.id) == []
    end

    test "returns error when token not found" do
      user = insert(:user)
      assert {:error, :not_found} = PushTokens.delete_token(user, "ExponentPushToken[ghost]")
    end

    test "cannot delete another user's token" do
      user1 = insert(:user)
      user2 = insert(:user)
      PushTokens.register_token(user1, %{"expo_push_token" => "ExponentPushToken[u1]"})

      assert {:error, :not_found} = PushTokens.delete_token(user2, "ExponentPushToken[u1]")
      assert ["ExponentPushToken[u1]"] = PushTokens.get_tokens_for_user(user1.id)
    end
  end

  describe "delete_by_token/1" do
    test "deletes token by its value" do
      user = insert(:user)
      PushTokens.register_token(user, %{"expo_push_token" => "ExponentPushToken[stale]"})

      {count, _} = PushTokens.delete_by_token("ExponentPushToken[stale]")
      assert count == 1
      assert PushTokens.get_tokens_for_user(user.id) == []
    end

    test "returns 0 when token does not exist" do
      {count, _} = PushTokens.delete_by_token("ExponentPushToken[nonexistent]")
      assert count == 0
    end
  end
end
