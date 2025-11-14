defmodule Backend.Messenger.Schemas.Message do
  use Backend, :model

  alias Backend.Messenger.Schemas.{Thread, Participant}

  @derive {Jason.Encoder, only: [:id, :content, :inserted_at, :updated_at]}

  @required_params [:content, :author_id, :recipient_id]
  @params [:seen, :thread_id, :visible, :sent_at, :created_at, :metadata]
  @all_params @params ++ @required_params

  schema "messages" do
    field(:content, :string)
    field(:seen, :boolean, default: false)
    field(:visible, :boolean)
    field(:sent_at, :naive_datetime)
    field(:created_at, :naive_datetime)
    field(:metadata, :map)

    belongs_to(:thread, Thread)
    belongs_to(:author, Participant)
    belongs_to(:recipient, Participant)

    timestamps()
  end

  def changeset(struct, attrs \\ %{}) do
    struct
    |> cast(attrs, @all_params)
    |> validate_required(@required_params)
    |> assoc_constraint(:author)
    |> assoc_constraint(:thread)
  end
end
