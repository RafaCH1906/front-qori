import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BettingProvider } from "@/context/betting-context";
import { ThemeProvider } from "@/context/theme-context";

export default function RootLayout() {
  return (
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
        </Stack>
      </BettingProvider>
    </ThemeProvider>
  );
}
