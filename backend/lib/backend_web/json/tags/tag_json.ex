defmodule BackendWeb.Tags.TagJSON do
  def show(%{tag: tag}) do
    Map.take(tag, [
      :id,
      :metadata,
      :approved,
      :tagger_id,
      :tagged_id,
      :inserted_at,
      :updated_at
    ])
  end
end
