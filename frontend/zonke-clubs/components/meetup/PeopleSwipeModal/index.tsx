import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Image,
  Animated,
  PanResponder,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import {
  MeetupIntention,
  ACTIVITY_CONFIG,
  formatPlannedDate,
} from "@/types/meetup";
import { BlurView } from "expo-blur";
import { styles, SCREEN_WIDTH, SCREEN_HEIGHT, SWIPE_THRESHOLD } from "./styles";

interface Props {
  visible: boolean;
  intentions: MeetupIntention[];
  onClose: () => void;
  onConnect: (intention: MeetupIntention) => void;
}

export function PeopleSwipeModal({
  visible,
  intentions,
  onClose,
  onConnect,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const swipeDirection = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        swipeDirection.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swipe right - Like/Connect
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe left - Pass
          swipeLeft();
        } else {
          // Return to center
          resetPosition();
        }
      },
    }),
  ).current;

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      // Connect with current person
      if (currentIndex < intentions.length) {
        onConnect(intentions[currentIndex]);
      }
      nextCard();
    });
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      nextCard();
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5,
    }).start();
  };

  const nextCard = () => {
    position.setValue({ x: 0, y: 0 });
    swipeDirection.setValue(0);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleLike = () => {
    swipeRight();
  };

  const handlePass = () => {
    swipeLeft();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ["-10deg", "0deg", "10deg"],
      extrapolate: "clamp",
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  const getLikeOpacity = () => {
    return position.x.interpolate({
      inputRange: [0, SWIPE_THRESHOLD],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });
  };

  const getNopeOpacity = () => {
    return position.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });
  };

  const renderCard = (intention: MeetupIntention, index: number) => {
    if (index < currentIndex) return null;
    if (index > currentIndex + 1) return null;

    const isCurrentCard = index === currentIndex;
    const config = ACTIVITY_CONFIG[intention.activityType];

    return (
      <Animated.View
        key={intention.id}
        style={[
          styles.card,
          isCurrentCard && getCardStyle(),
          { zIndex: intentions.length - index },
        ]}
        {...(isCurrentCard ? panResponder.panHandlers : {})}
      >
        {/* Profile Image */}
        <Image
          source={{
            uri:
              intention.user.avatarUrl ||
              "https://via.placeholder.com/600x800/1a1a2e/ffffff?text=No+Photo",
            cache: "force-cache",
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]}
          style={styles.gradient}
        />

        {/* Like/Nope Stamps */}
        {isCurrentCard && (
          <>
            <Animated.View
              style={[
                styles.stamp,
                styles.likeStamp,
                { opacity: getLikeOpacity() },
              ]}
            >
              <Text style={styles.stampText}>CONNECT</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.stamp,
                styles.nopeStamp,
                { opacity: getNopeOpacity() },
              ]}
            >
              <Text style={styles.stampText}>PASS</Text>
            </Animated.View>
          </>
        )}

        {/* Card Info */}
        <View style={styles.cardInfo}>
          {/* Activity Badge */}
          <View style={styles.activityBadge}>
            <Text style={styles.activityEmoji}>{config.emoji}</Text>
            <Text style={styles.activityLabel}>{config.label}</Text>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{intention.user.username}</Text>
            {intention.user.age && (
              <Text style={styles.userAge}>, {intention.user.age}</Text>
            )}
          </View>

          {/* Date & Time */}
          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={16} color={Colors.gold} />
            <Text style={styles.dateText}>
              {formatPlannedDate(intention.plannedDate)}
            </Text>
            <Ionicons
              name="time"
              size={16}
              color={Colors.gold}
              style={{ marginLeft: 12 }}
            />
            <Text style={styles.dateText}>{intention.time}</Text>
          </View>

          {/* Message */}
          {intention.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>"{intention.message}"</Text>
            </View>
          )}

          {/* Bio */}
          {intention.user.bio && (
            <Text style={styles.bio} numberOfLines={3}>
              {intention.user.bio}
            </Text>
          )}
        </View>
      </Animated.View>
    );
  };

  const currentIntention = intentions[currentIndex];
  const hasMoreCards = currentIndex < intentions.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor={Colors.bg} barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <PressableScale onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-back" size={28} color={Colors.platinum} />
          </PressableScale>
          <Text style={styles.headerTitle}>People to Meet</Text>
          {/* <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {Math.min(currentIndex + 1, intentions.length)} / {intentions.length}
            </Text>
          </View> */}
        </View>

        {/* Cards Stack */}
        <View style={styles.cardContainer}>
          {hasMoreCards ? (
            <>
              {intentions.map((intention, index) =>
                renderCard(intention, index),
              )}
            </>
          ) : (
            <View style={styles.endCard}>
              <View style={styles.endIconContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={64}
                  color={Colors.gold}
                />
              </View>
              <Text style={styles.endTitle}>That's Everyone!</Text>
              <Text style={styles.endSubtitle}>
                You've seen all {intentions.length} people looking to meet
              </Text>
              <PressableScale style={styles.endButton} onPress={onClose}>
                <Text style={styles.endButtonText}>Done</Text>
              </PressableScale>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {hasMoreCards && (
          <View style={styles.actions}>
            <PressableScale
              style={[styles.actionButton, styles.passButton]}
              onPress={handlePass}
            >
              <Ionicons name="close" size={32} color="#FF6B6B" />
            </PressableScale>
            <PressableScale style={[styles.actionButton, styles.infoButton]}>
              <Ionicons
                name="information-circle"
                size={28}
                color={Colors.gold}
              />
            </PressableScale>
            <PressableScale
              style={[styles.actionButton, styles.likeButton]}
              onPress={handleLike}
            >
              <Ionicons name="heart" size={32} color="#4ECDC4" />
            </PressableScale>
          </View>
        )}
      </View>
    </Modal>
  );
}
