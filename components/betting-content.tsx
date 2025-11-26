import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import MatchCard from "@/components/match-card";
import { spacing, fontSize, fontWeight, ThemeColors, borderRadius } from "@/constants/theme";
import { Match } from "@/constants/matches";
import { useTheme } from "@/context/theme-context";
import { getUpcomingMatches, getLeagues, getOdds, getOptions } from "@/lib/api/matches";
import { MatchDTO } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";

// Define local League interface to match what we use in this component
interface LocalLeague {
  id: number;
  name: string;
  country?: string;
}

interface BettingContentProps {
  onAddBet: (bet: any) => void;
  onOpenMatch: (match: Match) => void;
  selectedLeague: number | null;
}

const MATCHES_PER_PAGE = 6;

export default function BettingContent({ onAddBet, onOpenMatch, selectedLeague }: BettingContentProps) {
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [leagues, setLeagues] = useState<LocalLeague[]>([]);
  const [odds, setOdds] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Guard against state updates after component unmount
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [matchesData, leaguesData, oddsData, optionsData] = await Promise.all([
          getUpcomingMatches(),
          getLeagues(),
          getOdds(),
          getOptions(),
        ]);

        if (isMounted.current) {
          setMatches(matchesData);
          setLeagues(leaguesData);
          setOdds(oddsData);
          setOptions(optionsData);
        }
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        if (isMounted.current) {
          setError(
            err.response?.status === 404
              ? "No matches found"
              : "Unable to load data. Please check your connection."
          );
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Filter matches by selected league
  const filteredMatches = useMemo(() => {
    if (!selectedLeague) return matches;
    return matches.filter((m) => m.league && m.league.id === selectedLeague);
  }, [matches, selectedLeague]);

  // Reset to page 1 when league selection changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLeague]);

  // Convert MatchDTO to Match format for MatchCard
  const convertedMatches: Match[] = useMemo(() => {
    return filteredMatches.map((m) => ({
      id: m.id,
      league: m.league ? m.league.id.toString() : "",
      homeTeam: m.homeTeam?.name ?? "",
      awayTeam: m.awayTeam?.name ?? "",
      time: formatMatchTime(m.date),
      odds: { home: 1.85, draw: 3.6, away: 4.2 }, // placeholder odds
    }));
  }, [filteredMatches]);

  // Pagination calculations
  const totalPages = Math.ceil(convertedMatches.length / MATCHES_PER_PAGE);
  const startIndex = (currentPage - 1) * MATCHES_PER_PAGE;
  const endIndex = startIndex + MATCHES_PER_PAGE;
  const paginatedMatches = convertedMatches.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

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
          {error.includes("connection") ? "Make sure the backend server is running" : "Try refreshing the page"}
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
      <View style={styles.matchesSection}>
        <View style={styles.matchesHeader}>
          <Text style={styles.sectionTitle}>
            {selectedLeague ? leagues.find((l) => l.id === selectedLeague)?.name : "All Matches"}
          </Text>
          <Text style={styles.matchCount}>{convertedMatches.length} matches</Text>
        </View>
        <View style={styles.matchesList}>
          {paginatedMatches.map((match) => (
            <View key={match.id} style={styles.matchItem}>
              <MatchCard match={match} onAddBet={onAddBet} onOpenMatch={() => onOpenMatch(match)} />
            </View>
          ))}
        </View>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
              onPress={handlePreviousPage}
              disabled={currentPage === 1}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={currentPage === 1 ? colors.muted.foreground : colors.primary.DEFAULT}
              />
              <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
                Anterior
              </Text>
            </TouchableOpacity>

            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Página {currentPage} de {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
              onPress={handleNextPage}
              disabled={currentPage === totalPages}
              activeOpacity={0.7}
            >
              <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
                Siguiente
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={currentPage === totalPages ? colors.muted.foreground : colors.primary.DEFAULT}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// Helper function to format match date/time
function formatMatchTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "TBD";
  }
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl, minHeight: 400 },
    loadingText: { marginTop: spacing.sm, fontSize: fontSize.base, color: colors.muted.foreground },
    errorIcon: { fontSize: 48, marginBottom: spacing.md },
    errorText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.destructive.DEFAULT, textAlign: "center", marginBottom: spacing.sm },
    errorHint: { fontSize: fontSize.sm, color: colors.muted.foreground, textAlign: "center" },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.foreground, textAlign: "center", marginBottom: spacing.sm },
    emptyHint: { fontSize: fontSize.sm, color: colors.muted.foreground, textAlign: "center" },
    sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, marginBottom: spacing.md, color: colors.foreground },
    matchesSection: { marginBottom: spacing.lg },
    matchesHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
    matchCount: { fontSize: fontSize.sm, color: colors.muted.foreground },
    matchesList: { gap: spacing.md },
    matchItem: { marginBottom: spacing.md },
    paginationContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: spacing.xl,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    paginationButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card.DEFAULT,
    },
    paginationButtonDisabled: {
      opacity: 0.5,
    },
    paginationButtonText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.primary.DEFAULT,
    },
    paginationButtonTextDisabled: {
      color: colors.muted.foreground,
    },
    paginationInfo: {
      paddingHorizontal: spacing.md,
    },
    paginationText: {
      fontSize: fontSize.sm,
      color: colors.foreground,
      fontWeight: fontWeight.medium,
    },
  });
