defmodule Backend.Guardian do
  use Guardian, otp_app: :backend

  alias Backend.Accounts.User
  alias Backend.Admin.Admin

  def subject_for_token(%User{id: id}, _claims) do
    {:ok, "User:#{id}"}
  end

  def subject_for_token(%Admin{id: id}, _claims) do
    {:ok, "Admin:#{id}"}
  end

  def subject_for_token(_, _), do: {:error, :unknown_resource}

  def resource_from_claims(%{"sub" => "User:" <> id}) do
    {:ok, %{user_id: id}}
  end

  def resource_from_claims(%{"sub" => "Admin:" <> id}) do
    {:ok, %{admin_id: id}}
  end

  def resource_from_claims(_claims), do: {:error, :invalid_claims}
end
