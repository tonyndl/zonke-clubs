import { useState, useEffect } from "react";
import { connectionService } from "@/services/connectionService";
import { getThreads } from "@/services/messageService";
import { websocketService } from "@/services/websocketService";

export function useConnectionBadges() {
  const [requestsCount, setRequestsCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadCounts = () => {
    // Load pending connection requests count
    connectionService
      .getReceivedRequests()
      .then((response) => {
        // Count only pending requests (not accepted or declined)
        const pendingCount = response.requests.filter(
          (req) => req.status === "pending",
        ).length;
        setRequestsCount(pendingCount);
      })
      .catch((error) => {
        console.error("Error loading connection requests count:", error);
      });

    // Load unread messages count
    getThreads()
      .then((response) => {
        // Sum up unread counts from all threads
        const totalUnread = response.threads.reduce(
          (sum, thread) => sum + (thread.unreadCount || 0),
          0,
        );
        setUnreadCount(totalUnread);
      })
      .catch((error) => {
        console.error("Error loading unread messages count:", error);
      });
  };

  useEffect(() => {
    // Initial load
    loadCounts();

    // Listen for WebSocket events for real-time updates
    const handleNewRequest = () => {
      console.log("Badge: New connection request received");
      loadCounts(); // Reload counts when new request arrives
    };

    const handleRequestAccepted = () => {
      console.log("Badge: Connection request accepted");
      loadCounts(); // Reload counts when request is accepted
    };

    const handleRequestDeclined = () => {
      console.log("Badge: Connection request declined");
      loadCounts(); // Reload counts when request is declined
    };

    const handleNewMessage = () => {
      console.log("Badge: New message received");
      loadCounts(); // Reload counts when new message arrives
    };

    // Subscribe to WebSocket events
    websocketService.on("new_connection_request", handleNewRequest);
    websocketService.on("connection_request_accepted", handleRequestAccepted);
    websocketService.on("connection_request_declined", handleRequestDeclined);
    websocketService.on("new_message_in_thread", handleNewMessage);

    // Cleanup: Unsubscribe from WebSocket events
    return () => {
      websocketService.off("new_connection_request", handleNewRequest);
      websocketService.off(
        "connection_request_accepted",
        handleRequestAccepted,
      );
      websocketService.off(
        "connection_request_declined",
        handleRequestDeclined,
      );
      websocketService.off("new_message_in_thread", handleNewMessage);
    };
  }, []);

  return {
    requestsCount,
    unreadCount,
    refresh: loadCounts,
  };
}
