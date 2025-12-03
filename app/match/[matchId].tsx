import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Image,
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
import UnifiedBetPanel from "@/components/unified-bet-panel";
import Header from "@/components/header";
import AuthModal from "@/components/auth-modal";
import ForgotPasswordModal from "@/components/forgot-password-modal";
import { useAuth } from "@/context/AuthProvider";
import { useBalance } from "@/context/balance-context";
import { useToast } from "@/context/toast-context";
import { placeBet, PlaceBetRequest } from "@/lib/api/bets";
import BetConfirmationModal from "@/components/bet-confirmation-modal";
import { shouldUseLargeScreenLayout } from "@/lib/platform-utils";
import { getMatchById, getMarketsByMatch, getMarketOptions } from "@/lib/api/matches";
import { MatchDTO, MarketDTO, MarketOption } from "@/lib/types";

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
  const [markets, setMarkets] = useState<MarketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isLargeScreen = shouldUseLargeScreenLayout(width);
  const leagueLogoUri = match?.league?.logoUrl || match?.league?.logo;
  const filteredMarkets = markets.filter((market) => {
    const type = market.type?.toUpperCase() || "";
    const desc = market.description?.toLowerCase() || "";
    return !(
      type.includes("RESULT") ||
      desc.includes("match winner") ||
      desc.includes("1x2")
    );
  });

  const getMarketTitle = (market: MarketDTO) => {
    const type = market.type?.toUpperCase() || "";
    const desc = market.description?.toLowerCase() || "";

    if (type.includes("GOALS") || type.includes("GOLES") || desc.includes("gol")) {
      return "Total de goles";
    }
    if (
      type.includes("CARDS") ||
      type.includes("TARJETAS") ||
      type.includes("CARD") ||
      desc.includes("tarjeta")
    ) {
      return "Total de tarjetas";
    }
    if (
      type.includes("CORNERS") ||
      type.includes("CORNER") ||
      type.includes("TIROS_DE_ESQUINA") ||
      desc.includes("corner") ||
      desc.includes("esquina")
    ) {
      return "Total de corners";
    }
    if (
      type.includes("SHOTS") ||
      type.includes("DISPAROS") ||
      type.includes("TIROS") ||
      desc.includes("disparo") ||
      desc.includes("tiro")
    ) {
      return "Total de disparos";
    }

    return market.description || "Mercado";
  };

  const formatOptionLabel = (option: MarketOption) => {
    const optionName = option.name?.toUpperCase() || "";
    const line = option.line ?? "";

    if (optionName.includes("OVER")) {
      return `Más de ${line}`;
    }
    if (optionName.includes("UNDER")) {
      return `Menos de ${line}`;
    }

    return option.description || `${option.name}${line ? ` ${line}` : ""}`;
  };

  useEffect(() => {
    console.log("[MatchDetail] Component mounted");
    console.log("[MatchDetail] Current user:", user ? { id: user.id, email: user.email, role: user.role } : "NOT LOGGED IN");
  }, [user]);

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

        // Load markets for this match
        try {
          console.log("[MatchDetail] About to fetch markets for matchId:", matchId);
          const marketsData = await getMarketsByMatch(parseInt(matchId as string));
          console.log("[MatchDetail] Successfully fetched markets:", marketsData.length);
          console.log("Raw markets from API:", JSON.stringify(marketsData, null, 2));

          // If markets don't have options, load them manually
          const marketsWithOptions = await Promise.all(
            marketsData.map(async (market: MarketDTO) => {
              if (!market.options || market.options.length === 0) {
                try {
                  const options = await getMarketOptions(market.id);
                  return { ...market, options };
                } catch (err) {
                  console.error(`Failed to load options for market ${market.id}:`, err);
                  return market;
                }
              }
              return market;
            })
          );

          console.log("[MatchDetail] ========== MARKETS DEBUG ==========");
          console.log("[MatchDetail] Markets with options loaded:", marketsWithOptions.length);
          marketsWithOptions.forEach((market, index) => {
            console.log(`[MatchDetail] Market ${index + 1}:`, {
              id: market.id,
              type: market.type,
              description: market.description,
              optionsCount: market.options?.length || 0,
              firstOption: market.options?.[0] ? {
                id: market.options[0].id,
                name: market.options[0].name,
                line: market.options[0].line
              } : null
            });
          });
          console.log("[MatchDetail] ====================================");

          setMarkets(marketsWithOptions || []);
        } catch (marketErr) {
          console.error("Failed to fetch markets:", marketErr);
          // Don't fail the whole page if markets fail to load
          setMarkets([]);
        }
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

  const handleAuthOpen = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
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
      handleAuthOpen("login");
      return;
    }

    // Get the actual optionId from match data
    let optionId;

    if (type === "home") optionId = match.localOptionId;
    else if (type === "draw") optionId = match.drawOptionId;
    else if (type === "away") optionId = match.awayOptionId;

    if (!optionId) {
      console.warn("Option ID missing for type:", type);
      showToast("Esta opción de apuesta no está disponible", "error");
      return;
    }

    // Use actual odds from match, don't use fake defaults
    const odds = {
      home: match.localOdds || 0,
      draw: match.drawOdds || 0,
      away: match.awayOdds || 0,
    };

    // Don't allow betting if odds are 0
    if (odds[type] === 0) {
      showToast("Esta opción de apuesta no está disponible aún", "error");
      return;
    }

    addBet({
      id: optionId, // CRITICAL: Pass the actual optionId
      match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      type,
      odds: odds[type],
      matchId: match.id,
      betType: "result",
    });
  };

  const handleAdditionalBet = (optionId: number, optionName: string, optionOdd: number, marketType: string) => {
    if (!match) return;
    if (!user) {
      handleAuthOpen("login");
      return;
    }

    addBet({
      id: optionId,
      match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      type: optionName,
      odds: optionOdd,
      matchId: match.id,
      betType: marketType,
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
        oddsTaken: bet.odds,
        matchId: bet.matchId, // Include matchId for validation
      }));

      // For single bets, include matchId at bet level
      const matchId = pendingBet.bets.length === 1 ? pendingBet.bets[0].matchId : undefined;

      const request: PlaceBetRequest = {
        userId: user.id,
        totalStake: pendingBet.stake,
        selections,
        matchId, // Include matchId for single bets
      };

      const response = await placeBet(request);

      const betType = pendingBet.bets.length > 1 ? "combinada" : "simple";
      const totalOdds = pendingBet.bets.reduce((acc, bet) => acc * bet.odds, 1);
      const potentialWin = pendingBet.stake * totalOdds;

      // Clear bets from slip
      clearBets();

      // Close confirmation modal
      setShowConfirmation(false);
      setPendingBet(null);

      // Wait for backend transaction to complete before refreshing balance
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshBalance();

      // Show success toast notification
      showToast(
        `¡Apuesta ${betType} realizada con éxito! 🍀\n` +
        `Monto: S/ ${pendingBet.stake.toFixed(2)} | ` +
        `Cuota: ${totalOdds.toFixed(2)} | ` +
        `Ganancia potencial: S/ ${potentialWin.toFixed(2)}`,
        "success"
      );

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

      showToast(errorMessage, "error");
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
        <Header
          onLoginClick={() => handleAuthOpen("login")}
          onRegisterClick={() => handleAuthOpen("register")}
        />
        <View style={styles.subHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del Partido</Text>
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
        <Header
          onLoginClick={() => handleAuthOpen("login")}
          onRegisterClick={() => handleAuthOpen("register")}
        />
        <View style={styles.subHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del Partido</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        onLoginClick={() => handleAuthOpen("login")}
        onRegisterClick={() => handleAuthOpen("register")}
      />
      <View style={styles.subHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Partido</Text>
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
              <View style={styles.leagueInfo}>
                {leagueLogoUri && (
                  <Image
                    source={{ uri: leagueLogoUri }}
                    style={styles.leagueLogo}
                    resizeMode="contain"
                  />
                )}
                <View>
                  <Text style={styles.leagueText}>{match.league.name}</Text>
                  <Text style={styles.leagueSubtitle}>{match.league.country || ""}</Text>
                </View>
              </View>
              <Text style={styles.dateText}>{getMatchDate()}</Text>
            </View>

            <View style={styles.teamsSection}>
              <View style={styles.teamColumn}>
                <View style={styles.teamRow}>
                  {match.homeTeam.logo ? (
                    <Image
                      source={{ uri: match.homeTeam.logo }}
                      style={[styles.teamLogo, styles.teamLogoSpacingRight]}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.teamLogoPlaceholder, styles.teamLogoSpacingRight]}>
                      <Text style={styles.teamLogoPlaceholderText}>
                        {match.homeTeam.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.teamName}>{match.homeTeam.name}</Text>
                </View>
              </View>
              <View style={styles.vsContainer}>
                <Text style={styles.timeText}>{getMatchTime()}</Text>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <View style={styles.teamColumn}>
                <View style={[styles.teamRow, styles.teamRowRight]}>
                  <Text style={[styles.teamName, styles.teamNameRight]}>
                    {match.awayTeam.name}
                  </Text>
                  {match.awayTeam.logo ? (
                    <Image
                      source={{ uri: match.awayTeam.logo }}
                      style={[styles.teamLogo, styles.teamLogoSpacingLeft]}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.teamLogoPlaceholder, styles.teamLogoSpacingLeft]}>
                      <Text style={styles.teamLogoPlaceholderText}>
                        {match.awayTeam.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Lugar:</Text>
              <Text style={styles.locationValue} numberOfLines={1} ellipsizeMode="tail">
                {match.homeTeam.stadium || match.homeTeam.city || match.league.country || "Por confirmar"}
              </Text>
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
                  disabled={!match.localOdds || match.localOdds === 0}
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
                    {(match.localOdds || 0).toFixed(2)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleBet("draw")}
                  style={[
                    styles.oddsButton,
                    isBetSelected("draw") && styles.oddsButtonSelected,
                  ]}
                  activeOpacity={0.7}
                  disabled={!match.drawOdds || match.drawOdds === 0}
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
                    {(match.drawOdds || 0).toFixed(2)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleBet("away")}
                  style={[
                    styles.oddsButton,
                    isBetSelected("away") && styles.oddsButtonSelected,
                  ]}
                  activeOpacity={0.7}
                  disabled={!match.awayOdds || match.awayOdds === 0}
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
                    {(match.awayOdds || 0).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

            <View style={styles.additionalBetsSection}>
              <Text style={styles.additionalBetsTitle}>Más Opciones de Apuesta</Text>
              {filteredMarkets.length === 0 ? (
                <View style={styles.noMarketsContainer}>
                  <Text style={styles.noMarketsText}>No hay mercados adicionales disponibles</Text>
                </View>
              ) : (
                filteredMarkets.map((market) => {
                  const marketTitle = getMarketTitle(market);
                  const formattedOptions = market.options || [];

                  return (
                    <View key={market.id} style={styles.betCategoryCard}>
                      <Text style={styles.betCategoryTitle}>{marketTitle}</Text>
                      <View style={styles.betOptionsGrid}>
                        {formattedOptions.length === 0 ? (
                          <Text style={styles.betCategoryTitle}>No hay opciones disponibles</Text>
                        ) : (
                          formattedOptions.map((option) => {
                            const isSelected = selectedBets.some((bet) => bet.id === option.id);
                            return (
                              <TouchableOpacity
                                key={option.id}
                                style={[
                                  styles.betOption,
                                  isSelected && styles.betOptionSelected,
                                ]}
                                activeOpacity={0.8}
                                onPress={() =>
                                  handleAdditionalBet(option.id, option.name, option.odd, market.type)
                                }
                              >
                                <Text
                                  style={[
                                    styles.betOptionLabel,
                                    isSelected && styles.betOptionLabelSelected,
                                  ]}
                                >
                                  {formatOptionLabel(option)}
                                </Text>
                                <Text
                                  style={[
                                    styles.betOptionOdds,
                                    isSelected && styles.betOptionOddsSelected,
                                  ]}
                                >
                                  {option.odd.toFixed(2)}
                                </Text>
                              </TouchableOpacity>
                            );
                          })
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
        </View>

        {isLargeScreen && (
          <View style={styles.betSlipContainer}>
            <UnifiedBetPanel
              bets={selectedBets}
              onRemoveBet={handleRemoveBet}
              onPlaceBet={handlePlaceBet}
            />
          </View>
        )}
      </ScrollView>

      {!isLargeScreen && selectedBets.length > 0 && (
        <View style={styles.mobileBetSlipContainer}>
          <UnifiedBetPanel
            bets={selectedBets}
            onRemoveBet={handleRemoveBet}
            onPlaceBet={handlePlaceBet}
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        mode={authMode}
        onSwitchMode={(mode) => setAuthMode(mode)}
        onForgotPassword={() => {
          setIsAuthOpen(false);
          setIsForgotPasswordOpen(true);
        }}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
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
    subHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
    },
    backButton: {
      padding: spacing.xs,
      marginRight: spacing.sm,
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
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    leagueInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    leagueLogo: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.md,
      backgroundColor: colors.border,
      marginRight: spacing.sm,
    },
    leagueSubtitle: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
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
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    teamRowRight: {
      justifyContent: "flex-end",
    },
    teamLogo: {
      width: 36,
      height: 36,
    },
    teamLogoSpacingRight: {
      marginRight: spacing.sm,
    },
    teamLogoSpacingLeft: {
      marginLeft: spacing.sm,
    },
    teamLogoPlaceholder: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    teamLogoPlaceholderText: {
      color: colors.muted.foreground,
      fontWeight: fontWeight.bold,
    },
    vsContainer: {
      alignItems: "center",
      paddingHorizontal: spacing.md,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    locationLabel: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
    },
    locationValue: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
      flex: 1,
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
    noMarketsContainer: {
      padding: spacing.xl,
      alignItems: "center",
    },
    noMarketsText: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
      textAlign: "center",
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
