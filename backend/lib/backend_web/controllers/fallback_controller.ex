defmodule BackendWeb.FallbackController do
  use BackendWeb, :controller

  # This module handles common error tuples and returns proper JSON responses
  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> json(%{error: "not_found"})
  end

  def call(conn, {:error, :unauthorized}) do
    conn
    |> put_status(:unauthorized)
    |> json(%{error: "unauthorized"})
  end

  def call(conn, {:error, :invalid_credentials}) do
    conn
    |> put_status(:unauthorized)
    |> json(%{error: "Invalid username or password"})
  end

  def call(conn, {:error, reason}) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "bad_request", reason: inspect(reason)})
  end

  def call(conn, other) do
    conn
    |> put_status(:internal_server_error)
    |> json(%{error: "internal_server_error", info: inspect(other)})
  end
end
