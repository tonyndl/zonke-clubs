import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { api } from "@/services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";

// QR codes encode: "zonkeclubs://checkin/{token}" (matches app.json scheme: "zonkeclubs")
const QR_SCHEME = "zonkeclubs://checkin/";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || validating) return;

    const token = data.startsWith(QR_SCHEME)
      ? data.slice(QR_SCHEME.length).trim()
      : null;

    if (!token) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Invalid Code",
        "This QR code is not a Zonke wristband code.",
        [{ text: "Try Again", onPress: () => setScanned(false) }],
      );
      setScanned(true);
      return;
    }

    setScanned(true);
    setValidating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    api
      .get<{ valid: boolean; qr_code: any; club: any }>(`/qr/${token}`, false)
      .then(({ club }) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace(`/club/${club.id}/checkin` as any);
      })
      .catch((err) => {
        const expired =
          err.message?.toLowerCase().includes("expired") ||
          err.message?.includes("410");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        if (expired) {
          Alert.alert(
            "QR Code Expired",
            "This wristband QR code has expired. Please ask the club for a valid one.",
            [{ text: "OK", onPress: () => router.back() }],
          );
        } else {
          Alert.alert("Invalid Code", "This QR code is not valid.", [
            {
              text: "Try Again",
              onPress: () => {
                setScanned(false);
                setValidating(false);
              },
            },
          ]);
        }
      })
      .finally(() => setValidating(false));
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ActivityIndicator color={Colors.gold} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={Colors.smoke} />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionSub}>
            We need camera access to scan the QR code on your wristband.
          </Text>
          <PressableScale style={styles.grantBtn} onPress={requestPermission}>
            <Text style={styles.grantBtnText}>Grant Access</Text>
          </PressableScale>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 16 }}
          >
            <Text style={{ color: Colors.smoke, fontSize: 14 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top bar */}
        <SafeAreaView edges={["top"]} style={styles.topBar}>
          <PressableScale onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.white} />
          </PressableScale>
          <Text style={styles.scanTitle}>Scan Wristband</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>

        {/* Viewfinder */}
        <View style={styles.viewfinderWrapper}>
          <View style={styles.viewfinder}>
            {/* Corner decorations */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>

        {validating && (
          <ActivityIndicator
            color={Colors.primaryBlue}
            size="small"
            style={{ marginBottom: 8 }}
          />
        )}
        <Text style={styles.hint}>
          {validating
            ? "Validating code..."
            : scanned
              ? "✓  QR code detected..."
              : "Point your camera at the QR code on the wristband"}
        </Text>
      </View>
    </View>
  );
}

const CORNER = 24;
const FRAME = 240;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
    backgroundColor: Colors.bg,
  },
  permissionTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  permissionSub: {
    color: Colors.smoke,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  grantBtn: {
    marginTop: 8,
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  grantBtnText: { color: Colors.bg, fontSize: 16, fontWeight: "700" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  viewfinderWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  viewfinder: {
    width: FRAME,
    height: FRAME,
    borderRadius: 4,
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: Colors.primaryBlue,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  hint: {
    color: Colors.white,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
    lineHeight: 20,
  },
});
