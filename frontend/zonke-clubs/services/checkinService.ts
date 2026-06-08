import { api } from "./api";

export type CheckinStatus = {
  id: string;
  club_id: string;
  is_open: boolean;
  expires_at: string | null;
  inserted_at: string;
};

export type OpenUser = {
  checkin_id: string;
  is_open: boolean;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    bio?: string;
  };
};

class CheckinService {
  checkin(clubId: string): Promise<{ checkin: CheckinStatus }> {
    return api.post<{ checkin: CheckinStatus }>(
      `/clubs/${clubId}/checkin`,
      {},
      true,
    );
  }

  checkout(clubId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/clubs/${clubId}/checkin`, true);
  }

  setOpen(
    clubId: string,
    isOpen: boolean,
  ): Promise<{ checkin: CheckinStatus }> {
    return api.put<{ checkin: CheckinStatus }>(
      `/clubs/${clubId}/checkin`,
      { is_open: isOpen },
      true,
    );
  }

  getMyCheckin(clubId: string): Promise<{ checkin: CheckinStatus | null }> {
    return api.get<{ checkin: CheckinStatus | null }>(
      `/clubs/${clubId}/checkin/me`,
      true,
    );
  }

  getOpenUsers(clubId: string): Promise<{ users: OpenUser[] }> {
    return api.get<{ users: OpenUser[] }>(
      `/clubs/${clubId}/checkin/open`,
      true,
    );
  }

  hasActiveQRCode(clubId: string): Promise<{ active: boolean }> {
    return api.get<{ active: boolean }>(
      `/clubs/${clubId}/qr-codes/active`,
      false,
    );
  }
}

export const checkinService = new CheckinService();
