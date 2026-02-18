defmodule BackendWeb.API.AssetProxyController do
  @moduledoc """
  Proxies S3 assets through the backend server to make them accessible on mobile.
  """
  use BackendWeb, :controller

  @doc """
  Proxies an avatar image from LocalStack S3.
  This allows mobile clients to access S3 images through the backend.
  """
  def proxy_avatar(conn, %{"filename" => filename}, _session) do
    # Get S3 object from LocalStack
    bucket = "zonke-clubs-bucket"

    case ExAws.S3.get_object(bucket, filename)
         |> ExAws.request() do
      {:ok, %{body: body, headers: headers}} ->
        # Extract content type from S3 headers
        content_type =
          Enum.find_value(headers, "image/jpeg", fn
            {"Content-Type", value} -> value
            {"content-type", value} -> value
            _ -> nil
          end)

        conn
        |> put_resp_content_type(content_type)
        |> put_resp_header("cache-control", "public, max-age=31536000")
        |> send_resp(200, body)

      {:error, _reason} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Image not found"})
    end
  end
end
