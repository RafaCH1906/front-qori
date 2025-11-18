import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import MatchCard from "@/components/match-card";
import LeagueFilter from "@/components/league-filter";
import { spacing, fontSize, fontWeight, ThemeColors } from "@/constants/theme";
import { LEAGUES, MATCHES, Match } from "@/constants/matches";
import { useTheme } from "@/context/theme-context";

interface BettingContentProps {
  onAddBet: (bet: any) => void;
  onOpenMatch: (match: Match) => void;
}

export default function BettingContent({
  onAddBet,
  onOpenMatch,
}: BettingContentProps) {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const filteredMatches = selectedLeague
    ? MATCHES.filter((m) => m.league === selectedLeague)
    : MATCHES;

  return (
    <View style={styles.container}>
      <View style={styles.leagueSection}>
        <Text style={styles.sectionTitle}>Select a League</Text>
        <LeagueFilter
          leagues={LEAGUES}
          selectedLeague={selectedLeague}
          onSelect={setSelectedLeague}
        />
      </View>

      <View style={styles.matchesSection}>
        <View style={styles.matchesHeader}>
          <Text style={styles.sectionTitle}>
            {selectedLeague
              ? LEAGUES.find((l) => l.id === selectedLeague)?.name
              : "All Matches"}
          </Text>
          <Text style={styles.matchCount}>
            {filteredMatches.length} matches
          </Text>
        </View>

        <View style={styles.matchesList}>
          {filteredMatches.map((match) => (
            <View key={match.id} style={styles.matchItem}>
              <MatchCard
                match={match}
                onAddBet={onAddBet}
                onOpenMatch={() => onOpenMatch(match)}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    leagueSection: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      marginBottom: spacing.md,
      color: colors.foreground,
    },
    matchesSection: {
      marginBottom: spacing.lg,
    },
    matchesHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    matchCount: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
    },
    matchesList: {
      gap: spacing.md,
    },
    matchItem: {
      marginBottom: spacing.md,
    },
  });
