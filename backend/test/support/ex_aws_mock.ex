defmodule Backend.ExAwsMock do
  @moduledoc """
  Minimal mock for ExAws request calls used in tests.

  ExAws.request/2 is used in the codepath that uploads to S3. The real
  implementation performs network IO; in tests we set
  Application.put_env(:ex_aws, :request_impl, Backend.ExAwsMock)
  so ExAws.request/2 will delegate here and return a canned success.
  """

  # handle both arities to be defensive
  def request(_operation), do: {:ok, %{status_code: 200}}
  def request(_operation, _opts), do: {:ok, %{status_code: 200}}
end
