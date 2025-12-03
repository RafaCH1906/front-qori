import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BetSlip from "./bet-slip";
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { Bet } from "@/context/betting-context";

interface MobileBetSlipProps {
  bets: Bet[];
  onRemoveBet: (id: number) => void;
  onPlaceBet: (stake: number, bets: Bet[], useFreeBet?: boolean) => Promise<void>;
}

const MOBILE_BET_SLIP_MAX_HEIGHT = 400;

export default function MobileBetSlip({
  bets,
  onRemoveBet,
  onPlaceBet,
}: MobileBetSlipProps) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = createStyles(colors);

  const sheetHeight = useRef(new Animated.Value(0)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(20)).current;
  const toggleTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isExpanded) {
      Animated.parallel([
        Animated.timing(sheetHeight, {
          toValue: MOBILE_BET_SLIP_MAX_HEIGHT,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toggleTranslateY, {
          toValue: -8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(sheetHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 20,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(toggleTranslateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isExpanded]);

  return (
    <Animated.View style={styles.container}>
      <Animated.View
        pointerEvents={isExpanded ? "auto" : "none"}
        style={[
          styles.sheetContainer,
          {
            height: sheetHeight,
            opacity: sheetOpacity,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        <View style={styles.sheetInner}>
          <BetSlip
            bets={bets}
            onRemoveBet={onRemoveBet}
            onPlaceBet={onPlaceBet}
            showHeader={false}
          />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.toggleWrapper,
          { transform: [{ translateY: toggleTranslateY }] },
        ]}
      >
        <TouchableOpacity
          style={styles.toggle}
          activeOpacity={0.85}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View>
            <Text style={styles.toggleLabel}>My Bets</Text>
            <Text style={styles.toggleCount}>
              {bets.length} selected
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-down" : "chevron-up"}
            size={20}
            color={colors.primary.foreground}
          />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
      paddingTop: spacing.md,
      gap: spacing.sm,
      alignItems: "stretch",
      zIndex: 100,
    },
    sheetContainer: {
      marginBottom: spacing.sm,
      padding: spacing.xs,
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      maxHeight: MOBILE_BET_SLIP_MAX_HEIGHT,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      elevation: 8,
      overflow: "visible",
    },
    sheetInner: {
      borderRadius: borderRadius.lg,
      overflow: "hidden",
      flex: 1,
      maxHeight: MOBILE_BET_SLIP_MAX_HEIGHT - spacing.xs * 2,
    },
    toggleWrapper: {
      width: "100%",
    },
    toggle: {
      backgroundColor: colors.primary.DEFAULT,
      borderRadius: 999,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: colors.primary.DEFAULT,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 6,
    },
    toggleLabel: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.primary.foreground,
    },
    toggleCount: {
      fontSize: fontSize.xs,
      color: colors.primary.foreground,
    },
  });
