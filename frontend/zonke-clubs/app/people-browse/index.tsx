import { PeopleBrowse } from "@/components/meetup/PeopleBrowseModal";
import { Stack, useLocalSearchParams, useFocusEffect } from "expo-router";
import { MeetupIntention, getIntentionsForClub } from "@/types/meetup";
import { useState, useCallback, useEffect } from "react";
import { intentionsService } from "@/services/intentionsService";
import {
  connectionService,
  transformRequest,
} from "@/services/connectionService";
import { ConnectionRequest } from "@/types/connection";
import { ConnectSheet } from "@/components/meetup/ConnectSheet";
import { authService } from "@/services/authService";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/ui";
import { websocketService } from "@/services/websocketService";
import { clubsService } from "@/services/clubsService";
import { styles } from "./styles";

export default function PeopleBrowseScreen() {
  const params = useLocalSearchParams<{ clubId?: string }>();
  const clubId = params.clubId || "3f1b5bd3-a899-44c1-bfda-ee83f940accb"; // The Grand Africa Café & Beach (default fallback)

  const [intentions, setIntentions] = useState<MeetupIntention[]>([]);
  const [connectionStatuses, setConnectionStatuses] = useState<
    Map<string, { status: string; threadId?: string }>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedIntention, setSelectedIntention] =
    useState<MeetupIntention | null>(null);
  const [showConnectSheet, setShowConnectSheet] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string>("Club");

  const loadData = useCallback(() => {
    setLoading(true);

    // First get current user, then load intentions excluding that user
    authService
      .getCurrentUser()
      .then((user) => {
        setCurrentUserId(user?.id || null);

        return Promise.all([
          intentionsService.getClubIntentions(clubId, user?.id),
          connectionService.getReceivedRequests(),
          connectionService.getSentRequests(),
          clubsService.getClub(clubId),
        ]);
      })
      .then(([intentionsRes, receivedReqs, sentReqs, clubData]) => {
        // Set club name
        const fetchedClubName = clubData.club.name;
        setClubName(fetchedClubName);

        // Use only real API intentions
        const intentions = getIntentionsForClub(intentionsRes.intentions);
        console.log("People Browse - Intentions loaded:", intentions.length);
        console.log(
          "People Browse - Sample intention:",
          intentions[0]
            ? {
                id: intentions[0].id,
                userName: intentions[0].user.username,
                avatarUrl: intentions[0].user.avatarUrl,
              }
            : "No intentions",
        );
        setIntentions(intentions);

        // Build connection status map
        const statusMap = new Map<
          string,
          { status: string; threadId?: string }
        >();

        // Process received requests (where we are the receiver)
        receivedReqs.requests.forEach((req: ConnectionRequest) => {
          statusMap.set(req.sender.id, {
            status: req.status,
            threadId: req.threadId,
          });
        });

        // Process sent requests (where we are the sender)
        sentReqs.requests.forEach((req: ConnectionRequest) => {
          statusMap.set(req.receiver.id, {
            status: req.status,
            threadId: req.threadId,
          });
        });

        setConnectionStatuses(statusMap);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        // On error, show empty state (no dummy data for testing real functionality)
        setIntentions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clubId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Listen for connection request accepted events via WebSocket
  useEffect(() => {
    const handleRequestAccepted = (payload: any) => {
      console.log("Connection request accepted, updating UI:", payload);

      // Transform the request from snake_case to camelCase
      const transformedRequest = transformRequest(payload.request);

      // Update the connection status map
      setConnectionStatuses((prevStatuses) => {
        const newStatuses = new Map(prevStatuses);

        // Update status for the receiver (the person we sent the request to)
        newStatuses.set(transformedRequest.receiver.id, {
          status: transformedRequest.status,
          threadId: transformedRequest.threadId,
        });

        return newStatuses;
      });
    };

    websocketService.on("connection_request_accepted", handleRequestAccepted);

    return () => {
      websocketService.off(
        "connection_request_accepted",
        handleRequestAccepted,
      );
    };
  }, []);

  const handleConnect = (intention: MeetupIntention) => {
    setSelectedIntention(intention);
    setShowConnectSheet(true);
  };

  const handleSendRequest = (message?: string) => {
    if (!selectedIntention) return;

    connectionService
      .createRequest({
        receiver_id: selectedIntention.user.id,
        message: message || undefined,
        club_id: clubId,
        intention_id: selectedIntention.id,
      })
      .then(() => {
        setShowConnectSheet(false);
        setSelectedIntention(null);
        // Reload data to update connection statuses
        loadData();
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PeopleBrowse
        intentions={intentions}
        onConnect={handleConnect}
        connectionStatuses={connectionStatuses}
        currentUserId={currentUserId}
        clubName={clubName}
        clubId={clubId}
      />
      {showConnectSheet && selectedIntention && (
        <ConnectSheet
          visible={showConnectSheet}
          intention={selectedIntention}
          onClose={() => {
            setShowConnectSheet(false);
            setSelectedIntention(null);
          }}
          onSendRequest={handleSendRequest}
        />
      )}
    </>
  );
}
