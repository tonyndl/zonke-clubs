defmodule Backend.Tags.TagTest do
  use Backend.DataCase, async: true
  use Backend.MoxCase

  alias Backend.Tags.{Tags, Tag}
  alias Backend.Utils.BroadcastMock

  import Backend.Factory

  setup do
    user = insert(:user)

    params = %{
      tagged_id: insert(:user).id
    }

    %{user: user, params: params}
  end

  describe "create/2" do
    test "successfully creates a tag", %{user: user, params: params} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :tag
      end)

      assert {:ok, %{tag: tag}} = Tags.create(params, %{user_id: user.id})
      assert tag.tagger_id == user.id
    end

    test "returns error for invalid params", %{user: user} do
      params = %{metadata: "hello"}

      assert {:error, :tag, %Ecto.Changeset{}, %{}} = Tags.create(params, %{user_id: user.id})
    end
  end

  describe "update/2" do
    test "successfully updates a tag", %{user: user, params: params} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :tag
      end)

      {:ok, %{tag: tag}} = Tags.create(params, %{user_id: user.id})

      params = %{metadata: %{message: "i cut kabza de small hair"}}

      assert {:ok, %Tag{} = updated_tag} = Tags.update(tag, params)
      assert updated_tag.metadata.message == "i cut kabza de small hair"
    end
  end

  describe "approve_or_reject_tag/2" do
    test "approve tag", %{user: user, params: params} do
      tag = insert(:tag)

      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :tag
        assert payload.metadata.action == :approved
      end)

      {:ok, %{tag: updated_tag}} = Tags.approve_or_reject_tag(tag, %{approved: true})

      assert updated_tag.approved == true
      assert updated_tag.id == tag.id
    end

    test "reject tag", %{user: user, params: params} do
      tag = insert(:tag)

      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :tag
        assert payload.metadata.action == :rejected
      end)

      {:ok, %{tag: updated_tag}} = Tags.approve_or_reject_tag(tag, %{approved: false})

      assert updated_tag.approved == false
      assert updated_tag.id == tag.id
    end
  end

  describe "delete/1" do
    test "successfully deletes a tag", %{user: user, params: params} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :tag
      end)

      {:ok, %{tag: tag}} = Tags.create(params, %{user_id: user.id})

      assert {:ok, _} = Tags.delete(tag)
      assert {:error, :not_found} = Tags.get_tag(tag.id)
    end
  end
end
