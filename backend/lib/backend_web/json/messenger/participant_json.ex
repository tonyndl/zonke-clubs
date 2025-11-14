defmodule BackendWeb.Messenger.ParticipantJSON do
  alias Backend.Assets.Assets

  def index(%{participants: participants}) do
    for(participant <- participants, do: show(%{participant: participant}))
  end

  def show(%{participant: participant}) do
    %{
      id: participant.id,
      first_name: participant.first_name,
      last_name: participant.last_name,
      asset_url: Assets.prepare_url(participant.asset_filename)
    }
  end
end
