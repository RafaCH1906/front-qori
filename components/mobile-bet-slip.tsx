import React, { useState } from "react";
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

export default function MobileBetSlip({
  bets,
  onRemoveBet,
  onPlaceBet,
}: MobileBetSlipProps) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Collapsed Header - Always Visible */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="receipt-outline" size={20} color={colors.primary.foreground} />
          <Text style={styles.headerText}>My Bets</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{bets.length} selected</Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-down" : "chevron-up"}
            size={24}
            color={colors.primary.foreground}
          />
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.content}>
          <BetSlip
            bets={bets}
            onRemoveBet={onRemoveBet}
            onPlaceBet={onPlaceBet}
            showHeader={false}
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      maxHeight: "80%",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.primary.DEFAULT,
      padding: spacing.md,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    headerText: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.bold,
      color: colors.primary.foreground,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    badge: {
      backgroundColor: colors.primary.foreground,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.full,
    },
    badgeText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: colors.primary.DEFAULT,
    },
    content: {
      maxHeight: "90%",
    },
  });
