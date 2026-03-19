import { Stack } from "expo-router";

export default function StrobeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dj" />
      <Stack.Screen name="join" />
      <Stack.Screen name="request-approval" />
    </Stack>
  );
}
