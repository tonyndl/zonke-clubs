import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { MeetupIntention, ACTIVITY_CONFIG } from "@/types/meetup";
import { styles } from "./styles";

interface Props {
  visible: boolean;
  intention: MeetupIntention | null;
  onClose: () => void;
  onSendRequest: (message?: string) => void;
}

export function ConnectSheet({
  visible,
  intention,
  onClose,
  onSendRequest,
}: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!intention) return null;

  const activity = ACTIVITY_CONFIG[intention.activityType];
  const displayName = intention.user.username;

  const handleSend = async () => {
    setSending(true);
    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSendRequest(message.trim() || undefined);
    setMessage("");
    setSending(false);
  };

  const handleClose = () => {
    onClose();
    setMessage("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardView}
            >
              <TouchableWithoutFeedback>
                <Animated.View
                  entering={SlideInDown.springify().damping(15)}
                  exiting={SlideOutDown.duration(200)}
                  style={styles.sheet}
                >
                  {/* Handle */}
                  <View style={styles.handle} />

                  {/* Header */}
                  <Text style={styles.title}>Connect with {displayName}</Text>

                  {/* Person Info */}
                  <View style={styles.personCard}>
                    <View
                      style={[styles.avatar, { borderColor: activity.color }]}
                    >
                      {intention.user.avatarUrl ? (
                        <View style={styles.avatarImage} />
                      ) : (
                        <Text style={styles.avatarInitial}>
                          {intention.user.username.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>

                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>{displayName}</Text>
                      <View style={styles.activityRow}>
                        <Text style={styles.emoji}>{activity.emoji}</Text>
                        <Text style={styles.activityText}>
                          {activity.label}
                        </Text>
                      </View>
                      {intention.message && (
                        <Text style={styles.intentionMessage}>
                          &ldquo;{intention.message}&rdquo;
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Message Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      Write a quick intro (optional)
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Hey! I saw you're looking for..."
                      placeholderTextColor={Colors.smoke}
                      value={message}
                      onChangeText={setMessage}
                      multiline
                      maxLength={200}
                    />
                    <Text style={styles.charCount}>{message.length}/200</Text>
                  </View>

                  {/* Info Note */}
                  <View style={styles.infoNote}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={Colors.smoke}
                    />
                    <Text style={styles.infoText}>
                      {displayName} will need to accept your request before you
                      can chat.
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actions}>
                    <PressableScale
                      style={styles.cancelButton}
                      onPress={handleClose}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </PressableScale>

                    <PressableScale
                      style={styles.sendButton}
                      onPress={handleSend}
                      disabled={sending}
                    >
                      {sending ? (
                        <Text style={styles.sendText}>Sending...</Text>
                      ) : (
                        <>
                          <Ionicons
                            name="paper-plane"
                            size={18}
                            color={Colors.bg}
                          />
                          <Text style={styles.sendText}>Send Request</Text>
                        </>
                      )}
                    </PressableScale>
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
