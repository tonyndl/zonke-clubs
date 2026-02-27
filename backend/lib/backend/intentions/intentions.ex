defmodule Backend.Intentions do
  @moduledoc """
  Context module for managing meetup intentions.
  """
  import Ecto.Query
  alias Backend.Repo
  alias Backend.Intentions.Intention

  @doc """
  Lists all active intentions for a specific club.
  Automatically excludes intentions with past dates.
  Optionally excludes a specific user's intentions.
  """
  def list_club_intentions(club_id, exclude_user_id \\ nil) do
    today = Date.utc_today()

    query =
      Intention
      |> where([i], i.club_id == ^club_id and i.active == true)
      |> where([i], i.planned_date >= ^today)
      |> where([i], is_nil(i.expires_at) or i.expires_at > ^DateTime.utc_now())

    query =
      if exclude_user_id do
        query |> where([i], i.user_id != ^exclude_user_id)
      else
        query
      end

    query
    |> order_by([i], desc: i.inserted_at)
    |> preload(:user)
    |> Repo.all()
  end

  @doc """
  Gets a single intention by ID.
  """
  def get_intention(id) do
    case Repo.get(Intention, id) |> Repo.preload(:user) do
      nil -> {:error, :not_found}
      intention -> {:ok, intention}
    end
  end

  @doc """
  Creates an intention for a user.
  """
  def create_intention(attrs) do
    %Intention{}
    |> Intention.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates an intention.
  """
  def update_intention(%Intention{} = intention, attrs) do
    intention
    |> Intention.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes an intention.
  """
  def delete_intention(%Intention{} = intention) do
    Repo.delete(intention)
  end

  @doc """
  Lists all active intentions across all clubs.
  Automatically excludes intentions with past dates.
  Optionally excludes a specific user's intentions.
  """
  def list_all_intentions(exclude_user_id \\ nil) do
    today = Date.utc_today()

    query =
      Intention
      |> where([i], i.active == true)
      |> where([i], i.planned_date >= ^today)
      |> where([i], is_nil(i.expires_at) or i.expires_at > ^DateTime.utc_now())

    query =
      if exclude_user_id do
        query |> where([i], i.user_id != ^exclude_user_id)
      else
        query
      end

    query
    |> order_by([i], desc: i.inserted_at)
    |> preload([:user, :club])
    |> Repo.all()
  end

  @doc """
  Gets all active intentions for a user.
  Automatically excludes intentions with past dates.
  """
  def list_user_intentions(user_id) do
    today = Date.utc_today()

    Intention
    |> where([i], i.user_id == ^user_id and i.active == true)
    |> where([i], i.planned_date >= ^today)
    |> where([i], is_nil(i.expires_at) or i.expires_at > ^DateTime.utc_now())
    |> order_by([i], asc: i.planned_date)
    |> preload([:user, :club])
    |> Repo.all()
  end
end
