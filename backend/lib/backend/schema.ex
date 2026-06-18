defmodule Backend.Schema do
  @moduledoc """
  Base schema module that configures UUID primary keys by default.

  Usage:
    defmodule MyApp.MyContext.MySchema do
      use Backend.Schema
      import Ecto.Changeset

      schema "my_table" do
        field :name, :string
        timestamps()
      end
    end
  """

  defmacro __using__(_) do
    quote do
      use Ecto.Schema
      @primary_key {:id, :binary_id, autogenerate: true}
      @foreign_key_type :binary_id
    end
  end
end
