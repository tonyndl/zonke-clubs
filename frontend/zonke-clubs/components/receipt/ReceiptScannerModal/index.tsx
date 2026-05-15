import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/ui";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { styles } from "./styles";

type Props = {
  visible: boolean;
  onClose: () => void;
  onScanComplete: (amount: number) => void;
};

export function ReceiptScannerModal({
  visible,
  onClose,
  onScanComplete,
}: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  React.useEffect(() => {
    if (visible && !hasScanned) {
      startScanAnimation();
    }
  }, [visible, hasScanned]);

  // Launch camera when modal opens
  React.useEffect(() => {
    if (visible && !capturedImage) {
      launchCamera();
    }
  }, [visible]);

  const launchCamera = () => {
    ImagePicker.requestCameraPermissionsAsync()
      .then((permission) => {
        if (!permission.granted) {
          onClose();
          return null;
        }
        return ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.8,
          allowsEditing: false,
        });
      })
      .then((result) => {
        if (!result) return;
        if (!result.canceled && result.assets[0]) {
          setCapturedImage(result.assets[0].uri);
          handleCapture();
        } else {
          onClose();
        }
      })
      .catch(() => {
        onClose();
      });
  };

  const handleCapture = () => {
    setIsProcessing(true);

    // Simulate OCR processing
    setTimeout(() => {
      // Mock scanned amount - in real implementation this would come from OCR
      const mockAmount = Math.floor(Math.random() * 500) + 50;
      setIsProcessing(false);
      setHasScanned(true);

      setTimeout(() => {
        onScanComplete(mockAmount);
        // Reset state
        setHasScanned(false);
        setCapturedImage(null);
      }, 500);
    }, 2000);
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Instructions */}
        {!isProcessing && !hasScanned && (
          <View style={styles.instructions}>
            <View style={styles.instructionsBlur}>
              <Ionicons
                name="information-circle"
                size={20}
                color={Colors.gold}
              />
              <Text style={styles.instructionsText}>
                Align receipt within the frame
              </Text>
            </View>
          </View>
        )}

        {/* Preview View */}
        <View style={styles.cameraView}>
          {capturedImage ? (
            <Image
              source={{ uri: capturedImage }}
              style={styles.camera}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.camera}>
              <ActivityIndicator size="large" color={Colors.gold} />
              <Text style={styles.loadingText}>Opening Camera...</Text>
            </View>
          )}

          <View style={styles.cameraOverlay}>
            {/* Scan frame */}
            {capturedImage && (
              <View style={styles.scanFrame}>
                {/* Corner decorations */}
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />

                {/* Animated scan line */}
                {!hasScanned && (
                  <Animated.View
                    style={[
                      styles.scanLine,
                      {
                        transform: [{ translateY: scanLineTranslateY }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        "transparent",
                        "rgba(57, 243, 255, 0.8)",
                        "transparent",
                      ]}
                      style={styles.scanLineGradient}
                    />
                  </Animated.View>
                )}
              </View>
            )}

            {/* Processing overlay */}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <BlurView intensity={30} style={styles.processingBlur}>
                  <View style={styles.processingContent}>
                    <ActivityIndicator size="large" color={Colors.gold} />
                    <Text style={styles.processingTitle}>Scanning Receipt</Text>
                    <Text style={styles.processingSubtitle}>
                      Extracting total amount...
                    </Text>
                  </View>
                </BlurView>
              </View>
            )}

            {/* Success indicator */}
            {hasScanned && !isProcessing && (
              <View style={styles.successOverlay}>
                <View style={styles.successIcon}>
                  <LinearGradient
                    colors={["#10B981", "#34D399"]}
                    style={styles.successIconGradient}
                  >
                    <Ionicons name="checkmark" size={48} color="white" />
                  </LinearGradient>
                </View>
                <Text style={styles.successText}>Receipt Captured!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tips}>
          <View style={styles.tip}>
            <View style={styles.tipIcon}>
              <Ionicons name="sunny-outline" size={16} color={Colors.gold} />
            </View>
            <Text style={styles.tipText}>Good lighting helps</Text>
          </View>
          <View style={styles.tip}>
            <View style={styles.tipIcon}>
              <Ionicons name="expand-outline" size={16} color={Colors.gold} />
            </View>
            <Text style={styles.tipText}>Capture full receipt</Text>
          </View>
        </View>

        {/* Bottom controls */}
        <View style={styles.controls}>
          <LinearGradient
            colors={["transparent", "rgba(11, 15, 26, 0.95)"]}
            style={styles.controlsGradient}
          >
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isProcessing}
            >
              <View style={styles.controlButton}>
                <Ionicons name="close" size={24} color={Colors.platinum} />
              </View>
              <Text style={styles.controlLabel}>Cancel</Text>
            </TouchableOpacity>

            {/* Capture button */}
            <TouchableOpacity
              style={styles.captureButtonWrapper}
              onPress={handleCapture}
              disabled={isProcessing || hasScanned}
              activeOpacity={0.8}
            >
              <View style={styles.captureButtonOuter}>
                <LinearGradient
                  colors={[Colors.gold, Colors.goldLight]}
                  style={styles.captureButton}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color={Colors.bgCard} />
                  ) : (
                    <Ionicons name="scan" size={32} color={Colors.bgCard} />
                  )}
                </LinearGradient>
              </View>
            </TouchableOpacity>

            {/* Gallery button */}
            <TouchableOpacity
              style={styles.galleryButton}
              disabled={isProcessing}
            >
              <View style={styles.controlButton}>
                <Ionicons
                  name="images-outline"
                  size={24}
                  color={Colors.platinum}
                />
              </View>
              <Text style={styles.controlLabel}>Gallery</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}
