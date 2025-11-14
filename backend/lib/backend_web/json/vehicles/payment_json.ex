defmodule BackendWeb.Vehicles.PaymentJSON do
  alias Backend.DateTimeHelper

  def index(%{payments: payments, paginate: paginate}) do
    %{
      paginate: paginate,
      data: for(payment <- payments, do: show(%{payment: payment}))
    }
  end

  def show(%{payment: payment}) do
    Map.take(payment, [
      :id,
      :price_fixed,
      :updated_at
    ])
    |> Map.merge(%{paid_at: DateTimeHelper.date_time(payment.inserted_at)})
  end
end
