defmodule Backend.ReviewFactory do
  use ExMachina

  alias Backend.Reviews.Review

  defmacro __using__(_opts) do
    quote do
      def review_factory do
        users_liked_array = Enum.map(1..10, fn _ -> build(:user).id end)

        %Review{
          id: Ecto.UUID.generate(),
          comment: sequence(:name, &"Comment No. #{&1}"),
          # likes: length(users_liked_array),
          # users_liked: users_liked_array,
          author: build(:user),
          driver: build(:driver),
          vehicle: build(:vehicle)
        }
      end
    end
  end
end
