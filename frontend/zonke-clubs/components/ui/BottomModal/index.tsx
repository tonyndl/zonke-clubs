import React, { ReactNode } from "react";
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  DimensionValue,
} from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { styles } from "./styles";

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: DimensionValue;
}

export function BottomModal({
  visible,
  onClose,
  children,
  maxHeight = "90%",
}: BottomModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={maxHeight ? { maxHeight } : undefined}>
                <Animated.View
                  entering={SlideInDown.springify().damping(15)}
                  exiting={SlideOutDown.duration(200)}
                  style={styles.sheet}
                >
                  {/* Handle */}
                  <View style={styles.handle} />

                  {/* Content */}
                  <View style={styles.content}>{children}</View>
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
