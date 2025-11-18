import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MATCHES, BET_OPTIONS, BetCategoryKey } from "@/constants/matches";
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  ThemeColors,
} from "@/constants/theme";
import { useBetting } from "@/context/betting-context";
import { useTheme } from "@/context/theme-context";

function MatchDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId?: string }>();
  const router = useRouter();
  const { addBet } = useBetting();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const match = useMemo(() => {
    const numericId = Number(matchId);
    if (!matchId || Number.isNaN(numericId)) return undefined;
    return MATCHES.find((item) => item.id === numericId);
  }, [matchId]);

  const handleAddBet = (
    category: BetCategoryKey,
    option: { label: string; odds: number; value: string }
  ) => {
    if (!match) return;

    addBet({
      match: `${match.homeTeam} vs ${match.awayTeam}`,
      type: option.value,
      label: `${BET_OPTIONS[category].label}: ${option.label}`,
      odds: option.odds,
      matchId: match.id,
      betType: category,
    });

    Alert.alert(
      "Bet added",
      `${option.label} @ ${option.odds.toFixed(2)} added to My Bets.`
    );
  };

  if (!match) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.primary.foreground}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Details</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Match not found</Text>
          <Text style={styles.emptySubtitle}>
            Please return to the matches list and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={colors.primary.foreground}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.matchHero}>
          <Text style={styles.leagueText}>{match.time}</Text>
          <Text style={styles.matchTitle}>
            {match.homeTeam} vs {match.awayTeam}
          </Text>
          <View style={styles.oddsSummaryRow}>
            <View style={styles.oddsChip}>
              <Text style={styles.oddsChipLabel}>1</Text>
              <Text style={styles.oddsChipValue}>
                {match.odds.home.toFixed(2)}
              </Text>
            </View>
            <View style={styles.oddsChip}>
              <Text style={styles.oddsChipLabel}>X</Text>
              <Text style={styles.oddsChipValue}>
                {match.odds.draw.toFixed(2)}
              </Text>
            </View>
            <View style={styles.oddsChip}>
              <Text style={styles.oddsChipLabel}>2</Text>
              <Text style={styles.oddsChipValue}>
                {match.odds.away.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {Object.entries(BET_OPTIONS).map(([key, config]) => (
          <View key={key} style={styles.section}>
            <Text style={styles.sectionTitle}>{config.label}</Text>
            <View style={styles.sectionGrid}>
              {config.options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.optionCard}
                  activeOpacity={0.8}
                  onPress={() => handleAddBet(key as BetCategoryKey, option)}
                >
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionOdds}>
                    {option.odds.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card.DEFAULT,
    },
    backButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary.DEFAULT,
    },
    headerTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.foreground,
    },
    contentContainer: {
      padding: spacing.lg,
      gap: spacing.lg,
      paddingBottom: spacing.xl * 2,
    },
    matchHero: {
      backgroundColor: colors.card.DEFAULT,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 4,
      gap: spacing.md,
    },
    leagueText: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    matchTitle: {
      fontSize: fontSize["2xl"],
      fontWeight: fontWeight.bold,
      color: colors.foreground,
    },
    oddsSummaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    oddsChip: {
      flex: 1,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    oddsChipLabel: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
      marginBottom: spacing.xs,
    },
    oddsChipValue: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.primary.DEFAULT,
    },
    section: {
      backgroundColor: colors.card.DEFAULT,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    sectionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    optionCard: {
      width: "47%",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.background,
      alignItems: "center",
    },
    optionLabel: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.foreground,
    },
    optionOdds: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.accent.DEFAULT,
      marginTop: spacing.xs,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
      gap: spacing.md,
    },
    emptyTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.foreground,
    },
    emptySubtitle: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
      textAlign: "center",
    },
  });

export default MatchDetailScreen;
