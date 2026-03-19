import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/ui";
import {
  strobeService,
  strobeChannel,
  getEffectPattern,
  getNextBeatDelay,
  type StrobeApproval,
  type StrobeEffect,
} from "@/services/strobeService";

const EFFECTS: {
  id: StrobeEffect;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    id: "pulse",
    label: "PULSE",
    icon: "radio-button-on",
    desc: "Warm heartbeat",
  },
  { id: "kick", label: "KICK", icon: "flash", desc: "Sharp on every beat" },
  { id: "half", label: "HALF", icon: "remove", desc: "Every 2 beats" },
  { id: "bar", label: "BAR", icon: "pause", desc: "Every 4 beats" },
  { id: "stutter", label: "STUTTER", icon: "git-commit", desc: "Double thump" },
  {
    id: "wave",
    label: "WAVE",
    icon: "trending-up",
    desc: "Pulse then stutter",
  },
  { id: "custom", label: "CUSTOM", icon: "options", desc: "Set your own" },
];

const BPM = 120; // fixed internally, not exposed to DJ

export default function DJStrobeScreen() {
  const router = useRouter();

  const [approvals, setApprovals] = useState<StrobeApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<StrobeApproval | null>(null);
  const [effect, setEffect] = useState<StrobeEffect>("kick");
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [customOnMs, setCustomOnMs] = useState(50);
  const [customOffMs, setCustomOffMs] = useState(100);
  const [tapping, setTapping] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [overriding, setOverriding] = useState(false);

  const tapPressStartRef = useRef(0);
  const tapReleaseTimeRef = useRef(0);
  const tapOnSamplesRef = useRef<number[]>([]);
  const tapOffSamplesRef = useRef<number[]>([]);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const beatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const patternIndexRef = useRef(0);
  const serverTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      loadApprovals();
    }, []),
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopBeatTimer();
      if (selectedClub) {
        strobeChannel.leave();
      }
    };
  }, []);

  const loadApprovals = () => {
    setLoading(true);
    strobeService
      .getMyApprovals()
      .then((data) => {
        if (!isMountedRef.current) return;
        setApprovals(data);
        // Auto-select first approved club
        const approved = data.filter((a) => a.status === "approved");
        if (approved.length === 1 && !selectedClub) {
          setSelectedClub(approved[0]);
        }
      })
      .catch((err) => console.error("Failed to load approvals", err))
      .finally(() => {
        if (isMountedRef.current) setLoading(false);
      });
  };

  const approvedApprovals = approvals.filter((a) => a.status === "approved");
  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  const selectClub = (approval: StrobeApproval) => {
    if (isRunning) return;
    setSelectedClub(approval);
  };

  const startStrobe = () => {
    if (!selectedClub) {
      Alert.alert(
        "Select a club",
        "Please select which club you're performing at.",
      );
      return;
    }

    if (!cameraPermission?.granted) {
      requestCameraPermission().then((result) => {
        if (result.granted) startStrobe();
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    strobeChannel
      .join(selectedClub.club_id)
      .then(() =>
        strobeChannel.startStrobe(
          BPM,
          effect,
          effect === "custom" ? customOnMs : undefined,
          effect === "custom" ? customOffMs : undefined,
        ),
      )
      .then((info) => {
        if (!isMountedRef.current) return;
        setSessionId(info.session_id);
        serverTimeRef.current = info.server_time;
        setIsRunning(true);
        // Navigate to join screen — pass full session info so it can show active state instantly
        router.replace({
          pathname: "/strobe/join" as any,
          params: {
            clubId: selectedClub.club_id,
            clubName: selectedClub.club?.name ?? "",
            autoJoin: "1",
            sessionId: info.session_id,
            bpm: String(info.bpm),
            effect: info.effect,
            serverTime: String(info.server_time),
            ...(info.custom_on_ms != null
              ? { customOnMs: String(info.custom_on_ms) }
              : {}),
            ...(info.custom_off_ms != null
              ? { customOffMs: String(info.custom_off_ms) }
              : {}),
          },
        });
      })
      .catch((err) => {
        console.error("Failed to start strobe", err);
        Alert.alert(
          "Error",
          "Could not start strobe. Make sure you have an active approval.",
        );
      });
  };

  const stopStrobe = () => {
    if (!sessionId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    strobeChannel
      .stopStrobe(sessionId)
      .then(() => {
        stopBeatTimer();
        setTorchOn(false);
        setIsRunning(false);
        setSessionId(null);
        strobeChannel.leave();
      })
      .catch((err) => console.error("Failed to stop strobe", err));
  };

  const updateStrobe = (
    newBpm: number,
    newEffect: StrobeEffect,
    newOnMs?: number,
    newOffMs?: number,
  ) => {
    if (!sessionId || !isRunning) return;

    strobeChannel
      .updateStrobe(
        sessionId,
        newBpm,
        newEffect,
        newEffect === "custom" ? (newOnMs ?? customOnMs) : undefined,
        newEffect === "custom" ? (newOffMs ?? customOffMs) : undefined,
      )
      .then(() => {
        stopBeatTimer();
        serverTimeRef.current = Date.now();
        startBeatTimer(serverTimeRef.current);
      })
      .catch((err) => console.error("Failed to update strobe", err));
  };

  const changeEffect = (newEffect: StrobeEffect) => {
    setEffect(newEffect);
    if (isRunning) updateStrobe(BPM, newEffect);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const changeCustomOnMs = (val: number) => {
    const clamped = Math.max(10, Math.min(500, val));
    setCustomOnMs(clamped);
    if (isRunning && effect === "custom")
      updateStrobe(BPM, "custom", clamped, customOffMs);
  };

  const changeCustomOffMs = (val: number) => {
    const clamped = Math.max(10, Math.min(2000, val));
    setCustomOffMs(clamped);
    if (isRunning && effect === "custom")
      updateStrobe(BPM, "custom", customOnMs, clamped);
  };

  const handleTapIn = () => {
    const now = Date.now();
    // Record off duration if this isn't the very first tap
    if (tapReleaseTimeRef.current > 0) {
      const offMs = now - tapReleaseTimeRef.current;
      if (offMs >= 10 && offMs <= 5000) {
        tapOffSamplesRef.current.push(offMs);
      }
    }
    tapPressStartRef.current = now;
    setTapping(true);
    // Live torch preview when not running
    if (!isRunning) setTorchOn(true);
  };

  const handleTapOut = () => {
    const now = Date.now();
    const onMs = now - tapPressStartRef.current;
    tapReleaseTimeRef.current = now;
    setTapping(false);
    if (!isRunning) setTorchOn(false);

    if (onMs >= 10 && onMs <= 1000) {
      tapOnSamplesRef.current.push(onMs);
    }

    const onSamples = tapOnSamplesRef.current;
    const offSamples = tapOffSamplesRef.current;

    // Need at least 2 complete on+off cycles to calculate averages
    if (onSamples.length >= 2 && offSamples.length >= 1) {
      const recent = (arr: number[]) => arr.slice(-4);
      const avg = (arr: number[]) =>
        Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      const newOn = avg(recent(onSamples));
      const newOff = avg(recent(offSamples));
      setCustomOnMs(newOn);
      setCustomOffMs(newOff);
      setTapCount(onSamples.length);
      if (isRunning) updateStrobe(BPM, "custom", newOn, newOff);
    } else {
      setTapCount(onSamples.length);
    }
  };

  const handleOverrideIn = () => {
    stopBeatTimer();
    setTorchOn(true);
    setOverriding(true);
    strobeChannel.overrideOn();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleOverrideOut = () => {
    setTorchOn(false);
    setOverriding(false);
    strobeChannel.overrideOff();
    // Resume scheduled pattern from current server time anchor
    patternIndexRef.current = 0;
    startBeatTimer(serverTimeRef.current);
  };

  const resetTaps = () => {
    tapPressStartRef.current = 0;
    tapReleaseTimeRef.current = 0;
    tapOnSamplesRef.current = [];
    tapOffSamplesRef.current = [];
    setTapCount(0);
  };

  // ── Beat timer ──────────────────────────────────────────────────────────────

  const startBeatTimer = (anchorTime: number) => {
    stopBeatTimer();
    patternIndexRef.current = 0;
    scheduleNextFlash(anchorTime);
  };

  const stopBeatTimer = () => {
    if (beatTimerRef.current) {
      clearTimeout(beatTimerRef.current);
      beatTimerRef.current = null;
    }
  };

  const scheduleNextFlash = (anchorTime: number) => {
    if (!isMountedRef.current) return;

    const pattern = getEffectPattern(effect, BPM, customOnMs, customOffMs);
    const idx = patternIndexRef.current % pattern.length;
    const [onMs, offMs] = pattern[idx];

    // Re-sync to beat grid only at the start of each pattern cycle
    const delay = idx === 0 ? getNextBeatDelay(anchorTime, BPM) : 0;

    beatTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setTorchOn(true);

      beatTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setTorchOn(false);
        patternIndexRef.current += 1;

        // Apply offMs gap so multi-step patterns space correctly
        beatTimerRef.current = setTimeout(() => {
          scheduleNextFlash(anchorTime);
        }, offMs);
      }, onMs);
    }, delay);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.platinum} />
          </Pressable>
          <Text style={styles.headerTitle}>DJ STROBE</Text>
          <View style={{ width: 40 }} />
        </View>
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* Hidden camera for torch control */}
      {isRunning && (
        <CameraView
          style={styles.hiddenCamera}
          enableTorch={torchOn}
          facing="back"
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.platinum} />
        </Pressable>
        <Text style={styles.headerTitle}>DJ STROBE</Text>
        {/* Request approval button */}
        <Pressable
          onPress={() => router.push("/strobe/request-approval" as any)}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={22} color={Colors.accent} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pending requests banner */}
        {pendingApprovals.length > 0 && (
          <View style={styles.pendingBanner}>
            <Ionicons name="time" size={16} color={Colors.accent} />
            <Text style={styles.pendingText}>
              {pendingApprovals.length} pending approval
              {pendingApprovals.length > 1 ? "s" : ""}:{" "}
              {pendingApprovals.map((a) => a.club?.name ?? "Club").join(", ")}
            </Text>
          </View>
        )}

        {/* No approved clubs */}
        {approvedApprovals.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="flash-off" size={48} color={Colors.smoke} />
            <Text style={styles.emptyTitle}>No Active Approvals</Text>
            <Text style={styles.emptyDesc}>
              Ask a club admin to approve your strobe request.
            </Text>
            <Pressable
              style={styles.requestApprovalBtn}
              onPress={() => router.push("/strobe/request-approval" as any)}
            >
              <Ionicons name="send" size={16} color="#000" />
              <Text style={styles.requestApprovalBtnText}>
                REQUEST APPROVAL
              </Text>
            </Pressable>
          </View>
        )}

        {/* Club selection */}
        {approvedApprovals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PERFORMING AT</Text>
            {approvedApprovals.map((a) => (
              <Pressable
                key={a.id}
                style={[
                  styles.clubCard,
                  selectedClub?.id === a.id && styles.clubCardActive,
                  isRunning && styles.clubCardDisabled,
                ]}
                onPress={() => selectClub(a)}
              >
                <View style={styles.clubCardLeft}>
                  <View
                    style={[
                      styles.clubDot,
                      selectedClub?.id === a.id && {
                        backgroundColor: Colors.accent,
                      },
                    ]}
                  />
                  <Text style={styles.clubName}>{a.club?.name ?? "Club"}</Text>
                </View>
                <View style={styles.clubCardRight}>
                  <Text style={styles.clubExpiry}>
                    expires{" "}
                    {a.expires_at
                      ? new Date(a.expires_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </Text>
                  {selectedClub?.id === a.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={Colors.accent}
                    />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* BPM */}
        {approvedApprovals.length > 0 && (
          <>
            {/* Effects */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>EFFECT</Text>
              <View style={styles.effectsGrid}>
                {EFFECTS.map((e) => (
                  <Pressable
                    key={e.id}
                    style={[
                      styles.effectCard,
                      effect === e.id && styles.effectCardActive,
                    ]}
                    onPress={() => changeEffect(e.id)}
                  >
                    <Ionicons
                      name={e.icon as any}
                      size={24}
                      color={effect === e.id ? Colors.accent : Colors.smoke}
                    />
                    <Text
                      style={[
                        styles.effectLabel,
                        effect === e.id && { color: Colors.accent },
                      ]}
                    >
                      {e.label}
                    </Text>
                    <Text style={styles.effectDesc}>{e.desc}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Custom pattern editor */}
              {effect === "custom" && (
                <View style={styles.customEditor}>
                  <Text style={styles.tapInstruction}>
                    Hold = flash on · Release = flash off
                  </Text>

                  {/* Tap pad */}
                  <Pressable
                    style={[styles.tapPad, tapping && styles.tapPadActive]}
                    onPressIn={handleTapIn}
                    onPressOut={handleTapOut}
                  >
                    <Ionicons
                      name="flash"
                      size={44}
                      color={tapping ? "#000" : Colors.accent}
                    />
                    <Text
                      style={[styles.tapPadLabel, tapping && { color: "#000" }]}
                    >
                      {tapCount === 0
                        ? "TAP & HOLD"
                        : tapCount < 2
                          ? "KEEP GOING..."
                          : "RECORDING"}
                    </Text>
                    {tapCount >= 2 && (
                      <Text
                        style={[styles.tapPadSub, tapping && { color: "#000" }]}
                      >
                        {tapCount} taps
                      </Text>
                    )}
                  </Pressable>

                  {/* Recorded values */}
                  {tapCount >= 2 && (
                    <View style={styles.tapResult}>
                      <View style={styles.tapResultChip}>
                        <Ionicons
                          name="flash"
                          size={12}
                          color={Colors.accent}
                        />
                        <Text style={styles.tapResultLabel}>ON</Text>
                        <Text style={styles.tapResultValue}>
                          {customOnMs}ms
                        </Text>
                      </View>
                      <View style={styles.tapResultDivider} />
                      <View style={styles.tapResultChip}>
                        <Ionicons name="moon" size={12} color={Colors.smoke} />
                        <Text style={styles.tapResultLabel}>OFF</Text>
                        <Text style={styles.tapResultValue}>
                          {customOffMs}ms
                        </Text>
                      </View>
                      <Pressable onPress={resetTaps} style={styles.tapResetBtn}>
                        <Ionicons
                          name="refresh"
                          size={14}
                          color={Colors.smoke}
                        />
                      </Pressable>
                    </View>
                  )}

                  {/* Fine-tune steppers */}
                  {tapCount >= 2 && (
                    <View style={styles.fineTune}>
                      <View style={styles.fineTuneRow}>
                        <Text style={styles.fineTuneLabel}>ON</Text>
                        <Pressable
                          style={styles.stepBtn}
                          onPress={() => changeCustomOnMs(customOnMs - 5)}
                        >
                          <Ionicons
                            name="remove"
                            size={16}
                            color={Colors.platinum}
                          />
                        </Pressable>
                        <Text style={styles.stepValue}>{customOnMs}ms</Text>
                        <Pressable
                          style={styles.stepBtn}
                          onPress={() => changeCustomOnMs(customOnMs + 5)}
                        >
                          <Ionicons
                            name="add"
                            size={16}
                            color={Colors.platinum}
                          />
                        </Pressable>
                      </View>
                      <View style={styles.fineTuneRow}>
                        <Text style={styles.fineTuneLabel}>OFF</Text>
                        <Pressable
                          style={styles.stepBtn}
                          onPress={() => changeCustomOffMs(customOffMs - 5)}
                        >
                          <Ionicons
                            name="remove"
                            size={16}
                            color={Colors.platinum}
                          />
                        </Pressable>
                        <Text style={styles.stepValue}>{customOffMs}ms</Text>
                        <Pressable
                          style={styles.stepBtn}
                          onPress={() => changeCustomOffMs(customOffMs + 5)}
                        >
                          <Ionicons
                            name="add"
                            size={16}
                            color={Colors.platinum}
                          />
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Live override pad — shown only while strobe is running */}
      {isRunning && (
        <View style={styles.overridePadWrap}>
          <Pressable
            style={[styles.overridePad, overriding && styles.overridePadActive]}
            onPressIn={handleOverrideIn}
            onPressOut={handleOverrideOut}
          >
            <Ionicons
              name="flash"
              size={32}
              color={overriding ? "#000" : Colors.accent}
            />
            <Text
              style={[styles.overridePadLabel, overriding && { color: "#000" }]}
            >
              {overriding ? "HOLDING..." : "HOLD TO FLASH"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Start / Stop button */}
      {approvedApprovals.length > 0 && (
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.mainBtn,
              isRunning ? styles.mainBtnStop : styles.mainBtnStart,
            ]}
            onPress={isRunning ? stopStrobe : startStrobe}
          >
            <Ionicons
              name={isRunning ? "stop" : "flash"}
              size={28}
              color="#000"
            />
            <Text style={styles.mainBtnText}>
              {isRunning ? "STOP STROBE" : "START STROBE"}
            </Text>
          </Pressable>
        </View>
      )}
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(57,243,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.3)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.platinum,
    letterSpacing: 3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(57,243,255,0.07)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.2)",
  },
  pendingText: {
    flex: 1,
    fontSize: 12,
    color: Colors.smoke,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.platinum,
    letterSpacing: 1,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.smoke,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  requestApprovalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 8,
  },
  requestApprovalBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 1.5,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.smoke,
    letterSpacing: 2,
    marginBottom: 12,
  },
  clubCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  clubCardActive: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(57,243,255,0.05)",
  },
  clubCardDisabled: {
    opacity: 0.5,
  },
  clubCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  clubCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clubDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.smoke,
  },
  clubName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.platinum,
  },
  clubExpiry: {
    fontSize: 11,
    color: Colors.smoke,
  },
  effectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  effectCard: {
    width: "30%",
    flexGrow: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  effectCardActive: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(57,243,255,0.08)",
  },
  effectLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.smoke,
    letterSpacing: 1,
    textAlign: "center",
  },
  effectDesc: {
    fontSize: 9,
    color: Colors.smoke,
    opacity: 0.6,
    textAlign: "center",
  },
  customEditor: {
    marginTop: 16,
    backgroundColor: "rgba(57,243,255,0.05)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.2)",
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.smoke,
    letterSpacing: 1.5,
  },
  customStepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  stepValue: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.accent,
    minWidth: 60,
    textAlign: "center",
  },
  customPresets: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  customPresetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  customPresetBtnActive: {
    borderColor: Colors.accent,
  },
  customPresetText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.smoke,
  },
  overridePadWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  overridePad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(57,243,255,0.08)",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(57,243,255,0.4)",
    paddingVertical: 20,
  },
  overridePadActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  overridePadLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.accent,
    letterSpacing: 2,
  },
  tapInstruction: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.smoke,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  tapPad: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(57,243,255,0.3)",
    paddingVertical: 28,
    gap: 8,
  },
  tapPadActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  tapPadLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.accent,
    letterSpacing: 2,
  },
  tapPadSub: {
    fontSize: 11,
    color: Colors.smoke,
    letterSpacing: 1,
  },
  tapResult: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 14,
  },
  tapResultChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tapResultLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.smoke,
    letterSpacing: 1,
  },
  tapResultValue: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.platinum,
  },
  tapResultDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tapResetBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  fineTune: {
    marginTop: 14,
    gap: 8,
  },
  fineTuneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  fineTuneLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.smoke,
    letterSpacing: 1.5,
    width: 28,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: Colors.bg,
  },
  mainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 18,
    gap: 10,
  },
  mainBtnStart: {
    backgroundColor: Colors.accent,
  },
  mainBtnStop: {
    backgroundColor: "#FF4444",
  },
  mainBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 2,
  },
});
