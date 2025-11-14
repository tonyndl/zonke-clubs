defmodule Backend.Tags.Tags do
  alias Ecto.Multi
  alias Backend.Tags.Tag
  alias Backend.Notifications.Notifications
  alias Backend.Repo

  def create(params, %{user_id: user_id}) do
    params = Map.put(params, :tagger_id, user_id)

    Multi.new()
    |> Multi.insert(
      :tag,
      Tag.changeset(%Tag{}, params)
    )
    |> Multi.run(:notification, fn _repo, %{tag: tag} ->
      Notifications.create(tag, %{tag: :created})
    end)
    |> Repo.transaction()
  end

  def get_tag(id) do
    Repo.get_by(Tag, id: id)
    |> format_tag()
  end

  def update(tag, params) do
    tag
    |> Tag.changeset(params)
    |> Repo.update()
  end

  def delete(%Tag{} = tag) do
    Repo.delete(tag)
  end

  def approve_or_reject_tag(%Tag{} = tag, params) do
    Multi.new()
    |> Multi.update(
      :tag,
      Tag.changeset(tag, params)
    )
    |> Multi.run(:notification, fn _repo, %{tag: tag} ->
      case tag.approved do
        true ->
          Notifications.create(tag, %{tag: :approved})
          {:ok, tag}

        false ->
          Notifications.create(tag, %{tag: :rejected})
          {:ok, tag}
      end
    end)
    |> Repo.transaction()
  end

  def format_tag(%Tag{} = tag), do: {:ok, tag}
  def format_tag(nil), do: {:error, :not_found}
end
