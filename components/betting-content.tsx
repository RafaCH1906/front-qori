import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, ActivityIndicator, StyleSheet, useWindowDimensions } from "react-native";
import MatchCard from "@/components/match-card";
import { spacing, fontSize, fontWeight, ThemeColors, borderRadius } from "@/constants/theme";
import { Match } from "@/constants/matches";
import { useTheme } from "@/context/theme-context";
import { getUpcomingMatches, getLeagues, getOdds, getOptions } from "@/lib/api/matches";
import { MatchDTO } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { getDeviceType } from "@/lib/platform-utils";

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

const MATCHES_PER_PAGE = 5;

export default function BettingContent({ onAddBet, onOpenMatch, selectedLeague }: BettingContentProps) {
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [leagues, setLeagues] = useState<LocalLeague[]>([]);
  const [odds, setOdds] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const deviceType = getDeviceType(width);
  const isDesktop = deviceType === 'desktop';
  const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [matchesData, leaguesData, oddsData, optionsData] = await Promise.all([
          getUpcomingMatches(MATCHES_PER_PAGE),
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

  const filteredMatches = useMemo(() => {
    if (!selectedLeague) return matches;
    return matches.filter((m) => m.league && m.league.id === selectedLeague);
  }, [matches, selectedLeague]);

  const convertedMatches: Match[] = useMemo(() => {
    return filteredMatches.map((m) => ({
      id: m.id,
      league: m.league ? m.league.id.toString() : "",
      homeTeam: m.homeTeam?.name ?? "",
      awayTeam: m.awayTeam?.name ?? "",
      time: formatMatchTime(m.date),
      odds: {
        home: m.localOdds ?? 0,
        draw: m.drawOdds ?? 0,
        away: m.awayOdds ?? 0
      },
      localOptionId: m.localOptionId,
      drawOptionId: m.drawOptionId,
      awayOptionId: m.awayOptionId,
    }));
  }, [filteredMatches]);

  if (loading && matches.length === 0) {
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

  return (
    <View style={styles.container}>
      <View style={styles.matchesSection}>
        <View style={styles.matchesHeader}>
          <Text style={styles.sectionTitle}>Próximos Partidos</Text>
        </View>

        {convertedMatches.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No hay partidos próximos</Text>
          </View>
        ) : (
          <View style={[styles.matchesList, isDesktop && styles.matchesGrid]}>
            {convertedMatches.map((match) => (
              <View key={match.id} style={[styles.matchItem, isDesktop && styles.matchItemDesktop]}>
                <MatchCard match={match} onAddBet={onAddBet} onOpenMatch={() => onOpenMatch(match)} />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}


function formatMatchTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "TBD";
  }
}

const createStyles = (colors: ThemeColors, isDesktop: boolean = false) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: isDesktop ? spacing.xl : spacing.md },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl, minHeight: 400 },
    loadingText: { marginTop: spacing.sm, fontSize: fontSize.base, color: colors.muted.foreground },
    errorIcon: { fontSize: 48, marginBottom: spacing.md },
    errorText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.destructive.DEFAULT, textAlign: "center", marginBottom: spacing.sm },
    errorHint: { fontSize: fontSize.sm, color: colors.muted.foreground, textAlign: "center" },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.foreground, textAlign: "center", marginBottom: spacing.sm },
    emptyHint: { fontSize: fontSize.sm, color: colors.muted.foreground, textAlign: "center" },
    sectionTitle: { fontSize: isDesktop ? fontSize.xl : fontSize.lg, fontWeight: fontWeight.semibold, marginBottom: spacing.md, color: colors.foreground },
    matchesSection: { marginBottom: spacing.lg },
    matchesHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
    matchCount: { fontSize: fontSize.sm, color: colors.muted.foreground },
    matchesList: { gap: spacing.md },
    matchesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.lg,
    },
    matchItem: { marginBottom: spacing.md },
    matchItemDesktop: {
      width: '100%', // Tarjetas a ancho completo en desktop para aprovechar espacio
      marginBottom: 0,
    },
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
    loadMoreButton: {
      marginTop: spacing.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card.DEFAULT,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    loadMoreText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.primary.DEFAULT,
    },
  });
