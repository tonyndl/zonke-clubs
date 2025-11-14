defmodule Backend.Reviews.Reply do
  use Backend, :model

  alias Backend.Reviews.Comment
  alias Backend.Accounts.User

  @required_fields [:text, :comment_id, :author_id]
  @all_fields @required_fields

  schema "replys" do
    field(:text, :string)

    belongs_to(:comment, Comment)
    belongs_to(:author, User)

    timestamps()
  end

  def changeset(struct, params) do
    struct
    |> cast(params, @all_fields)
    |> validate_required(@required_fields)
  end
end
