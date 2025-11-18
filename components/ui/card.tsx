import React, { useMemo } from "react";
import { View, StyleSheet, type ViewProps } from "react-native";
import { borderRadius, spacing, ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export function Card({ style, ...props }: ViewProps) {
  const styles = useCardStyles();
  return <View style={[styles.card, style]} {...props} />;
}

export function CardHeader({ style, ...props }: ViewProps) {
  const styles = useCardStyles();
  return <View style={[styles.header, style]} {...props} />;
}

export function CardTitle({
  style,
  children,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

export function CardDescription({
  style,
  children,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ style, ...props }: ViewProps) {
  return <View style={style} {...props} />;
}

export function CardFooter({ style, ...props }: ViewProps) {
  const styles = useCardStyles();
  return <View style={[styles.footer, style]} {...props} />;
}
function useCardStyles() {
  const { colors } = useTheme();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card.DEFAULT,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: colors.background === "#0f0f1e" ? 0.35 : 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    header: {
      marginBottom: spacing.lg,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.lg,
    },
  });
}
