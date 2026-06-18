defmodule Backend.Posts.PostLike do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "post_likes" do
    belongs_to :user, Backend.Accounts.User
    belongs_to :post, Backend.Posts.Post

    timestamps()
  end

  @required_fields [:user_id, :post_id]
  @all_fields @required_fields

  def changeset(post_like \\ %__MODULE__{}, attrs) do
    post_like
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:post_id)
    |> unique_constraint([:user_id, :post_id], name: :post_likes_user_id_post_id_index)
  end
end
