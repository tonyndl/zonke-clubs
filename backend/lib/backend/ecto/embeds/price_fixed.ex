defmodule Backend.Ecto.Embeds.PriceFixed do
  use Backend, :model

  @required_fields [:currency, :value]

  @derive {Jason.Encoder, only: @required_fields}

  embedded_schema do
    field(:currency, :string)
    field(:value, :decimal)
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, @required_fields)
    |> validate_required(@required_fields)
  end
end
