import { Stack } from "expo-router";

export default function RewardsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="unlocked" />
      <Stack.Screen name="leveledUp" />
      <Stack.Screen name="completed" />
      <Stack.Screen name="reward" />
    </Stack>
  );
}
