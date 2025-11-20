import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  ThemeColors,
} from "@/constants/theme";
import { Bet } from "@/context/betting-context";
import { useTheme } from "@/context/theme-context";

interface BetSlipProps {
  bets: Bet[];
  onRemoveBet: (id: number) => void;
  showHeader?: boolean;
}

export default function BetSlip({
  bets,
  onRemoveBet,
  showHeader = true,
}: BetSlipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [stake, setStake] = useState<string>("10");

  const handleQuickAmount = (amount: number) => {
    const currentStake = parseFloat(stake) || 0;
    setStake((currentStake + amount).toString());
  };

  const totalOdds =
    bets.length > 0 ? bets.reduce((acc, bet) => acc * bet.odds, 1) : 0;
  const potentialWinnings = parseFloat(stake) * totalOdds;

  const getTypeLabel = (bet: Bet) => {
    if (bet.label) return bet.label;

    switch (bet.type) {
      case "home":
        return "1 (Home Win)";
      case "draw":
        return "X (Draw)";
      case "away":
        return "2 (Away Win)";
      default:
        return bet.type;
    }
  };

  const getCategoryBadgeStyle = (betType: string) =>
    getBadgeStyles(betType, colors);

  const getCategoryLabel = (betType: string) => {
    switch (betType) {
      case "result":
        return "Match Result";
      case "goals":
        return "Goals";
      case "cards":
        return "Cards";
      case "corners":
        return "Corners";
      case "shots":
        return "Shots";
      default:
        return betType;
    }
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerText}>My Bets</Text>
        </View>
      )}

      {bets.length === 0 ? (
        <Card style={styles.card}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No bets selected yet</Text>
            <Text style={styles.emptySubText}>
              Select odds from matches to add bets
            </Text>
          </View>
        </Card>
      ) : (
        <Card style={styles.card}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.betsContainer}>
              {bets.map((bet) => (
                <View key={bet.id} style={styles.betItem}>
                  <View style={styles.betContent}>
                    <View
                      style={[
                        styles.categoryBadge,
                        getCategoryBadgeStyle(bet.betType),
                      ]}
                    >
                      <Text style={styles.categoryText}>
                        {getCategoryLabel(bet.betType)}
                      </Text>
                    </View>
                    <Text style={styles.matchText} numberOfLines={1}>
                      {bet.match}
                    </Text>
                    <Text style={styles.betDetailsText}>
                      {getTypeLabel(bet)} @ {bet.odds.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => onRemoveBet(bet.id)}>
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={colors.destructive.DEFAULT}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.stakeContainer}>
              <View style={styles.stakeSection}>
                <Text style={styles.sectionLabel}>Stake (Soles)</Text>
                <Input
                  value={stake}
                  onChangeText={setStake}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                />

                <View style={styles.quickAmountsContainer}>
                  {[5, 20, 50, 100].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      onPress={() => handleQuickAmount(amount)}
                      style={styles.quickAmountButton}
                    >
                      <Text style={styles.quickAmountText}>+{amount}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Odds:</Text>
                  <Text style={styles.summaryValue}>{totalOdds.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Stake:</Text>
                  <Text style={styles.summaryValueNormal}>
                    S/ {parseFloat(stake || "0").toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRowFinal}>
                  <Text style={styles.summaryFinalLabel}>Potential Win:</Text>
                  <Text style={styles.summaryFinalValue}>
                    S/ {potentialWinnings.toFixed(2)}
                  </Text>
                </View>
              </View>

              <Button
                variant="secondary"
                size="lg"
                onPress={() => {}}
                disabled={bets.length === 0 || parseFloat(stake) <= 0}
              >
                Place Bet
              </Button>
            </View>
          </ScrollView>
        </Card>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
      maxHeight: "100%",
    },
    card: {
      flex: 1,
      width: "100%",
      backgroundColor: colors.card.DEFAULT,
      borderRadius: borderRadius.lg,
      maxHeight: "100%",
    },
    header: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.primary.DEFAULT,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      marginBottom: spacing.sm,
    },
    headerText: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.primary.foreground,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    emptyText: {
      color: colors.muted.foreground,
      fontSize: fontSize.sm,
      textAlign: "center",
    },
    emptySubText: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
      marginTop: spacing.sm,
      textAlign: "center",
    },
    scrollView: {
      flex: 1,
      maxHeight: "100%",
    },
    scrollContent: {
      paddingBottom: spacing.lg,
      flexGrow: 1,
    },
    betsContainer: {
      padding: spacing.lg,
      gap: spacing.sm,
    },
    betItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      backgroundColor: colors.card.DEFAULT,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    betContent: {
      flex: 1,
    },
    categoryBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.md,
      alignSelf: "flex-start",
      marginBottom: 4,
      borderWidth: 1,
    },
    categoryText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    matchText: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
    },
    betDetailsText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: colors.foreground,
      marginTop: 4,
    },
    stakeContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
      backgroundColor: colors.card.DEFAULT,
    },
    stakeSection: {
      gap: spacing.sm,
    },
    sectionLabel: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    quickAmountsContainer: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    quickAmountButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    quickAmountText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.accent.DEFAULT,
    },
    summaryCard: {
      backgroundColor: colors.card.DEFAULT,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
    },
    summaryValue: {
      fontWeight: fontWeight.bold,
      color: colors.foreground,
      fontSize: fontSize.base,
    },
    summaryValueNormal: {
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    summaryRowFinal: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
      marginTop: 4,
    },
    summaryFinalLabel: {
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    summaryFinalValue: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: colors.accent.DEFAULT,
    },
  });

const getBadgeStyles = (betType: string, colors: ThemeColors) => {
  const map: Record<string, string> = {
    result: colors.accent.DEFAULT,
    goals: colors.primary.DEFAULT,
    cards: colors.destructive.DEFAULT,
    corners: colors.secondary.DEFAULT,
    shots: colors.ring,
  };

  const baseColor = map[betType] ?? colors.muted.DEFAULT;
  return {
    backgroundColor: withAlpha(baseColor, 0.15),
    borderColor: withAlpha(baseColor, 0.4),
  };
};

const withAlpha = (hexColor: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hexColor);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const hexToRgb = (hexColor: string) => {
  const hex = hexColor.replace("#", "");
  const int = parseInt(hex, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};
