defmodule BackendWeb.Vehicles.PaymentController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Vehicles.Payments
  alias BackendWeb.Vehicles.PaymentJSON

  # TODO: add rate limiting
  def index(conn, params, session) do
    # with :ok <- Bodyguard.permit(Vehicles, :get_payments, %{id: profile_id}, session),
    with {:ok, payments, paginate} <- Payments.get_payments(params) do
      render(conn, :index, %{payments: payments, paginate: paginate})
    end
  end

  def create(conn, params, _session) do
    # with :ok <- Bodyguard.permit(Payments, :create, %{id: profile_id}, session),
    with {:ok, payment} <- Payments.create(params) do
      render(conn, :show, payment: payment)
    end
  end

  def show(conn, %{id: id}, session) do
    with {:ok, payment} <- Payments.get_payment(id),
         :ok <- Bodyguard.permit(Payments, :show, payment, session) do
      render(conn, :show, payment: payment)
    end
  end

  def update(conn, %{id: id} = params, session) do
    with {:ok, payment} <- Payments.get_payment(id),
         #  :ok <- Bodyguard.permit(Payments, :update, payment, session),
         {:ok, payment} <- Payments.update(payment, params) do
      render(conn, :show, payment: payment)
    end
  end

  def delete(conn, %{id: id}, session) do
    with {:ok, payment} <- Payments.get_payment(id),
         #  :ok <- Bodyguard.permit(Payments, :delete, payment, session),
         {:ok, _payment} <- Payments.delete(payment) do
      json(conn, :ok)
    end
  end
end
