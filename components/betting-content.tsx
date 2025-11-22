import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import MatchCard from "@/components/match-card";
import LeagueFilter from "@/components/league-filter";
import { spacing, fontSize, fontWeight, ThemeColors } from "@/constants/theme";
import { Match } from "@/constants/matches";
import { useTheme } from "@/context/theme-context";
import { getUpcomingMatches } from "@/lib/api/matches";
import { MatchDTO, League } from "@/lib/types";

interface BettingContentProps {
  onAddBet: (bet: any) => void;
  onOpenMatch: (match: Match) => void;
}

export default function BettingContent({
  onAddBet,
  onOpenMatch,
}: BettingContentProps) {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Fetch matches on component mount
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUpcomingMatches();
        setMatches(data);
      } catch (err: any) {
        console.error("Failed to fetch matches:", err);
        setError(
          err.response?.status === 404
            ? "No matches found"
            : "Unable to load matches. Please check your connection."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Derive unique leagues from matches
  const leagues: League[] = useMemo(() => {
    const uniqueLeagues = new Map<number, League>();
    matches.forEach((match) => {
      if (match.league && !uniqueLeagues.has(match.league.id)) {
        uniqueLeagues.set(match.league.id, {
          id: match.league.id.toString(),
          name: match.league.name,
          country: match.league.country || "International",
          emoji: getCountryEmoji(match.league.country),
        });
      }
    });
    return Array.from(uniqueLeagues.values());
  }, [matches]);

  // Filter matches by selected league
  const filteredMatches = useMemo(() => {
    if (!selectedLeague) return matches;
    return matches.filter((m) => m.league.id.toString() === selectedLeague);
  }, [matches, selectedLeague]);

  // Convert MatchDTO to Match format for MatchCard
  const convertedMatches: Match[] = useMemo(() => {
    return filteredMatches.map((match) => ({
      id: match.id,
      league: match.league.id.toString(),
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      time: formatMatchTime(match.matchDate),
      odds: { home: 1.85, draw: 3.6, away: 4.2 }, // TODO: Get from markets API
    }));
  }, [filteredMatches]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>
          {error.includes("connection")
            ? "Make sure the backend server is running"
            : "Try refreshing the page"}
        </Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyText}>No upcoming matches available</Text>
        <Text style={styles.emptyHint}>Check back later for new matches</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.leagueSection}>
        <Text style={styles.sectionTitle}>Select a League</Text>
        <LeagueFilter
          leagues={leagues}
          selectedLeague={selectedLeague}
          onSelect={setSelectedLeague}
        />
      </View>

      <View style={styles.matchesSection}>
        <View style={styles.matchesHeader}>
          <Text style={styles.sectionTitle}>
            {selectedLeague
              ? leagues.find((l) => l.id === selectedLeague)?.name
              : "All Matches"}
          </Text>
          <Text style={styles.matchCount}>
            {convertedMatches.length} matches
          </Text>
        </View>

        <View style={styles.matchesList}>
          {convertedMatches.map((match) => (
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

// Helper function to format match date/time
function formatMatchTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "TBD";
  }
}

// Helper function to get country emoji
function getCountryEmoji(country?: string): string {
  const emojiMap: Record<string, string> = {
    Spain: "🇪🇸",
    Peru: "🇵🇪",
    Germany: "🇩🇪",
    Italy: "🇮🇹",
    England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    France: "🇫🇷",
    Europe: "🏆",
  };
  return emojiMap[country || ""] || "⚽";
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
      minHeight: 400,
    },
    loadingText: {
      marginTop: spacing.sm,
      fontSize: fontSize.base,
      color: colors.muted.foreground,
    },
    errorIcon: {
      fontSize: 48,
      marginBottom: spacing.md,
    },
    errorText: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.destructive.DEFAULT,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    errorHint: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
      textAlign: "center",
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: spacing.md,
    },
    emptyText: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    emptyHint: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
      textAlign: "center",
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
