defmodule Backend.Ecto.Embeds.Duration do
  use Backend, :model

  @required ~w(value unit)a
  @units ~w(seconds minutes hours days weeks months years)

  @derive {Jason.Encoder, only: @required}

  embedded_schema do
    field(:value, :integer)
    field(:unit, :string)
  end

  def changeset(duration, params \\ %{}) do
    duration
    |> cast(params, @required)
    |> validate_required(@required)
    |> validate_inclusion(:unit, @units)
  end
end
