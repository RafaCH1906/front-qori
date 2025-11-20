import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { useBetting } from "@/context/betting-context";
import { BET_OPTIONS, BetCategoryKey } from "@/constants/matches";

interface MatchCardProps {
  match: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    time: string;
    odds: { home: number; draw: number; away: number };
  };
  onAddBet: (bet: any) => void;
  onOpenMatch: () => void;
}

export default function MatchCard({
  match,
  onAddBet,
  onOpenMatch,
}: MatchCardProps) {
  const { colors } = useTheme();
  const { selectedBets, addBet } = useBetting();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if a specific bet type is selected for this match
  const isBetSelected = (type: "home" | "draw" | "away") => {
    return selectedBets.some(
      (bet) => bet.matchId === match.id && bet.type === type && bet.betType === "result"
    );
  };

  // Check if a specific additional bet is selected
  const isAdditionalBetSelected = (category: BetCategoryKey, value: string) => {
    return selectedBets.some(
      (bet) =>
        bet.matchId === match.id &&
        bet.type === value &&
        bet.betType === category
    );
  };

  const handleBet = (type: "home" | "draw" | "away") => {
    onAddBet({
      match: `${match.homeTeam} vs ${match.awayTeam}`,
      type,
      odds: match.odds[type],
      matchId: match.id,
      betType: "result",
    });
  };

  const handleAdditionalBet = (
    category: BetCategoryKey,
    option: { label: string; odds: number; value: string }
  ) => {
    addBet({
      match: `${match.homeTeam} vs ${match.awayTeam}`,
      type: option.value,
      label: `${BET_OPTIONS[category].label}: ${option.label}`,
      odds: option.odds,
      matchId: match.id,
      betType: category,
    });
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onOpenMatch}
        style={styles.matchInfo}
      >
        <Text style={styles.timeText}>{match.time}</Text>
        <View style={styles.teamsContainer}>
          <Text style={styles.teamText}>{match.homeTeam}</Text>
          <Text style={styles.vsText}>vs</Text>
          <Text style={[styles.teamText, styles.teamTextRight]}>
            {match.awayTeam}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.oddsContainer}>
        <TouchableOpacity
          onPress={() => handleBet("home")}
          style={[
            styles.oddsButton,
            isBetSelected("home") && styles.oddsButtonSelected,
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.oddsLabel,
              isBetSelected("home") && styles.oddsLabelSelected,
            ]}
          >
            1
          </Text>
          <Text
            style={[
              styles.oddsValue,
              isBetSelected("home") && styles.oddsValueSelected,
            ]}
          >
            {match.odds.home.toFixed(2)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleBet("draw")}
          style={[
            styles.oddsButton,
            isBetSelected("draw") && styles.oddsButtonSelected,
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.oddsLabel,
              isBetSelected("draw") && styles.oddsLabelSelected,
            ]}
          >
            X
          </Text>
          <Text
            style={[
              styles.oddsValue,
              isBetSelected("draw") && styles.oddsValueSelected,
            ]}
          >
            {match.odds.draw.toFixed(2)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleBet("away")}
          style={[
            styles.oddsButton,
            isBetSelected("away") && styles.oddsButtonSelected,
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.oddsLabel,
              isBetSelected("away") && styles.oddsLabelSelected,
            ]}
          >
            2
          </Text>
          <Text
            style={[
              styles.oddsValue,
              isBetSelected("away") && styles.oddsValueSelected,
            ]}
          >
            {match.odds.away.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.detailsButton}
        activeOpacity={0.8}
      >
        <Text style={styles.detailsText}>Goals, Cards, Corners & Shots</Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.accent.DEFAULT}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          {Object.entries(BET_OPTIONS).map(([key, config]) => (
            <View key={key} style={styles.additionalSection}>
              <Text style={styles.additionalSectionTitle}>{config.label}</Text>
              <View style={styles.additionalGrid}>
                {config.options.map((option) => {
                  const isSelected = isAdditionalBetSelected(
                    key as BetCategoryKey,
                    option.value
                  );
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.additionalOption,
                        isSelected && styles.additionalOptionSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() =>
                        handleAdditionalBet(key as BetCategoryKey, option)
                      }
                    >
                      <Text
                        style={[
                          styles.additionalOptionLabel,
                          isSelected && styles.additionalOptionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={[
                          styles.additionalOptionOdds,
                          isSelected && styles.additionalOptionOddsSelected,
                        ]}
                      >
                        {option.odds.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      padding: spacing.lg,
      backgroundColor: colors.card.DEFAULT,
    },
    matchInfo: {
      marginBottom: spacing.lg,
    },
    timeText: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
      marginBottom: spacing.sm,
    },
    teamsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    teamText: {
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
      flex: 1,
      fontSize: fontSize.base,
    },
    teamTextRight: {
      textAlign: "right",
    },
    vsText: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
      marginHorizontal: spacing.sm,
    },
    oddsContainer: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    oddsButton: {
      flex: 1,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    oddsButtonSelected: {
      backgroundColor: "#FDB81E",
      borderColor: "#FDB81E",
    },
    oddsLabel: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
      marginBottom: 4,
    },
    oddsLabelSelected: {
      color: "#1E293B",
    },
    oddsValue: {
      fontWeight: fontWeight.bold,
      fontSize: fontSize.lg,
      color: colors.primary.DEFAULT,
    },
    oddsValueSelected: {
      color: "#1E293B",
    },
    detailsButton: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    detailsText: {
      fontSize: fontSize.sm,
      color: colors.accent.DEFAULT,
      fontWeight: fontWeight.medium,
    },
    expandedContent: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.lg,
    },
    additionalSection: {
      gap: spacing.sm,
    },
    additionalSectionTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
      marginBottom: spacing.xs,
    },
    additionalGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    additionalOption: {
      width: "48%",
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.background,
      alignItems: "center",
    },
    additionalOptionSelected: {
      backgroundColor: "#FDB81E",
      borderColor: "#FDB81E",
    },
    additionalOptionLabel: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.foreground,
    },
    additionalOptionLabelSelected: {
      color: "#1E293B",
    },
    additionalOptionOdds: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.bold,
      color: colors.accent.DEFAULT,
      marginTop: spacing.xs,
    },
    additionalOptionOddsSelected: {
      color: "#1E293B",
    },
  });
