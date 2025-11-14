defmodule BackendWeb.ReviewChannel do
  use BackendWeb, :channel

  alias BackendWeb.Services.Reviews.ReviewJSON
  alias Backend.Reviews.Reviews

  def join("reviews:" <> service_id, _params, socket) do
    send(self(), {:after_join, service_id})

    {:ok, socket}
  end

  def handle_info({:after_join, service_id}, socket) do
    {:ok, reviews} = Reviews.get_service_reviews(service_id)
    payload = ReviewJSON.index(%{reviews: reviews})

    push(socket, "reviews:loaded", payload)

    {:noreply, socket}
  end

  def push_out!(action, review) when action in ["created", "liked", "unliked"] do
    payload = ReviewJSON.show(%{review: review})

    broadcast_module = Application.get_env(:backend, :broadcast_module)

    broadcast_module.broadcast("reviews:" <> review.service_id, action, payload)
  end
end
