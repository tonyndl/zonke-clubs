defmodule Backend.Notifications.Notification do
  use Backend, :model

  alias Backend.Ecto.EctoEnums.NotificationsEnum
  alias Backend.Accounts.User

  import Ecto.Changeset

  @required_fields [:type, :read, :recipient_id, :notifier_id]
  @optional_fields [:metadata]
  @all_fields @required_fields ++ @optional_fields

  schema "notifications" do
    field(:type, NotificationsEnum)
    field(:read, :boolean, default: false)
    field(:metadata, :map)

    belongs_to(:recipient, User)
    belongs_to(:notifier, User)

    timestamps()
  end

  def changeset(struct, params) do
    struct
    |> cast(params, @all_fields)
    |> validate_required(@required_fields)
  end
end
