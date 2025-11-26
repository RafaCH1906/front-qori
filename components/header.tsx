import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { spacing, borderRadius, ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

import { useAuth } from "@/context/AuthProvider";
import { useBalance } from "@/context/balance-context";
import { useRouter } from "expo-router";

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function Header({ onLoginClick, onRegisterClick }: HeaderProps) {
  const { colors, toggleTheme, theme } = useTheme();
  const { user } = useAuth();
  const { balance, loading, freeBetsCount } = useBalance();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Debug logging
  console.log('[Header] Render - User:', user?.username, 'Balance:', balance, 'Loading:', loading, 'FreeBets:', freeBetsCount);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <TouchableOpacity onPress={() => router.push("/")} style={styles.logoContainer}>
          <Image
            source={require("@/assets/logotipo.png")}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Image
            source={require("@/assets/logo.png")}
            style={styles.logoText}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Right Side Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
            <Ionicons
              name={theme === "light" ? "moon" : "sunny"}
              size={20}
              color={colors.primary.DEFAULT}
            />
          </TouchableOpacity>

          {user ? (
            <>
              <View style={styles.balanceContainer}>
                <Ionicons name="wallet-outline" size={16} color={colors.primary.DEFAULT} />
                <Text style={styles.balanceText}>
                  {loading ? '...' : `S/ ${(balance || 0).toFixed(2)}`}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push("/profile")}
              >
                <Ionicons name="person" size={18} color={colors.primary.foreground} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onPress={onLoginClick}>
                Login
              </Button>

              <Button size="sm" onPress={onRegisterClick}>
                Register
              </Button>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card.DEFAULT,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: Platform.OS === 'android' ? spacing.md : spacing.lg,
      paddingVertical: spacing.sm, // Reduced vertical padding
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm, // Reduced gap
    },
    logoIcon: {
      width: 32, // Smaller logo
      height: 32,
    },
    logoText: {
      width: 120, // Smaller text logo
      height: 30,
      display: Platform.OS === 'android' ? 'none' : 'flex', // Hide text on Android/Mobile
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs, // Tighter gap
    },
    balanceContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      backgroundColor: colors.muted.DEFAULT,
      paddingHorizontal: spacing.sm, // Reduced padding
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      marginRight: spacing.xs,
    },
    balanceText: {
      fontSize: 12, // Smaller font
      fontWeight: "600",
      color: colors.foreground,
    },
    themeButton: {
      padding: spacing.sm,
    },
    profileButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary.DEFAULT,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
