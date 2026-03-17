import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@presentation/hooks/use-color-scheme";
import { usePreventScreenCapture } from "expo-screen-capture";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  usePreventScreenCapture();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false, // Global setting: hide ALL headers by default
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="unlock" options={{ headerShown: false }} />
          <Stack.Screen name="pin-setup" options={{ headerShown: false }} />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              gestureEnabled: false, // Disable swipe back
            }}
          />
          <Stack.Screen
            name="home"
            options={{
              headerShown: false,
              gestureEnabled: false, // Disable swipe back
            }}
          />
          <Stack.Screen name="emergency" options={{ headerShown: false }} />
          <Stack.Screen
            name="emergency-setup"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="add-credit-card"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="document-details"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="add-document" options={{ headerShown: false }} />
          <Stack.Screen
            name="select-documents"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
          <Stack.Screen name="change-pin" options={{ headerShown: false }} />
          <Stack.Screen
            name="guest-mode"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
