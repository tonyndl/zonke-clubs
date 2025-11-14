defmodule Backend.Reviews.Review do
  use Backend, :model

  alias Backend.Drivers.Driver
  alias Backend.Accounts.User
  # alias Backend.Reviews.Reply

  @required_fields [:comment, :author_id, :driver_id]
  @all_fields @required_fields

  schema "reviews" do
    field(:comment, :string)
    field(:rating, :float)

    belongs_to(:driver, Driver)
    belongs_to(:author, User)

    # has_many(:replys, Reply)

    timestamps()
  end

  def changeset(struct, params) do
    struct
    |> cast(params, @all_fields)
    |> validate_required(@required_fields)
  end
end
