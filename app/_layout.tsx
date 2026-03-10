import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@presentation/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="unlock" options={{ headerShown: false }} />
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
        <Stack.Screen name="emergency-setup" options={{ headerShown: false }} />
        <Stack.Screen name="add-credit-card" options={{ headerShown: false }} />
        <Stack.Screen name="document-details" options={{ headerShown: false }} />
        <Stack.Screen name="add-document" options={{ headerShown: false }} />
        <Stack.Screen name="select-documents" options={{ headerShown: false }} />
        <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
        <Stack.Screen name="change-pin" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
