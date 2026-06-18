defmodule Backend.Assets.Asset do
  @moduledoc """
  Schema for storing file assets (images, documents, etc.).
  """
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Clubs.Club
  alias Backend.Posts.Post

  @required_fields [:filename]
  @optional_fields [:copied, :meta, :user_id, :club_id, :post_id]
  @all_fields @required_fields ++ @optional_fields

  schema "assets" do
    field :filename, :string
    field :copied, :boolean, default: false
    field :meta, :map, default: %{}
    field :url, :string, virtual: true

    belongs_to :user, User
    belongs_to :club, Club
    belongs_to :post, Post

    timestamps()
  end

  @doc false
  def changeset(asset, attrs) do
    asset
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
  end
end
