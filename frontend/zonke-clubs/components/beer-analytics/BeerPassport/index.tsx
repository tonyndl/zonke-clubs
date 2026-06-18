import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { BeerDetection } from "@/types/beerAnalytics";
import { styles } from "./styles";

interface Props {
  recentBeers: BeerDetection[];
}

// Simple date formatter
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function BeerPassport({ recentBeers }: Props) {
  if (recentBeers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <Ionicons name="book" size={24} color={Colors.gold} />
        <Text style={styles.title}>Beer Passport</Text>
      </Animated.View>

      <View style={styles.list}>
        {recentBeers.map((beer, index) => (
          <Animated.View
            key={beer.id}
            entering={FadeInDown.delay(30 * index).springify()}
            style={[
              styles.beerItem,
              index === recentBeers.length - 1 && styles.beerItemLast,
            ]}
          >
            <View style={styles.beerIconContainer}>
              <Ionicons name="beer" size={24} color={Colors.gold} />
            </View>
            <View style={styles.beerInfo}>
              <Text style={styles.beerBrand}>
                {beer.brand || "Unknown Brand"}
              </Text>
              <Text style={styles.beerType}>
                {beer.beer_type} • {beer.serving_format}
              </Text>
            </View>
            <Text style={styles.beerDate}>{formatDate(beer.detected_at)}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
