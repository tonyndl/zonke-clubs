defmodule Backend.Helpers.PushNotifications do
  @moduledoc """
  Sends push notifications via the Expo Push API.
  """

  alias Backend.Accounts.PushTokens
  require Logger

  @expo_push_url "https://exp.host/--/api/v2/push/send"

  @doc """
  Send a push notification to a user by their user_id.
  Looks up their stored Expo push tokens and calls the Expo Push API.
  """
  def send_to_user(user_id, title, body, data \\ %{}) do
    tokens = PushTokens.get_tokens_for_user(user_id)

    if tokens == [] do
      Logger.info("[PushNotifications] No tokens for user #{user_id}")
    else
      messages =
        Enum.map(tokens, fn token ->
          %{to: token, title: title, body: body, data: data, sound: "default"}
        end)

      Req.post(@expo_push_url,
        json: messages,
        headers: [{"content-type", "application/json"}, {"accept", "application/json"}]
      )
      |> case do
        {:ok, %{status: status}} when status in 200..299 ->
          Logger.info("[PushNotifications] Sent to user #{user_id} (#{length(tokens)} token(s))")

        {:ok, %{status: status, body: body}} ->
          Logger.warning("[PushNotifications] Expo API returned #{status}: #{inspect(body)}")

        {:error, reason} ->
          Logger.error("[PushNotifications] Failed to send: #{inspect(reason)}")
      end
    end

    :ok
  end
end
