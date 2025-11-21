import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BettingProvider } from "@/context/betting-context";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/app/contexts/AuthProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
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
      </ThemeProvider>
    </AuthProvider>
  );
}
