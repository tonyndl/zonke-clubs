import { api } from "./api";
import { ConnectionRequest } from "@/types/connection";

export type ConnectionRequestsResponse = {
  requests: ConnectionRequest[];
};

export type SingleConnectionRequestResponse = {
  request: ConnectionRequest;
};

export type CreateConnectionRequestParams = {
  receiver_id: string;
  message?: string;
  club_id?: string;
  intention_id?: string;
};

// Transform API response from snake_case to camelCase
export function transformRequest(apiRequest: any): ConnectionRequest {
  return {
    id: apiRequest.id,
    status: apiRequest.status,
    message: apiRequest.message,
    clubId: apiRequest.club_id,
    clubName: apiRequest.club_name,
    intentionId: apiRequest.intention_id,
    plannedDate: apiRequest.planned_date,
    threadId: apiRequest.thread_id,
    sender: {
      id: apiRequest.sender.id,
      username: apiRequest.sender.username,
      avatarUrl: apiRequest.sender.avatar_url,
      bio: apiRequest.sender.bio,
    },
    receiver: {
      id: apiRequest.receiver.id,
      username: apiRequest.receiver.username,
      avatarUrl: apiRequest.receiver.avatar_url,
      bio: apiRequest.receiver.bio,
    },
    createdAt: apiRequest.created_at,
    updatedAt: apiRequest.updated_at,
  };
}

class ConnectionService {
  /**
   * Get received connection requests (requires authentication)
   */
  getReceivedRequests(): Promise<ConnectionRequestsResponse> {
    return api
      .get<any>("/connection-requests/received", true)
      .then((response) => ({
        requests: response.requests.map(transformRequest),
      }));
  }

  /**
   * Get sent connection requests (requires authentication)
   */
  getSentRequests(): Promise<ConnectionRequestsResponse> {
    return api.get<any>("/connection-requests/sent", true).then((response) => ({
      requests: response.requests.map(transformRequest),
    }));
  }

  /**
   * Create a new connection request (requires authentication)
   */
  createRequest(
    params: CreateConnectionRequestParams,
  ): Promise<SingleConnectionRequestResponse> {
    return api
      .post<any>("/connection-requests", params, true)
      .then((response) => ({ request: transformRequest(response.request) }));
  }

  /**
   * Accept a connection request (requires authentication)
   */
  acceptRequest(id: string): Promise<SingleConnectionRequestResponse> {
    return api
      .put<any>(`/connection-requests/${id}/accept`, {}, true)
      .then((response) => ({
        request: transformRequest(response.request),
      }));
  }

  /**
   * Decline a connection request (requires authentication)
   */
  declineRequest(id: string): Promise<SingleConnectionRequestResponse> {
    return api
      .put<any>(`/connection-requests/${id}/decline`, {}, true)
      .then((response) => ({
        request: transformRequest(response.request),
      }));
  }

  /**
   * Cancel a connection request (requires authentication)
   */
  cancelRequest(id: string): Promise<void> {
    return api
      .delete<void>(`/connection-requests/${id}`, true)
      .then(() => undefined);
  }

  /**
   * Disconnect from a user using thread_id (requires authentication)
   */
  disconnectByThread(
    threadId: string,
  ): Promise<SingleConnectionRequestResponse> {
    return api
      .post<any>(
        "/connection-requests/disconnect",
        {
          thread_id: threadId,
        },
        true,
      )
      .then((response) => ({
        request: transformRequest(response.request),
      }));
  }

  /**
   * Get connection request by thread_id (requires authentication)
   */
  getRequestByThread(
    threadId: string,
  ): Promise<SingleConnectionRequestResponse> {
    return api
      .get<any>(`/connection-requests/thread/${threadId}`, true)
      .then((response) => ({
        request: transformRequest(response.request),
      }));
  }

  /**
   * Reconnect with a user using thread_id (requires authentication)
   * Creates a new connection request to reconnect with someone you've disconnected from
   */
  reconnectByThread(
    threadId: string,
    message?: string,
  ): Promise<SingleConnectionRequestResponse> {
    return api
      .post<any>(
        "/connection-requests/reconnect",
        {
          thread_id: threadId,
          message: message || "Let's reconnect!",
        },
        true,
      )
      .then((response) => ({
        request: transformRequest(response.request),
      }));
  }
}

export const connectionService = new ConnectionService();
