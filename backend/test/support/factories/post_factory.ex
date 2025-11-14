defmodule Backend.PostFactory do
  use ExMachina

  alias Backend.Posts.Post

  defmacro __using__(_opts) do
    quote do
      def post_factory do
        %Post{
          id: Ecto.UUID.generate(),
          location: %{lat: "123", lon: "987"}
        }
      end
    end
  end
end
