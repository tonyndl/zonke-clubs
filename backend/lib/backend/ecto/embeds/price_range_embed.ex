defmodule Backend.Ecto.Embeds.PriceRangeEmbed do
  use Backend, :model

  @required_fields [:currency, :min, :max]

  @derive {Jason.Encoder, only: @required_fields}

  embedded_schema do
    field(:currency, :string)
    field(:min, :decimal)
    field(:max, :decimal)
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, @required_fields)
    |> validate_required(@required_fields)
  end
end
