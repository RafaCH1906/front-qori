import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { spacing, borderRadius, ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

import { useAuth } from "@/context/AuthProvider";
import { useBalance } from "@/context/balance-context";
import { useRouter } from "expo-router";
import { getDeviceType } from "@/lib/platform-utils";

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function Header({ onLoginClick, onRegisterClick }: HeaderProps) {
  const { colors, toggleTheme, theme } = useTheme();
  const { user } = useAuth();
  const { balance, loading, freeBetsCount } = useBalance();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const deviceType = getDeviceType(width);

  const styles = useMemo(() => createStyles(colors, deviceType), [colors, deviceType]);

  // Debug logging
  console.log('[Header] Render - User:', user?.username, 'Balance:', balance, 'Loading:', loading, 'FreeBets:', freeBetsCount);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo (Left Side) */}
        <TouchableOpacity onPress={() => router.push("/")} style={styles.logoContainer}>
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
              size={deviceType === 'mobile' ? 20 : 22}
              color={colors.primary.DEFAULT}
            />
          </TouchableOpacity>

          {user ? (
            <>
              <View style={styles.balanceContainer}>
                <Ionicons name="wallet-outline" size={deviceType === 'mobile' ? 16 : 18} color={colors.primary.DEFAULT} />
                <Text style={styles.balanceText}>
                  {loading ? '...' : `S/ ${(balance || 0).toFixed(2)}`}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push("/profile")}
              >
                {user.profilePhotoUrl ? (
                  <Image 
                    source={{ uri: user.profilePhotoUrl }} 
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={deviceType === 'mobile' ? 18 : 20} color={colors.primary.foreground} />
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Button variant="outline" size={deviceType === 'mobile' ? "sm" : "default"} onPress={onLoginClick}>
                Acceder
              </Button>

              <Button size={deviceType === 'mobile' ? "sm" : "default"} onPress={onRegisterClick}>
                Regístrate
              </Button>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors, deviceType: 'mobile' | 'tablet' | 'desktop') =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card.DEFAULT,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: deviceType === 'mobile'
        ? (Platform.OS === 'android' ? spacing.md : spacing.lg)
        : spacing.xl,
      paddingVertical: deviceType === 'mobile' ? spacing.sm : spacing.md,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between", // Logo Left, Actions Right
      maxWidth: 1400,
      alignSelf: 'center',
      width: '100%',
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    logoIcon: {
      width: 1024, // Smaller logo
      height: 1024,
    },
    logoText: {
      width: deviceType === 'mobile' ? 96 : 120,
      height: deviceType === 'mobile' ? 40 : 50,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: deviceType === 'mobile' ? spacing.xs : spacing.md,
    },
    balanceContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      backgroundColor: colors.muted.DEFAULT,
      paddingHorizontal: deviceType === 'mobile' ? spacing.sm : spacing.md,
      paddingVertical: deviceType === 'mobile' ? spacing.xs : spacing.sm,
      borderRadius: borderRadius.md,
      marginRight: deviceType === 'mobile' ? spacing.xs : spacing.sm,
    },
    balanceText: {
      fontSize: deviceType === 'mobile' ? 12 : 14,
      fontWeight: "600",
      color: colors.foreground,
    },
    themeButton: {
      padding: spacing.sm,
    },
    profileButton: {
      width: deviceType === 'mobile' ? 36 : 40,
      height: deviceType === 'mobile' ? 36 : 40,
      borderRadius: deviceType === 'mobile' ? 18 : 20,
      backgroundColor: colors.primary.DEFAULT,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
  });
