import React, { useMemo } from "react";
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
  const styles = useMemo(() => createStyles(colors), [colors]);
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
          style={styles.oddsButton}
          activeOpacity={0.7}
        >
          <Text style={styles.oddsLabel}>1</Text>
          <Text style={styles.oddsValue}>{match.odds.home.toFixed(2)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleBet("draw")}
          style={styles.oddsButton}
          activeOpacity={0.7}
        >
          <Text style={styles.oddsLabel}>X</Text>
          <Text style={styles.oddsValue}>{match.odds.draw.toFixed(2)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleBet("away")}
          style={styles.oddsButton}
          activeOpacity={0.7}
        >
          <Text style={styles.oddsLabel}>2</Text>
          <Text style={styles.oddsValue}>{match.odds.away.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onOpenMatch}
        style={styles.detailsButton}
        activeOpacity={0.8}
      >
        <Text style={styles.detailsText}>Goals, Cards, Corners & Shots</Text>
        <Ionicons name="chevron-down" size={16} color={colors.accent.DEFAULT} />
      </TouchableOpacity>
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
    oddsLabel: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
      marginBottom: 4,
    },
    oddsValue: {
      fontWeight: fontWeight.bold,
      fontSize: fontSize.lg,
      color: colors.primary.DEFAULT,
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
  });
