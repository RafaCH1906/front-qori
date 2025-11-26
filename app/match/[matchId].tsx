import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
import BetSlip from "@/components/bet-slip";
import { useAuth } from "@/context/AuthProvider";
import { useBalance } from "@/context/balance-context";
import { useToast } from "@/context/toast-context";
import { placeBet, PlaceBetRequest } from "@/lib/api/bets";
import BetConfirmationModal from "@/components/bet-confirmation-modal";
import { Alert } from "react-native";
import { shouldUseLargeScreenLayout } from "@/lib/platform-utils";
import { getMatchById } from "@/lib/api/matches";
import { MatchDTO } from "@/lib/types";

export default function MatchDetailScreen() {
  const { matchId } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { selectedBets, addBet, removeBet, clearBets } = useBetting();
  const { user } = useAuth();
  const { balance, refreshBalance } = useBalance();
  const { showToast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingBet, setPendingBet] = useState<{ stake: number, bets: any[] } | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [match, setMatch] = useState<MatchDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isLargeScreen = shouldUseLargeScreenLayout(width);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) {
        setError("ID de partido no válido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const matchData = await getMatchById(parseInt(matchId as string));
        setMatch(matchData);
      } catch (err: any) {
        console.error("Failed to fetch match:", err);
        setError("No se pudo cargar el partido. Por favor, intenta nuevamente.");
        showToast("Error al cargar el partido", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  const getMatchTime = () => {
    if (!match) return "TBD";
    try {
      const date = new Date(match.date);
      return date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch {
      return "TBD";
    }
  };

  const getMatchDate = () => {
    if (!match) return "";
    try {
      const date = new Date(match.date);
      return date.toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" });
    } catch {
      return "";
    }
  };

  const isBetSelected = (type: "home" | "draw" | "away") => {
    if (!match) return false;
    return selectedBets.some(
      (bet) => bet.matchId === match.id && bet.type === type && bet.betType === "result"
    );
  };

  const isAdditionalBetSelected = (category: BetCategoryKey, value: string) => {
    if (!match) return false;
    return selectedBets.some(
      (bet) =>
        bet.matchId === match.id &&
        bet.type === value &&
        bet.betType === category
    );
  };

  const handleBet = (type: "home" | "draw" | "away") => {
    if (!match) return;
    if (!user) {
      showToast("Por favor, inicia sesión para realizar apuestas", "error");
      return;
    }
    const defaultOdds = { home: 1.85, draw: 3.6, away: 4.2 };
    addBet({
      match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      type,
      odds: defaultOdds[type],
      matchId: match.id,
      betType: "result",
    });
  };

  const handleAdditionalBet = (
    category: BetCategoryKey,
    option: { label: string; odds: number; value: string }
  ) => {
    if (!match) return;
    if (!user) {
      showToast("Por favor, inicia sesión para realizar apuestas", "error");
      return;
    }
    addBet({
      match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      type: option.value,
      label: `${BET_OPTIONS[category].label}: ${option.label}`,
      odds: option.odds,
      matchId: match.id,
      betType: category,
    });
  };

  const handlePlaceBet = async (stake: number, bets: any[]) => {
    if (!user) {
      showToast("Por favor, inicia sesión para realizar apuestas", "error");
      return;
    }
    setPendingBet({ stake, bets });
    setShowConfirmation(true);
  };

  const confirmPlaceBet = async () => {
    if (!pendingBet || !user) return;

    setIsPlacingBet(true);
    try {
      const selections = pendingBet.bets.map(bet => ({
        optionId: bet.id,
        odds: bet.odds,
      }));

      const request: PlaceBetRequest = {
        userId: user.id,
        totalStake: pendingBet.stake,
        selections,
      };

      await placeBet(request);

      const betType = pendingBet.bets.length > 1 ? "combinada" : "simple";
      const totalOdds = pendingBet.bets.reduce((acc, bet) => acc * bet.odds, 1);
      const potentialWin = pendingBet.stake * totalOdds;

      Alert.alert(
        "¡Apuesta Realizada con Éxito!",
        `Tu apuesta ${betType} ha sido registrada.\n\n` +
        `Monto apostado: S/ ${pendingBet.stake.toFixed(2)}\n` +
        `Cuota total: ${totalOdds.toFixed(2)}\n` +
        `Ganancia potencial: S/ ${potentialWin.toFixed(2)}\n\n` +
        `¡Buena suerte! 🍀`,
        [{ text: "Entendido" }]
      );

      clearBets();
      await new Promise(resolve => setTimeout(resolve, 300));
      await refreshBalance();

      setShowConfirmation(false);
      setPendingBet(null);
    } catch (error: any) {
      let errorMessage = "Error al realizar la apuesta. Por favor, intenta nuevamente.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        if (error.message.includes('Network')) {
          errorMessage = "Error de conexión. Verifica tu internet.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Error al Realizar Apuesta", errorMessage, [{ text: "OK" }]);
      console.error('[MatchDetailScreen] Failed to place bet:', error);
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleRemoveBet = (id: number) => {
    removeBet(id);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del Partido</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          <Text style={styles.loadingText}>Cargando partido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !match) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del Partido</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.destructive.DEFAULT} />
          <Text style={styles.errorText}>{error || "Partido no encontrado"}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const defaultOdds = { home: 1.85, draw: 3.6, away: 4.2 };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Partido</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={[
          isLargeScreen ? styles.mainRow : styles.mainColumn,
        ]}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Text style={styles.leagueText}>{match.league.name}</Text>
              <Text style={styles.dateText}>{getMatchDate()}</Text>
            </View>

            <View style={styles.teamsSection}>
              <View style={styles.teamColumn}>
                <Text style={styles.teamName}>{match.homeTeam.name}</Text>
              </View>
              <View style={styles.vsContainer}>
                <Text style={styles.timeText}>{getMatchTime()}</Text>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <View style={styles.teamColumn}>
                <Text style={[styles.teamName, styles.teamNameRight]}>
                  {match.awayTeam.name}
                </Text>
              </View>
            </View>

            <View style={styles.mainBetsSection}>
              <Text style={styles.sectionTitle}>Resultado del Partido</Text>
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
                    {defaultOdds.home.toFixed(2)}
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
                    {defaultOdds.draw.toFixed(2)}
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
                    {defaultOdds.away.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.additionalBetsSection}>
            <Text style={styles.additionalBetsTitle}>Más Opciones de Apuesta</Text>
            {Object.entries(BET_OPTIONS).map(([key, config]) => (
              <View key={key} style={styles.betCategoryCard}>
                <Text style={styles.betCategoryTitle}>{config.label}</Text>
                <View style={styles.betOptionsGrid}>
                  {config.options.map((option) => {
                    const isSelected = isAdditionalBetSelected(
                      key as BetCategoryKey,
                      option.value
                    );
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.betOption,
                          isSelected && styles.betOptionSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          handleAdditionalBet(key as BetCategoryKey, option)
                        }
                      >
                        <Text
                          style={[
                            styles.betOptionLabel,
                            isSelected && styles.betOptionLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text
                          style={[
                            styles.betOptionOdds,
                            isSelected && styles.betOptionOddsSelected,
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
        </View>

        {isLargeScreen && (
          <View style={styles.betSlipContainer}>
            <BetSlip
              bets={selectedBets}
              onRemoveBet={handleRemoveBet}
              onPlaceBet={handlePlaceBet}
              showHeader
            />
          </View>
        )}
      </ScrollView>

      {!isLargeScreen && selectedBets.length > 0 && (
        <View style={styles.mobileBetSlipContainer}>
          <BetSlip
            bets={selectedBets}
            onRemoveBet={handleRemoveBet}
            onPlaceBet={handlePlaceBet}
            showHeader={false}
          />
        </View>
      )}

      <BetConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmPlaceBet}
        bets={pendingBet?.bets || []}
        stake={pendingBet?.stake || 0}
        totalOdds={pendingBet?.bets.reduce((acc, bet) => acc * bet.odds, 1) || 0}
        potentialWinnings={(pendingBet?.stake || 0) * (pendingBet?.bets.reduce((acc, bet) => acc * bet.odds, 1) || 0)}
        balance={balance}
        isLoading={isPlacingBet}
      />
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
      padding: spacing.xs,
    },
    headerTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    placeholder: {
      width: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.md,
    },
    loadingText: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
      gap: spacing.md,
    },
    errorText: {
      fontSize: fontSize.base,
      color: colors.destructive.DEFAULT,
      textAlign: "center",
    },
    retryButton: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      backgroundColor: colors.primary.DEFAULT,
      borderRadius: borderRadius.lg,
      marginTop: spacing.md,
    },
    retryButtonText: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: colors.primary.foreground,
    },
    mainContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mainRow: {
      flexDirection: "row",
      paddingVertical: spacing.lg,
      paddingLeft: spacing.xl * 3,
      paddingRight: spacing.xl * 3,
      gap: spacing.lg,
      maxWidth: 1800,
      marginHorizontal: "auto",
    },
    mainColumn: {
      flexDirection: "column",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      paddingBottom: spacing.xl * 8,
    },
    contentWrapper: {
      flex: 1,
      maxWidth: 1000,
      paddingRight: spacing.lg,
    },
    betSlipContainer: {
      width: 450,
      maxHeight: "100%",
    },
    matchCard: {
      backgroundColor: colors.card.DEFAULT,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    matchHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },
    leagueText: {
      fontSize: fontSize.sm,
      color: colors.accent.DEFAULT,
      fontWeight: fontWeight.medium,
    },
    dateText: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
    },
    teamsSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.xl,
    },
    teamColumn: {
      flex: 1,
    },
    teamName: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: colors.foreground,
    },
    teamNameRight: {
      textAlign: "right",
    },
    vsContainer: {
      alignItems: "center",
      paddingHorizontal: spacing.md,
    },
    timeText: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.primary.DEFAULT,
      marginBottom: spacing.xs,
    },
    vsText: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
    },
    mainBetsSection: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
      marginBottom: spacing.md,
    },
    oddsContainer: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    oddsButton: {
      flex: 1,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.lg,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    oddsButtonSelected: {
      backgroundColor: "#FDB81E",
      borderColor: "#FDB81E",
    },
    oddsLabel: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
      marginBottom: spacing.xs,
    },
    oddsLabelSelected: {
      color: "#1E293B",
    },
    oddsValue: {
      fontWeight: fontWeight.bold,
      fontSize: fontSize.xl,
      color: colors.primary.DEFAULT,
    },
    oddsValueSelected: {
      color: "#1E293B",
    },
    additionalBetsSection: {
      gap: spacing.md,
    },
    additionalBetsTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.foreground,
      marginBottom: spacing.sm,
    },
    betCategoryCard: {
      backgroundColor: colors.card.DEFAULT,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    betCategoryTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
      marginBottom: spacing.md,
    },
    betOptionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    betOption: {
      width: "48%",
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.background,
      alignItems: "center",
    },
    betOptionSelected: {
      backgroundColor: "#FDB81E",
      borderColor: "#FDB81E",
    },
    betOptionLabel: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.foreground,
      marginBottom: spacing.xs,
    },
    betOptionLabelSelected: {
      color: "#1E293B",
    },
    betOptionOdds: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.accent.DEFAULT,
    },
    betOptionOddsSelected: {
      color: "#1E293B",
    },
    mobileBetSlipContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: spacing.md,
      maxHeight: "50%",
    },
  });
