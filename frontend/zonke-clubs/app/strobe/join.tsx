import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Animated,
  Easing,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import Torch from "react-native-torch";
import { Colors } from "@/constants/ui";
import { useAuth } from "@/contexts/AuthContext";
import {
  strobeService,
  strobeChannel,
  getEffectPattern,
  getNextBeatDelay,
  type StrobeEffect,
  type StrobeSessionInfo,
} from "@/services/strobeService";
import { EmptyState } from "@/components/ui/EmptyState";

export default function JoinStrobeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const paramClubId = params.clubId as string | undefined;
  const paramClubName = params.clubName as string | undefined;
  const paramAutoJoin = params.autoJoin as string | undefined;
  const paramSessionId = params.sessionId as string | undefined;
  const paramBpm = params.bpm ? Number(params.bpm) : undefined;
  const paramEffect = params.effect as StrobeEffect | undefined;
  const paramServerTime = params.serverTime
    ? Number(params.serverTime)
    : undefined;
  const paramCustomOnMs = params.customOnMs ? Number(params.customOnMs) : null;
  const paramCustomOffMs = params.customOffMs
    ? Number(params.customOffMs)
    : null;

  // If clubId was passed, skip the picker
  const [clubId, setClubId] = useState<string | null>(paramClubId ?? null);
  const [clubName, setClubName] = useState<string>(paramClubName ?? "");

  // Club picker state (shown when no clubId passed)
  const [activeSessions, setActiveSessions] = useState<
    Array<{
      session_id: string;
      club_id: string;
      bpm: number;
      effect: StrobeEffect;
      club_name: string | null;
    }>
  >([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Strobe state
  const [joined, setJoined] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<StrobeSessionInfo | null>(
    null,
  );
  const [torchOn, setTorchOn] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [djOverriding, setDjOverriding] = useState(false);
  const [interferMode, setInterferMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedCount, setConnectedCount] = useState(0);
  const [endStrobeModal, setEndStrobeModal] = useState(false);

  // Register presence callback once — always reflects the strobe channel's count
  useEffect(() => {
    strobeChannel.onPresenceUpdate((count) => {
      setConnectedCount(count);
    });
  }, []);

  // True when this user is the DJ that started the active session
  const isDJ = !!(
    user?.id &&
    sessionInfo?.dj_user_id &&
    user.id === sessionInfo.dj_user_id
  );
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const autoJoinFiredRef = useRef(false);

  const beatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const patternIndexRef = useRef(0);
  const currentEffectRef = useRef<StrobeEffect>("kick");
  const currentBpmRef = useRef(120);
  const currentCustomOnMsRef = useRef<number | null>(null);
  const currentCustomOffMsRef = useRef<number | null>(null);
  const serverTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  // Pulse animation for idle state (stopped during active strobe)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isActive) {
      pulseRef.current?.stop();
      pulseAnim.setValue(1);
    } else {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulseRef.current.start();
    }
    return () => pulseRef.current?.stop();
  }, [isActive]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopBeatTimer();
      strobeChannel.leave();
      Torch?.switchState(false).catch(() => {});
    };
  }, []);

  // Drive the hardware torch via react-native-torch (works with screen off)
  useEffect(() => {
    if (!isActive) return;
    Torch?.switchState(torchOn).catch((err: unknown) =>
      console.warn("Torch error:", err),
    );
  }, [torchOn, isActive]);

  // Show a persistent foreground notification while strobe is active.
  // On Android this promotes the app to foreground-service priority so the
  // system keeps the JS thread running even when the screen turns off.
  useEffect(() => {
    if (!isActive) return;
    if (isDJ) return; // DJ doesn't need the audience-style sync notification

    Notifications.setNotificationChannelAsync("strobe-active", {
      name: "Strobe Active",
      importance: Notifications.AndroidImportance.MAX,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    }).catch(() => {});

    let notifId: string | null = null;
    Notifications.scheduleNotificationAsync({
      content: {
        title: "⚡ Strobe Sync Active",
        body: "Your flashlight is synced to the DJ — keep this running",
        sticky: true,
        autoDismiss: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
        color: "#39F3FF",
      },
      trigger: null,
    })
      .then((id) => {
        notifId = id;
      })
      .catch(() => {});

    return () => {
      if (notifId)
        Notifications.dismissNotificationAsync(notifId).catch(() => {});
      Notifications.dismissAllNotificationsAsync().catch(() => {});
    };
  }, [isActive, isDJ]);

  // Load active sessions when no club pre-selected
  useFocusEffect(
    useCallback(() => {
      if (!paramClubId) {
        setLoadingSessions(true);
        strobeService
          .listActiveSessions()
          .then((sessions) => {
            if (isMountedRef.current) setActiveSessions(sessions);
          })
          .catch(() => {})
          .finally(() => {
            if (isMountedRef.current) setLoadingSessions(false);
          });
      }
    }, [paramClubId]),
  );

  // Auto-join as soon as a club is selected
  useEffect(() => {
    if (
      !clubId ||
      joined ||
      autoJoinFiredRef.current ||
      cameraPermission === undefined
    )
      return;
    autoJoinFiredRef.current = true;

    // DJ fast path: full session info was passed as params — show active state instantly
    if (
      paramAutoJoin === "1" &&
      paramSessionId &&
      paramBpm &&
      paramEffect &&
      paramServerTime
    ) {
      const info: StrobeSessionInfo = {
        session_id: paramSessionId,
        bpm: paramBpm,
        effect: paramEffect,
        server_time: paramServerTime,
        dj_user_id: user?.id,
        custom_on_ms: paramCustomOnMs ?? undefined,
        custom_off_ms: paramCustomOffMs ?? undefined,
      };
      setSessionInfo(info);
      currentBpmRef.current = paramBpm;
      currentEffectRef.current = paramEffect;
      currentCustomOnMsRef.current = paramCustomOnMs;
      currentCustomOffMsRef.current = paramCustomOffMs;
      serverTimeRef.current = paramServerTime;
      setIsActive(true);
      setJoined(true);
      startBeatTimer(
        paramServerTime,
        paramBpm,
        paramEffect,
        paramCustomOnMs,
        paramCustomOffMs,
      );

      // Join channel in background to receive future updates / overrides / stop
      strobeChannel
        .join(clubId)
        .then(() => {
          strobeChannel.onStrobeUpdated((updated) => {
            if (!isMountedRef.current) return;
            setSessionInfo(updated);
            currentBpmRef.current = updated.bpm;
            currentEffectRef.current = updated.effect;
            currentCustomOnMsRef.current = updated.custom_on_ms ?? null;
            currentCustomOffMsRef.current = updated.custom_off_ms ?? null;
            serverTimeRef.current = updated.server_time;
            stopBeatTimer();
            startBeatTimer(
              updated.server_time,
              updated.bpm,
              updated.effect,
              updated.custom_on_ms,
              updated.custom_off_ms,
            );
          });
          strobeChannel.onStrobeStopped(() => {
            if (!isMountedRef.current) return;
            stopBeatTimer();
            setTorchOn(false);
            setIsActive(false);
            setSessionInfo(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          });
          strobeChannel.onStrobeOverride((on, resume) => {
            if (!isMountedRef.current) return;
            if (on) {
              stopBeatTimer();
              setTorchOn(true);
            } else {
              setTorchOn(false);
              if (resume) {
                patternIndexRef.current = 0;
                const anchor = serverTimeRef.current;
                if (anchor > 0)
                  startBeatTimer(
                    anchor,
                    currentBpmRef.current,
                    currentEffectRef.current,
                    currentCustomOnMsRef.current,
                    currentCustomOffMsRef.current,
                  );
              }
            }
          });
        })
        .catch(console.error);
      return;
    }

    // Audience path: join channel then fetch current session
    handleJoin();
  }, [clubId, joined, cameraPermission]);

  const handleSelectClub = (cId: string, cName: string) => {
    setClubId(cId);
    setClubName(cName);
  };

  const handleJoin = () => {
    if (!clubId) return;

    if (!cameraPermission?.granted) {
      requestCameraPermission().then((result) => {
        if (result.granted) handleJoin();
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    strobeChannel
      .join(clubId)
      .then(() => {
        if (!isMountedRef.current) return;
        setJoined(true);

        strobeChannel.onStrobeStarted((info) => {
          if (!isMountedRef.current) return;
          setSessionInfo(info);
          currentBpmRef.current = info.bpm;
          currentEffectRef.current = info.effect;
          currentCustomOnMsRef.current = info.custom_on_ms ?? null;
          currentCustomOffMsRef.current = info.custom_off_ms ?? null;
          serverTimeRef.current = info.server_time;
          setIsActive(true);
          startBeatTimer(
            info.server_time,
            info.bpm,
            info.effect,
            info.custom_on_ms,
            info.custom_off_ms,
          );
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        });

        strobeChannel.onStrobeUpdated((info) => {
          if (!isMountedRef.current) return;
          setSessionInfo(info);
          currentBpmRef.current = info.bpm;
          currentEffectRef.current = info.effect;
          currentCustomOnMsRef.current = info.custom_on_ms ?? null;
          currentCustomOffMsRef.current = info.custom_off_ms ?? null;
          serverTimeRef.current = info.server_time;
          stopBeatTimer();
          startBeatTimer(
            info.server_time,
            info.bpm,
            info.effect,
            info.custom_on_ms,
            info.custom_off_ms,
          );
        });

        strobeChannel.onStrobeStopped(() => {
          if (!isMountedRef.current) return;
          stopBeatTimer();
          setTorchOn(false);
          setIsActive(false);
          setSessionInfo(null);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        });

        strobeChannel.onStrobeOverride((on, resume) => {
          if (!isMountedRef.current) return;
          if (on) {
            stopBeatTimer();
            setTorchOn(true);
          } else {
            setTorchOn(false);
            if (resume) {
              patternIndexRef.current = 0;
              const anchor = serverTimeRef.current;
              if (anchor > 0)
                startBeatTimer(
                  anchor,
                  currentBpmRef.current,
                  currentEffectRef.current,
                  currentCustomOnMsRef.current,
                  currentCustomOffMsRef.current,
                );
            }
            // resume=false means interfere mode — stay dark, wait for next hold
          }
        });

        return strobeChannel.getCurrentSession();
      })
      .then((current) => {
        if (!isMountedRef.current || !current) return;
        setSessionInfo(current);
        currentBpmRef.current = current.bpm;
        currentEffectRef.current = current.effect;
        currentCustomOnMsRef.current = current.custom_on_ms ?? null;
        currentCustomOffMsRef.current = current.custom_off_ms ?? null;
        serverTimeRef.current = current.server_time;
        setIsActive(true);
        startBeatTimer(
          current.server_time,
          current.bpm,
          current.effect,
          current.custom_on_ms,
          current.custom_off_ms,
        );
      })
      .catch((err) => {
        console.error("Failed to join strobe channel", err);
        if (isMountedRef.current) setError("Failed to join. Please try again.");
      });
  };

  const handleLeave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stopBeatTimer();
    setTorchOn(false);
    setIsActive(false);
    setJoined(false);
    setSessionInfo(null);
    autoJoinFiredRef.current = false;
    strobeChannel.leave();
    // Go back to picker if we came from settings
    if (!paramClubId) {
      setClubId(null);
      setClubName("");
    }
  };

  // ── DJ live override (only when this user is the session's DJ) ───────────────

  const handleOverrideIn = () => {
    if (!isDJ) return;
    stopBeatTimer();
    setTorchOn(true);
    setDjOverriding(true);
    strobeChannel.overrideOn();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleOverrideOut = () => {
    if (!isDJ) return;
    setTorchOn(false);
    setDjOverriding(false);
    strobeChannel.overrideOff(!interferMode);
    // Only resume scheduled pattern if interfere mode is off
    if (!interferMode) {
      patternIndexRef.current = 0;
      if (serverTimeRef.current > 0) {
        startBeatTimer(
          serverTimeRef.current,
          currentBpmRef.current,
          currentEffectRef.current,
          currentCustomOnMsRef.current,
          currentCustomOffMsRef.current,
        );
      }
    }
  };

  const toggleInterferMode = (val: boolean) => {
    setInterferMode(val);
    if (val) {
      stopBeatTimer();
      setTorchOn(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      // Resume locally
      patternIndexRef.current = 0;
      if (serverTimeRef.current > 0) {
        startBeatTimer(
          serverTimeRef.current,
          currentBpmRef.current,
          currentEffectRef.current,
          currentCustomOnMsRef.current,
          currentCustomOffMsRef.current,
        );
      }
      // Broadcast resume to all audience devices so their timers restart too
      strobeChannel.overrideOff(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleEndStrobe = () => {
    if (!sessionInfo) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    strobeChannel
      .stopStrobe(sessionInfo.session_id)
      .catch((err) => console.error("Failed to end strobe", err))
      .finally(() => {
        if (isMountedRef.current) router.replace("/strobe/dj");
      });
  };

  // ── Beat timer ──────────────────────────────────────────────────────────────

  const startBeatTimer = (
    anchorTime: number,
    bpm: number,
    effect: StrobeEffect,
    customOnMs?: number | null,
    customOffMs?: number | null,
  ) => {
    stopBeatTimer();
    patternIndexRef.current = 0;
    scheduleNextFlash(anchorTime, bpm, effect, customOnMs, customOffMs);
  };

  const stopBeatTimer = () => {
    if (beatTimerRef.current) {
      clearTimeout(beatTimerRef.current);
      beatTimerRef.current = null;
    }
  };

  const scheduleNextFlash = (
    anchorTime: number,
    bpm: number,
    effect: StrobeEffect,
    customOnMs?: number | null,
    customOffMs?: number | null,
  ) => {
    if (!isMountedRef.current) return;

    const pattern = getEffectPattern(effect, bpm, customOnMs, customOffMs);
    const idx = patternIndexRef.current % pattern.length;
    const [onMs, offMs] = pattern[idx];

    const delay =
      idx === 0 && effect !== "custom" ? getNextBeatDelay(anchorTime, bpm) : 0;

    beatTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setTorchOn(true);

      beatTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setTorchOn(false);
        patternIndexRef.current += 1;

        beatTimerRef.current = setTimeout(() => {
          scheduleNextFlash(
            anchorTime,
            currentBpmRef.current,
            currentEffectRef.current,
            currentCustomOnMsRef.current,
            currentCustomOffMsRef.current,
          );
        }, offMs);
      }, onMs);
    }, delay);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  // Show club picker when no club is selected yet
  if (!clubId) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.gold} />
          </Pressable>
          <Text style={styles.headerTitle}>STROBE SYNC</Text>
          <View style={{ width: 40 }} />
        </View>

        {activeSessions.length > 0 && (
          <View style={styles.pickerHeader}>
            <Ionicons name="flash" size={28} color={Colors.accent} />
            <Text style={styles.pickerTitle}>Active Strobes</Text>
            <Text style={styles.pickerSub}>
              Select a club to sync your flashlight to the DJ's beat
            </Text>
          </View>
        )}

        {loadingSessions ? (
          <ActivityIndicator
            color={Colors.accent}
            style={{ marginTop: 40 }}
            size="large"
          />
        ) : activeSessions.length === 0 ? (
          <EmptyState
            icon="flash-off"
            title="No active strobes right now"
            subtitle="Ask the DJ at your club to start a strobe session"
          />
        ) : (
          <FlatList
            data={activeSessions}
            keyExtractor={(s) => s.session_id}
            contentContainerStyle={styles.sessionList}
            renderItem={({ item }) => (
              <Pressable
                style={styles.sessionCard}
                onPress={() =>
                  handleSelectClub(item.club_id, item.club_name ?? "Club")
                }
              >
                <View style={styles.sessionCardLeft}>
                  <View style={styles.activeIndicator} />
                  <View>
                    <Text style={styles.sessionClubName}>
                      {item.club_name ?? "Club"}
                    </Text>
                    <Text style={styles.sessionMeta}>
                      {item.bpm} BPM ·{" "}
                      {item.effect.replace("_", " ").toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={styles.joinSmallBtn}
                  onPress={() =>
                    handleSelectClub(item.club_id, item.club_name ?? "Club")
                  }
                >
                  <Ionicons name="flash" size={14} color="#000" />
                  <Text style={styles.joinSmallBtnText}>JOIN</Text>
                </Pressable>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Pressable
          onPress={() => {
            // DJ with an active strobe must confirm before leaving (ends strobe for all)
            if (isDJ && isActive) {
              setEndStrobeModal(true);
              return;
            }
            if (joined) {
              handleLeave();
            } else if (!paramClubId) {
              setClubId(null);
              setClubName("");
            } else {
              router.back();
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.gold} />
        </Pressable>
        <Text style={styles.headerTitle}>STROBE SYNC</Text>
        <View style={{ width: 40 }} />
      </View>

      <View
        style={[
          styles.body,
          joined && isActive && isDJ && { paddingBottom: 180 },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            style={[
              styles.iconWrap,
              isActive && styles.iconWrapActive,
              torchOn && styles.iconWrapFlash,
              isDJ && isActive && interferMode && styles.iconWrapDJ,
            ]}
            onPressIn={
              isDJ && isActive && interferMode ? handleOverrideIn : undefined
            }
            onPressOut={
              isDJ && isActive && interferMode ? handleOverrideOut : undefined
            }
          >
            <Ionicons
              name="flash"
              size={64}
              color={
                torchOn ? "#FFFFFF" : isActive ? Colors.accent : Colors.smoke
              }
            />
            {isDJ && isActive && interferMode && !djOverriding && (
              <Text style={styles.holdHint}>HOLD</Text>
            )}
          </Pressable>
        </Animated.View>

        <Text style={styles.clubNameText}>{clubName || "Club Strobe"}</Text>

        {!joined && (
          <>
            {error ? (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable
                  style={styles.joinBtn}
                  onPress={() => {
                    autoJoinFiredRef.current = false;
                    handleJoin();
                  }}
                >
                  <Ionicons name="flash" size={22} color="#000" />
                  <Text style={styles.joinBtnText}>RETRY</Text>
                </Pressable>
              </>
            ) : (
              <ActivityIndicator color={Colors.accent} size="large" />
            )}
          </>
        )}

        {joined && !isActive && (
          <>
            <Text style={styles.statusText}>
              Waiting for the DJ to start the strobe...
            </Text>
            <View style={styles.waitingDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.dot} />
              ))}
            </View>
            <Pressable style={styles.leaveBtn} onPress={handleLeave}>
              <Text style={styles.leaveBtnText}>LEAVE</Text>
            </Pressable>
          </>
        )}

        {joined && isActive && sessionInfo && (
          <>
            <View style={styles.sessionInfo}>
              <View style={styles.infoChip}>
                <Text style={styles.infoChipLabel}>EFFECT</Text>
                <Text style={styles.infoChipValue}>
                  {interferMode
                    ? "MANUAL"
                    : sessionInfo.effect.replace("_", " ").toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.activeText}>
              {interferMode
                ? "INTERFERE MODE"
                : isDJ
                  ? `SYNCED TO ${Math.max(connectedCount - 1, 0)} ${
                      connectedCount - 1 === 1 ? "PERSON" : "PEOPLE"
                    }`
                  : "SYNCED TO DJ"}
            </Text>

            {!isDJ && (
              <Pressable style={styles.leaveBtn} onPress={handleLeave}>
                <Text style={styles.leaveBtnText}>LEAVE</Text>
              </Pressable>
            )}
          </>
        )}
      </View>

      {/* DJ-only controls pinned to the bottom of the screen */}
      {joined && isActive && sessionInfo && isDJ && (
        <View style={styles.djControlsBottom} pointerEvents="box-none">
          <View style={styles.interferRow}>
            <View style={styles.interferLeft}>
              <Ionicons
                name="radio"
                size={16}
                color={interferMode ? Colors.accent : Colors.smoke}
              />
              <Text
                style={[
                  styles.interferLabel,
                  interferMode && { color: Colors.accent },
                ]}
              >
                INTERFERE
              </Text>
            </View>
            <Switch
              value={interferMode}
              onValueChange={toggleInterferMode}
              trackColor={{
                false: "rgba(255,255,255,0.1)",
                true: "rgba(57,243,255,0.35)",
              }}
              thumbColor={interferMode ? Colors.accent : Colors.smoke}
            />
          </View>

          {interferMode && (
            <Text style={styles.interferHint}>
              Tap & hold the icon above to flash
            </Text>
          )}

          <Pressable style={styles.endStrobeBtn} onPress={handleEndStrobe}>
            <Ionicons name="stop-circle" size={18} color="#FF4444" />
            <Text style={styles.endStrobeBtnText}>END STROBE</Text>
          </Pressable>
        </View>
      )}

      {/* End strobe + leave confirmation (DJ only) */}
      <Modal
        visible={endStrobeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEndStrobeModal(false)}
      >
        <BlurView intensity={60} tint="dark" style={{ flex: 1 }}>
          <Pressable
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 32,
            }}
            onPress={() => setEndStrobeModal(false)}
          >
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: Colors.bgCard,
                borderRadius: 20,
                padding: 24,
                width: "100%",
                borderWidth: 1,
                borderColor: "rgba(57, 243, 255, 0.15)",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: Colors.platinum,
                  marginBottom: 10,
                }}
              >
                End strobe?
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.smoke,
                  lineHeight: 20,
                  marginBottom: 24,
                }}
              >
                Are you sure you want to end the strobe and leave? This will
                stop the light show for everyone synced to you.
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => setEndStrobeModal(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: Colors.bgSecondary,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: Colors.lightGrey,
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setEndStrobeModal(false);
                    handleEndStrobe();
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: "#EF4444",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: Colors.white,
                    }}
                  >
                    End & Leave
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  hiddenCamera: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.gold,
    letterSpacing: 3,
  },
  // Picker styles
  pickerHeader: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 8,
  },
  pickerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.platinum,
    letterSpacing: 1,
  },
  pickerSub: {
    fontSize: 13,
    color: Colors.smoke,
    textAlign: "center",
    lineHeight: 20,
  },
  sessionList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.2)",
  },
  sessionCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  sessionClubName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.platinum,
  },
  sessionMeta: {
    fontSize: 11,
    color: Colors.smoke,
    marginTop: 2,
  },
  joinSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  joinSmallBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 1,
  },
  emptyPicker: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyPickerText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.platinum,
    textAlign: "center",
  },
  emptyPickerSub: {
    fontSize: 13,
    color: Colors.smoke,
    textAlign: "center",
    lineHeight: 20,
  },
  // Syncing screen styles
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  iconWrapActive: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(57,243,255,0.1)",
  },
  iconWrapFlash: {
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  iconWrapDJ: {
    borderStyle: "dashed",
    borderColor: Colors.accent,
  },
  holdHint: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.accent,
    letterSpacing: 2,
    marginTop: 2,
  },
  clubNameText: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.platinum,
    letterSpacing: 2,
    textAlign: "center",
  },
  statusText: {
    fontSize: 14,
    color: Colors.smoke,
    textAlign: "center",
    lineHeight: 22,
  },
  errorText: {
    fontSize: 13,
    color: "#FF4444",
    textAlign: "center",
  },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    gap: 10,
    marginTop: 8,
  },
  joinBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 2,
  },
  leaveBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    marginTop: 8,
  },
  leaveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.smoke,
    letterSpacing: 2,
  },
  waitingDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.smoke,
    opacity: 0.5,
  },
  sessionInfo: {
    flexDirection: "row",
    gap: 12,
  },
  infoChip: {
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  infoChipLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.smoke,
    letterSpacing: 1,
  },
  infoChipValue: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.accent,
    letterSpacing: 1,
    marginTop: 2,
  },
  activeText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.accent,
    letterSpacing: 3,
  },
  djControls: {
    width: "100%",
    gap: 12,
    marginTop: 4,
  },
  djControlsBottom: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 30,
    gap: 12,
  },
  interferRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.15)",
  },
  interferLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  interferLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.smoke,
    letterSpacing: 2,
  },
  interferHint: {
    fontSize: 12,
    color: Colors.smoke,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  endStrobeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.4)",
    backgroundColor: "rgba(255,68,68,0.08)",
  },
  endStrobeBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FF4444",
    letterSpacing: 2,
  },
});
