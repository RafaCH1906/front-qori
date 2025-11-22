import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BettingProvider } from "@/context/betting-context";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/AuthProvider";
import { ToastProvider } from "@/context/toast-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BettingProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen
                name="match/[matchId]"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
            </Stack>
          </BettingProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
