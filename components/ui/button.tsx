import React, { useMemo } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

interface ButtonProps extends TouchableOpacityProps {
  variant?:
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  size = "default",
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const variantStyles = useMemo(() => createVariantStyles(colors), [colors]);
  const textVariantStyles = useMemo(
    () => createTextVariantStyles(colors),
    [colors]
  );
  const buttonStyle = [
    styles.base,
    variantStyles[variant],
    sizeStyles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    textVariantStyles[variant],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity style={buttonStyle} disabled={disabled} {...props}>
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
  },
  text: {
    fontSize: Platform.OS === 'android' ? fontSize.base : fontSize.sm, // Larger text on Android
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

const sizeStyles: Record<string, ViewStyle> = {
  default: {
    height: Platform.OS === 'android' ? 44 : 40, // Taller on Android
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sm: {
    height: Platform.OS === 'android' ? 40 : 36,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  lg: {
    height: Platform.OS === 'android' ? 50 : 44, // Taller on Android for better touch target
    paddingHorizontal: spacing.xl,
    paddingVertical: Platform.OS === 'android' ? 12 : 10,
  },
};

function createVariantStyles(colors: ThemeColors): Record<string, ViewStyle> {
  return {
    default: {
      backgroundColor: colors.primary.DEFAULT,
    },
    destructive: {
      backgroundColor: colors.destructive.DEFAULT,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: colors.primary.DEFAULT,
    },
    secondary: {
      backgroundColor: colors.accent.DEFAULT,
    },
    ghost: {
      backgroundColor: "transparent",
    },
    link: {
      backgroundColor: "transparent",
    },
  };
}

function createTextVariantStyles(
  colors: ThemeColors
): Record<string, TextStyle> {
  return {
    default: {
      color: colors.primary.foreground,
      fontWeight: fontWeight.semibold,
    },
    destructive: {
      color: colors.destructive.foreground,
      fontWeight: fontWeight.semibold,
    },
    outline: {
      color: colors.primary.DEFAULT,
      fontWeight: fontWeight.semibold,
    },
    secondary: {
      color: colors.accent.foreground,
      fontWeight: fontWeight.bold,
    },
    ghost: {
      color: colors.foreground,
      fontWeight: fontWeight.medium,
    },
    link: {
      color: colors.primary.DEFAULT,
      fontWeight: fontWeight.medium,
      textDecorationLine: "underline",
    },
  };
}