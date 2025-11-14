defmodule Backend.Ecto.Embeds.Licence do
  use Backend, :model

  @required_fields [:name, :year]

  @derive {Jason.Encoder, only: @required_fields}

  embedded_schema do
    field(:name, :string)
    field(:year, :integer)
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, @required_fields)
    |> validate_required(@required_fields)
  end
end
