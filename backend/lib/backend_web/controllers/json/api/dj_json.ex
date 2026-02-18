defmodule BackendWeb.API.DJJSON do
  alias Backend.DJs.DJ

  def index(%{djs: djs}) do
    %{djs: Enum.map(djs, &data/1)}
  end

  def show(%{dj: dj}) do
    %{dj: data(dj)}
  end

  defp data(%DJ{} = dj) do
    %{
      id: dj.id,
      name: dj.name,
      genre: dj.genre,
      bio: dj.bio,
      instagram: dj.instagram,
      soundcloud: dj.soundcloud,
      image: dj.image_url,
      inserted_at: dj.inserted_at,
      updated_at: dj.updated_at
    }
  end
end
