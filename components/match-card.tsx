import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "@/components/ui/card";
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { useBetting } from "@/context/betting-context";

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
  const { selectedBets } = useBetting();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Check if a specific bet type is selected for this match
  const isBetSelected = (type: "home" | "draw" | "away") => {
    return selectedBets.some(
      (bet) => bet.matchId === match.id && bet.type === type && bet.betType === "result"
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
  });
