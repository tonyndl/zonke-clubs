defmodule Backend.Guardian do
  use Guardian, otp_app: :backend

  alias Backend.Accounts.User

  def subject_for_token(%User{id: id}, _claims) do
    {:ok, "User:#{id}"}
  end

  # add sub for user + company

  def subject_for_token(_, _), do: {:error, :unkown_resource}

  def resource_from_claims(%{"sub" => "User:" <> id}) do
    {:ok, %{user_id: id}}
  end

  # resource for user + company
end
