import { Redirect } from "expo-router";

export default function HomeScreen() {
  // Redirect to tabs to ensure bottom bar is always visible
  return <Redirect href="/(tabs)" />;
}
