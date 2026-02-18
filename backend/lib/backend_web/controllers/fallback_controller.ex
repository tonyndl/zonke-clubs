defmodule BackendWeb.FallbackController do
  @moduledoc """
  Translates controller action results into valid `Plug.Conn` responses.

  See `Phoenix.Controller.action_fallback/1` for more details.
  """
  use BackendWeb, :controller

  # This clause handles errors returned from Ecto's insert/update/delete.
  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: BackendWeb.ChangesetJSON)
    |> render(:error, changeset: changeset)
  end

  # This clause is an example of how to handle resources that cannot be found.
  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(json: BackendWeb.ErrorJSON)
    |> render(:"404")
  end

  # Handle unauthorized errors
  def call(conn, {:error, :unauthorized}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(json: BackendWeb.ErrorJSON)
    |> render(:"401")
  end

  # Handle forbidden errors
  def call(conn, {:error, :forbidden}) do
    conn
    |> put_status(:forbidden)
    |> put_view(json: BackendWeb.ErrorJSON)
    |> render(:"403")
  end

  # Handle bad request errors
  def call(conn, {:error, :bad_request}) do
    conn
    |> put_status(:bad_request)
    |> put_view(json: BackendWeb.ErrorJSON)
    |> render(:"400")
  end

  # Handle invalid credentials
  def call(conn, {:error, :invalid_credentials}) do
    conn
    |> put_status(:unauthorized)
    |> json(%{error: "Invalid username or password"})
  end

  # Handle invalid password (for password change)
  def call(conn, {:error, :invalid_password}) do
    conn
    |> put_status(:unauthorized)
    |> json(%{error: "Current password is incorrect"})
  end

  # Handle invalid params (for password change)
  def call(conn, {:error, :invalid_params}) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Invalid parameters provided"})
  end

  # Handle inactive admin account
  def call(conn, {:error, :account_inactive}) do
    conn
    |> put_status(:forbidden)
    |> json(%{error: "Your account has been deactivated"})
  end

  # Handle duplicate connection request (bidirectional check)
  def call(conn, {:error, :duplicate_connection_request}) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{error: "You already have an active connection request with this person"})
  end

  # Handle connection not active (disconnected users trying to message)
  def call(conn, {:error, :connection_not_active}) do
    conn
    |> put_status(:forbidden)
    |> json(%{error: "You are no longer connected with this person"})
  end

  # Handle admin with no club
  def call(conn, {:error, :no_club_found}) do
    conn
    |> put_status(:forbidden)
    |> json(%{error: "You must set up a club before accessing spending records"})
  end

  # Handle generic error messages
  def call(conn, {:error, message}) when is_binary(message) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{error: message})
  end
end
