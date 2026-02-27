import React, { ReactNode, useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StatusBar,
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/ui";

import { styles } from "./styles";
import { BarLine } from "./bar";

type ModalProps = {
  children?: ReactNode;
  onDismiss?: () => void;
  bgColor?: string;
  sliding?: boolean;
  disableKeyboardAvoid?: boolean;
};

export const Modal = (props: ModalProps) => {
  const {
    children,
    onDismiss,
    bgColor,
    sliding = false,
    disableKeyboardAvoid = false,
  } = props;

  const insets = useSafeAreaInsets();
  const pan = useRef(new Animated.ValueXY()).current;

  const dismissWithAnimation = () => {
    Animated.timing(pan, {
      toValue: { x: 0, y: 800 },
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  // PanResponder for drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },

      onPanResponderMove: (_, gestureState) => {
        pan.setValue({ x: 0, y: gestureState.dy });
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 80) {
          dismissWithAnimation();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const screenHeight = Dimensions.get("window").height;

  return (
    <BlurView intensity={1000} tint="dark" style={[styles.container]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgSecondary} />

      <Pressable style={styles.backdrop} onPress={dismissWithAnimation} />

      <KeyboardAvoidingView
        behavior={
          disableKeyboardAvoid
            ? undefined
            : Platform.OS === "ios"
              ? "padding"
              : "height"
        }
        style={[
          styles.keyboardView,
          {
            justifyContent: sliding ? "flex-end" : "center",
            paddingTop: disableKeyboardAvoid ? 0 : insets.top + 10,
          },
        ]}
        keyboardVerticalOffset={0}
      >
        {sliding ? (
          <Animated.View
            style={[
              styles.modalWrapper,

              { transform: [{ translateY: pan.y }] },
              {
                maxHeight: screenHeight * 0.9 - insets.top,
                backgroundColor: bgColor || Colors.bg,
              },
            ]}
          >
            {/* draggable area */}
            <View style={{ height: 20 }} {...panResponder.panHandlers}>
              <BarLine />
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </Animated.View>
        ) : (
          <View
            style={[
              styles.centerModal,
              {
                backgroundColor: bgColor || Colors.bgCard,
                maxHeight: screenHeight * 0.8 - insets.top,
              },
            ]}
          >
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </BlurView>
  );
};
