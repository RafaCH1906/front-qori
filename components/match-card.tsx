import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
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
import { getDeviceType } from "@/lib/platform-utils";

interface MatchCardProps {
  match: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    time: string;
    odds: { home: number; draw: number; away: number };
    localOptionId?: number;
    drawOptionId?: number;
    awayOptionId?: number;
  };
  onAddBet: (bet: any) => void;
  onOpenMatch: () => void;
  variant?: 'compact' | 'standard' | 'large';
}

export default function MatchCard({
  match,
  onAddBet,
  onOpenMatch,
  variant,
}: MatchCardProps) {
  const { colors } = useTheme();
  const { selectedBets } = useBetting();
  const { width } = useWindowDimensions();
  const deviceType = getDeviceType(width);

  // Determine variant if not provided
  const cardVariant = variant || (deviceType === 'mobile' ? 'compact' : deviceType === 'desktop' ? 'large' : 'standard');

  const styles = useMemo(() => createStyles(colors, cardVariant), [colors, cardVariant]);

  // Check if a specific bet type is selected for this match
  const isBetSelected = (type: "home" | "draw" | "away") => {
    return selectedBets.some(
      (bet) => bet.matchId === match.id && bet.type === type && bet.betType === "result"
    );
  };

  const handleBet = (type: "home" | "draw" | "away") => {
    let optionId;
    if (type === "home") optionId = match.localOptionId;
    else if (type === "draw") optionId = match.drawOptionId;
    else if (type === "away") optionId = match.awayOptionId;

    if (!optionId) {
      console.warn("Option ID missing for type:", type);
      return;
    }

    onAddBet({
      id: optionId,
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

const createStyles = (colors: ThemeColors, variant: 'compact' | 'standard' | 'large') =>
  StyleSheet.create({
    card: {
      padding: variant === 'compact' ? spacing.md : spacing.lg,
      backgroundColor: colors.card.DEFAULT,
    },
    matchInfo: {
      marginBottom: spacing.md,
    },
    timeText: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
      marginBottom: spacing.xs,
    },
    teamsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    teamText: {
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
      fontSize: variant === 'large' ? fontSize.lg : fontSize.base,
      flex: 1,
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
      marginBottom: 0,
    },
    oddsButton: {
      flex: 1,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: variant === 'large' ? spacing.lg : spacing.md,
      alignItems: "center",
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    oddsButtonSelected: {
      backgroundColor: "#FDB81E",
      borderColor: "#FDB81E",
    },
    oddsLabel: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
      marginBottom: 2,
    },
    oddsLabelSelected: {
      color: "#1E293B",
    },
    oddsValue: {
      fontWeight: fontWeight.bold,
      fontSize: variant === 'large' ? fontSize.xl : fontSize.lg,
      color: colors.primary.DEFAULT,
    },
    oddsValueSelected: {
      color: "#1E293B",
    },
  });
