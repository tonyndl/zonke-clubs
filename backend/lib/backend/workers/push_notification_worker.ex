defmodule Backend.Workers.PushNotificationWorker do
  use Oban.Worker, queue: :push_notifications, max_attempts: 3

  alias Backend.Accounts.PushTokens
  require Logger

  @expo_push_url "https://exp.host/--/api/v2/push/send"
  @expo_receipts_url "https://exp.host/--/api/v2/push/getReceipts"

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"recipient_id" => recipient_id, "title" => title, "body" => body, "data" => data} = args}) do
    tokens = PushTokens.get_tokens_for_user(recipient_id)
    category = Map.get(args, "category")

    if tokens == [] do
      :ok
    else
      messages =
        Enum.map(tokens, fn token ->
          msg = %{
            to: token,
            title: title,
            body: body,
            data: data,
            sound: "default",
            priority: "high",
            channelId: "zonkeclubs"
          }
          if category, do: Map.put(msg, :categoryIdentifier, category), else: msg
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
  def enqueue(recipient_id, title, body, data \\ %{}, category \\ nil) do
    args =
      %{recipient_id: recipient_id, title: title, body: body, data: data}
      |> then(fn a -> if category, do: Map.put(a, :category, category), else: a end)

    args |> new() |> Oban.insert()
  end
end
