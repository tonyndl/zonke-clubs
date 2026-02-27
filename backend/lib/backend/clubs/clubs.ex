defmodule Backend.Clubs do
  @moduledoc """
  Context module for managing nightclubs and venues.
  """
  import Ecto.Query
  alias Backend.Repo
  alias Backend.Clubs.Club
  alias Backend.Clubs.ClubLike

  @doc """
  Lists all clubs.
  """
  def list_clubs do
    Club
    |> where([c], c.active == true)
    |> order_by([c], asc: c.name)
    |> Repo.all()
  end

  @doc """
  Gets a single club by ID.
  """
  def get_club(id) do
    case Repo.get(Club, id) do
      nil -> {:error, :not_found}
      club -> {:ok, club}
    end
  end

  @doc """
  Creates a club.
  """
  def create_club(attrs) do
    %Club{}
    |> Club.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a club.
  """
  def update_club(%Club{} = club, attrs) do
    club
    |> Club.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a club.
  """
  def delete_club(%Club{} = club) do
    Repo.delete(club)
  end

  @doc """
  Sets up or updates a club for an admin.
  If the admin already has a club, it updates it.
  If not, it creates a new one.
  """
  def setup_admin_club(admin_id, attrs) do
    IO.puts("\n🔄 Clubs.setup_admin_club called")
    IO.puts("Admin ID: #{admin_id}")
    IO.puts("Attrs to update:")
    IO.inspect(attrs, label: "Attrs")

    case get_admin_club(admin_id) do
      {:ok, club} ->
        IO.puts("✅ Found existing club: #{club.name}")
        IO.puts("Current opening_hours:")
        IO.inspect(club.opening_hours, label: "Before Update")

        result = update_club(club, attrs)

        case result do
          {:ok, updated_club} ->
            IO.puts("✅ Club updated successfully")
            IO.puts("New opening_hours:")
            IO.inspect(updated_club.opening_hours, label: "After Update")

          {:error, changeset} ->
            IO.puts("❌ Update failed")
            IO.inspect(changeset.errors, label: "Changeset Errors")
        end

        result

      {:error, :not_found} ->
        IO.puts("📝 No existing club found, creating new one")
        admin = Repo.get!(Backend.Admin.Admin, admin_id)
        # Use string key to match the rest of the params keys
        attrs
        |> Map.put("admin_id", admin_id)
        |> Map.put_new("name", admin.name)
        |> create_club()
    end
  end

  @doc """
  Gets the club owned by an admin.
  """
  def get_admin_club(admin_id) do
    case Repo.get_by(Club, admin_id: admin_id) do
      nil -> {:error, :not_found}
      club -> {:ok, club}
    end
  end

  # ========================================
  # Club Likes (Favorites)
  # ========================================

  @doc """
  Likes a club for the current user.
  Returns {:ok, club_like} or {:error, changeset}.
  Idempotent - returns success if already liked.
  """
  def like_club(club_id, session) do
    # Check if already liked
    case Repo.get_by(ClubLike, club_id: club_id, user_id: session.id) do
      nil ->
        # Not liked yet, create new like
        attrs = %{club_id: club_id, user_id: session.id}

        %ClubLike{}
        |> ClubLike.changeset(attrs)
        |> Repo.insert()

      existing_like ->
        # Already liked, return success
        {:ok, existing_like}
    end
  end

  @doc """
  Unlikes a club for the current user.
  Returns {:ok, club_like} if deleted, {:error, :not_found} if not liked.
  """
  def unlike_club(club_id, session) do
    case Repo.get_by(ClubLike, club_id: club_id, user_id: session.id) do
      nil -> {:error, :not_found}
      club_like -> Repo.delete(club_like)
    end
  end

  @doc """
  Checks if a club is liked by the current user.
  Returns true or false.
  """
  def is_club_liked?(club_id, session) when not is_nil(session) do
    ClubLike
    |> where([cl], cl.club_id == ^club_id and cl.user_id == ^session.id)
    |> Repo.exists?()
  end

  def is_club_liked?(_club_id, nil), do: false

  @doc """
  Gets the count of users who favorited a club.
  """
  def get_club_favorites_count(club_id) do
    ClubLike
    |> where([cl], cl.club_id == ^club_id)
    |> Repo.aggregate(:count)
  end

  @doc """
  Gets all clubs liked by the current user (favorites).
  Returns list of clubs ordered by when they were liked (most recent first).
  """
  def get_user_favorite_clubs(session) when not is_nil(session) do
    Club
    |> join(:inner, [c], cl in ClubLike, on: cl.club_id == c.id)
    |> where([c, cl], cl.user_id == ^session.id)
    |> where([c], c.active == true)
    |> order_by([c, cl], desc: cl.inserted_at)
    |> Repo.all()
  end

  def get_user_favorite_clubs(nil), do: []

  @doc """
  Lists all clubs with optional session to include is_liked flag.
  When session is provided, each club will have a virtual :is_liked field.
  """
  def list_clubs_with_likes(session) when not is_nil(session) do
    clubs = list_clubs()

    # Get all liked club IDs for the user in one query
    liked_club_ids =
      ClubLike
      |> where([cl], cl.user_id == ^session.id)
      |> select([cl], cl.club_id)
      |> Repo.all()
      |> MapSet.new()

    # Map over clubs and add is_liked virtual field
    Enum.map(clubs, fn club ->
      Map.put(club, :is_liked, MapSet.member?(liked_club_ids, club.id))
    end)
  end

  def list_clubs_with_likes(nil), do: list_clubs()
end
