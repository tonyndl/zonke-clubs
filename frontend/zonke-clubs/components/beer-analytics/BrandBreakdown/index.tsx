import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { formatLitres } from "@/types/beerAnalytics";
import { styles } from "./styles";

interface Props {
  brands: Record<string, number>;
  brandsLitres?: Record<string, number>;
  isOwnProfile: boolean;
}

export function BrandBreakdown({ brands, brandsLitres, isOwnProfile }: Props) {
  const brandEntries = Object.entries(brands)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5 brands

  if (brandEntries.length === 0) {
    return null;
  }

  const maxCount = brandEntries[0][1];

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <Ionicons name="bar-chart" size={24} color={Colors.gold} />
        <Text style={styles.title}>{isOwnProfile && "Your "}Top Brands</Text>
      </Animated.View>

      <View style={styles.chartContainer}>
        {brandEntries.map(([brand, count], index) => {
          const percentage = (count / maxCount) * 100;
          const litres = brandsLitres?.[brand];

          return (
            <Animated.View
              key={brand}
              entering={FadeInDown.delay(50 * index).springify()}
              style={styles.brandRow}
            >
              <View style={styles.brandInfo}>
                <Text style={styles.brandName} numberOfLines={1}>
                  {brand}
                </Text>
                {litres && (
                  <Text style={styles.brandLitres}>{formatLitres(litres)}</Text>
                )}
              </View>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: Colors.gold,
                    },
                  ]}
                />
              </View>
              <Text style={styles.brandCount}>{count}</Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
