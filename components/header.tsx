import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { spacing, borderRadius, ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

import { useAuth } from "@/app/contexts/AuthProvider";
import { useRouter } from "expo-router";

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function Header({ onLoginClick, onRegisterClick }: HeaderProps) {
  const { colors, toggleTheme, theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
            <Button size="sm" onPress={() => router.push("/profile")}>
              Profile
            </Button>
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
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    logoIcon: {
      width: 48,
      height: 48,
    },
    logoText: {
      width: 200,
      height: 60,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    themeButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.muted.DEFAULT,
    },
  });
