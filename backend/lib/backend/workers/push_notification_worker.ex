defmodule Backend.Workers.PushNotificationWorker do
  use Oban.Worker, queue: :push_notifications, max_attempts: 3

  alias Backend.Accounts.PushTokens
  require Logger

  @expo_push_url "https://exp.host/--/api/v2/push/send"
  @expo_receipts_url "https://exp.host/--/api/v2/push/getReceipts"

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"recipient_id" => recipient_id, "title" => title, "body" => body, "data" => data}}) do
    tokens = PushTokens.get_tokens_for_user(recipient_id)

    if tokens == [] do
      :ok
    else
      messages =
        Enum.map(tokens, fn token ->
          %{
            to: token,
            title: title,
            body: body,
            data: data,
            sound: "default",
            priority: "high",
            channelId: "zonkeclubs"
          }
        end)

      case Req.post(@expo_push_url, json: messages) do
        {:ok, %{status: status, body: %{"data" => results}}} when status in 200..299 ->
          # Check for DeviceNotRegistered and clean up stale tokens
          tokens
          |> Enum.zip(List.wrap(results))
          |> Enum.each(fn {token, result} ->
            if get_in(result, ["details", "error"]) == "DeviceNotRegistered" do
              Logger.info("[PushNotifications] Removing stale token for user #{recipient_id}")
              PushTokens.delete_by_token(token)
            end
          end)
          :ok

        {:ok, %{status: status}} when status in 200..299 ->
          :ok

        {:ok, response} ->
          {:error, "Expo push API error: #{response.status}"}

        {:error, reason} ->
          {:error, reason}
      end
    end
  end

  @doc """
  Enqueue a push notification job.
  """
  def enqueue(recipient_id, title, body, data \\ %{}) do
    %{
      recipient_id: recipient_id,
      title: title,
      body: body,
      data: data
    }
    |> new()
    |> Oban.insert()
  end
end
