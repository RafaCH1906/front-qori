import React, { useMemo } from "react";
import { TextInput, StyleSheet, type TextInputProps } from "react-native";
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export function Input({ style, ...props }: TextInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={colors.muted.foreground}
      {...props}
    />
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    input: {
      height: 44,
      width: "100%",
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.input,
      backgroundColor: colors.card.DEFAULT,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: fontSize.sm,
      color: colors.foreground,
      fontWeight: fontWeight.medium,
    },
  });
}
