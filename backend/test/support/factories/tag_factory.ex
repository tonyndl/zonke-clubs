defmodule Backend.TagFactory do
  use ExMachina

  alias Backend.Tags.Tag

  defmacro __using__(_opts) do
    quote do
      def tag_factory do
        %Tag{
          id: Ecto.UUID.generate(),
          tagger: build(:user),
          tagged: build(:user)
        }
      end
    end
  end
end
