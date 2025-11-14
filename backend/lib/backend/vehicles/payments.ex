defmodule Backend.Vehicles.Payments do
  alias Backend.{Repo, PaginateHelper}
  alias Backend.Vehicles.Payment
  alias Backend.Vehicles.Queries.PaymentBy

  import Ecto.Query

  # defdelegate authorize(action, params, session), to: Policy

  def create(params) do
    %Payment{}
    |> Payment.changeset(params)
    |> Repo.insert()
  end

  def update(%Payment{} = payment, params) do
    payment
    |> Payment.changeset(params)
    |> Repo.update()
  end

  def delete(%Payment{id: id} = payment) do
    Repo.delete(payment)
  end

  def get_payment(id) do
    Repo.get_by(Payment, id: id)
    |> format_payment()
  end

  def get_payments(params) do
    data =
      PaymentBy.base_query()
      |> PaymentBy.by_vehicle_driver(params.vehicle_driver_id)
      |> order_by([payment: p], desc: p.inserted_at)
      |> Repo.paginate(PaginateHelper.prep_params(params))

    {:ok, data, PaginateHelper.prep_paginate(data)}
  end

  defp format_payment(%Payment{} = payment), do: {:ok, payment}
  defp format_payment(nil), do: {:error, :not_found}
end
