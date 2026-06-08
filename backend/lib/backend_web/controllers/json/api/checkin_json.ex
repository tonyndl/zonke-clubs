defmodule BackendWeb.API.CheckinJSON do
  alias Backend.Checkins.ClubCheckin
  alias Backend.Checkins.ClubQRCode

  def checkin(%{checkin: checkin}), do: %{checkin: checkin_data(checkin)}
  def my_checkin(%{checkin: nil}), do: %{checkin: nil}
  def my_checkin(%{checkin: checkin}), do: %{checkin: checkin_data(checkin)}

  def open_users(%{checkins: checkins}) do
    %{users: Enum.map(checkins, &open_user_data/1)}
  end

  defp checkin_data(%ClubCheckin{} = c) do
    %{
      id: c.id,
      club_id: c.club_id,
      is_open: c.is_open,
      expires_at: c.expires_at,
      inserted_at: c.inserted_at
    }
  end

  def active_qr(%{active: active}), do: %{active: active}

  def qr_code(%{qr: qr}), do: %{qr_code: qr_data(qr)}
  def qr_codes(%{codes: codes}), do: %{qr_codes: Enum.map(codes, &qr_data/1)}

  def qr_valid(%{qr: qr}) do
    %{
      valid: true,
      qr_code: qr_data(qr),
      club: %{
        id: qr.club.id,
        name: qr.club.name,
        banner_image_url: Map.get(qr.club, :banner_image_url)
      }
    }
  end

  defp qr_data(%ClubQRCode{} = qr) do
    %{
      id: qr.id,
      token: qr.token,
      club_id: qr.club_id,
      label: qr.label,
      valid_date: qr.valid_date,
      expires_at: qr.expires_at,
      inserted_at: qr.inserted_at
    }
  end

  defp open_user_data(%ClubCheckin{user: user} = c) do
    %{
      checkin_id: c.id,
      is_open: c.is_open,
      user: %{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        bio: user.bio
      }
    }
  end
end
