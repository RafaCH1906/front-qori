import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius, fontSize, fontWeight, ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/AuthProvider";
import { getBetHistory } from "@/lib/api/bets";

interface BetSelection {
  id: number;
  description: string;
  marketType: string;
  optionName: string;
  odds: number;
}

interface RecentBet {
  id: number;
  event: string;
  odds: number;
  stake: number;
  status: "WON" | "LOST" | "PENDING" | "VOID";
  placedAt: string;
  potentialWinnings: number;
  selections: BetSelection[];
  betType: string;
}

interface RecentBetsPanelProps {
  showInPanel?: boolean;
}

export default function RecentBetsPanel({ showInPanel = false }: RecentBetsPanelProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [recentBets, setRecentBets] = useState<RecentBet[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('[RecentBetsPanel] Component mounted with user:', {
    id: user?.id,
    username: user?.username,
    email: user?.email
  });

  useEffect(() => {
    if (user) {
      loadRecentBets();
    }
  }, [user]);

  const loadRecentBets = async () => {
    if (!user) return;
    
    console.log('[RecentBetsPanel] Loading bets for authenticated user:', {
      id: user.id,
      username: user.username,
      email: user.email
    });
    
    try {
      setLoading(true);
      const bets = await getBetHistory(); // Ya no necesita userId, usa el token
      console.log("Raw bet history from API:", bets);
      
      // Get the most recent bets (limited to last 10)
      const recentBetsData = bets.slice(0, 10);
      
      const formattedBets: RecentBet[] = recentBetsData.map((bet: any) => {
        console.log("Formatting bet:", bet);
        console.log("Bet selections:", JSON.stringify(bet.selections, null, 2));
        
        // Calculate potential winnings
        const stake = bet.totalStake || bet.amount || 0;
        const odds = bet.totalOdds || bet.odds || 0;
        const potentialWin = stake * odds;
        
        // Format selections
        const selections = (bet.selections || []).map((sel: any) => {
          console.log("Processing selection:", JSON.stringify(sel, null, 2));
          
          // Extract option name and line
          let optionName = sel.option?.name || sel.optionName || "";
          const line = sel.option?.line || null;
          
          // Format option name to be more readable with line value
          if (optionName.includes("OVER")) {
            if (line !== null && line !== 0) {
              optionName = `Más de ${line}`;
            } else {
              const value = optionName.replace("OVER_", "").replace("_", ".");
              optionName = `Más de ${value}`;
            }
          } else if (optionName.includes("UNDER")) {
            if (line !== null && line !== 0) {
              optionName = `Menos de ${line}`;
            } else {
              const value = optionName.replace("UNDER_", "").replace("_", ".");
              optionName = `Menos de ${value}`;
            }
          } else if (optionName.includes("_")) {
            optionName = optionName.replace(/_/g, " ");
          }
          
          // Build description from market
          let marketDescription = "";
          if (sel.option?.market) {
            const market = sel.option.market;
            const marketDesc = market.description || market.type || "";
            
            // Translate common market types
            if (marketDesc.includes("TOTAL_GOALS") || marketDesc.toLowerCase().includes("gol")) {
              marketDescription = "Total de Goles";
            } else if (marketDesc.includes("TOTAL_CARDS") || marketDesc.toLowerCase().includes("tarjeta")) {
              marketDescription = "Total de Tarjetas";
            } else if (marketDesc.includes("TOTAL_CORNERS") || marketDesc.toLowerCase().includes("corner")) {
              marketDescription = "Total de Córners";
            } else if (marketDesc.includes("TOTAL_SHOTS") || marketDesc.toLowerCase().includes("disparo")) {
              marketDescription = "Total de Disparos";
            } else {
              marketDescription = marketDesc;
            }
          }
          
          // Get match and league info
          let matchInfo = "";
          let leagueInfo = "";
          
          if (sel.option?.market?.match) {
            const match = sel.option.market.match;
            const teamLocal = match.teamLocal?.name || "Local";
            const teamAway = match.teamAway?.name || "Visitante";
            matchInfo = `${teamLocal} vs ${teamAway}`;
            
            if (match.league?.name) {
              leagueInfo = match.league.name;
            }
          }
          
          // Build full description
          let fullDescription = "";
          if (leagueInfo) {
            fullDescription = `${leagueInfo}\n${matchInfo}`;
          } else if (matchInfo) {
            fullDescription = matchInfo;
          } else {
            fullDescription = "Partido sin información";
          }
          
          return {
            id: sel.id,
            description: fullDescription,
            marketType: marketDescription || "Mercado",
            optionName: optionName || "Opción",
            odds: sel.odds || sel.odd || 0,
          };
        });
        
        return {
          id: bet.id,
          event: bet.selections?.[0]?.option?.market?.match?.teamLocal?.name 
            ? `${bet.selections[0].option.market.match.teamLocal.name} vs ${bet.selections[0].option.market.match.teamAway.name}`
            : "Partido",
          odds: odds,
          stake: stake,
          status: bet.state || bet.status || "PENDING",
          placedAt: bet.date || bet.createdAt || new Date().toISOString(),
          potentialWinnings: potentialWin,
          selections: selections,
          betType: bet.betType || (selections.length > 1 ? "COMBINED" : "SIMPLE"),
        };
      });

      console.log("Formatted bets:", formattedBets);
      setRecentBets(formattedBets);
    } catch (error: any) {
      console.error("Error loading recent bets:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 403) {
        console.error("[RecentBetsPanel] 403 Forbidden - User may not have permission");
        console.error("[RecentBetsPanel] This usually means:");
        console.error("  1. The user ID in the token doesn't match the requested user ID");
        console.error("  2. The backend authentication.principal.id is not returning the correct ID");
        console.error("  3. Solution: Check that CustomUserDetails.getId() returns the correct user ID");
      }
      setRecentBets([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WON":
        return "#10B981"; // Green
      case "LOST":
        return "#EF4444"; // Red
      case "PENDING":
        return "#F59E0B"; // Orange
      case "VOID":
        return "#6B7280"; // Gray
      default:
        return colors.muted.foreground;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "WON":
        return "Ganada";
      case "LOST":
        return "Perdida";
      case "PENDING":
        return "Pendiente";
      case "VOID":
        return "Anulada";
      default:
        return status;
    }
  };

  if (!user) {
    return null;
  }

  const styles = createStyles(colors, showInPanel);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Apuestas</Text>
        <TouchableOpacity
          onPress={() => router.push("/bet-history")}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>Ver Todas</Text>
          <Ionicons name="chevron-forward" size={16} color={showInPanel ? colors.foreground : "#1E293B"} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={showInPanel ? colors.foreground : "#1E293B"} />
        </View>
      ) : recentBets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={48} color={showInPanel ? colors.muted.foreground : "rgba(30, 41, 59, 0.4)"} />
          <Text style={styles.emptyText}>No hay apuestas recientes</Text>
          <Text style={styles.emptySubtext}>Tus últimas apuestas aparecerán aquí</Text>
        </View>
      ) : (
        <ScrollView style={styles.betsList} showsVerticalScrollIndicator={false}>
          {recentBets.map((bet) => (
            <TouchableOpacity
              key={bet.id}
              style={styles.betCard}
              onPress={() => router.push("/bet-history")}
              activeOpacity={0.7}
            >
              {/* Event Name */}
              <View style={styles.eventHeader}>
                <Text style={styles.eventName} numberOfLines={1}>
                  {bet.event}
                </Text>
                {bet.status !== "PENDING" && (
                  <View style={[styles.resultBadge, { backgroundColor: getStatusColor(bet.status) + "20" }]}>
                    <Text style={[styles.resultText, { color: getStatusColor(bet.status) }]}>
                      {getStatusText(bet.status)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Bet Selections */}
              <View style={styles.selectionsContainer}>
                {bet.selections.length === 0 ? (
                  <Text style={styles.noSelectionText}>Sin información de selección</Text>
                ) : (
                  bet.selections.map((selection, idx) => (
                    <View key={selection.id} style={styles.selectionRow}>
                      <View style={styles.selectionInfo}>
                        {/* Match and League */}
                        <Text style={styles.selectionDescription} numberOfLines={2}>
                          {selection.description}
                        </Text>
                        {/* Market Type and Option */}
                        <Text style={styles.selectionMarket}>
                          {selection.marketType}: <Text style={styles.selectionOption}>{selection.optionName}</Text>
                        </Text>
                      </View>
                      <Text style={styles.selectionOdds}>{selection.odds.toFixed(2)}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Bet Details Row */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Cuota</Text>
                  <Text style={styles.detailValue}>{bet.odds.toFixed(2)}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Monto</Text>
                  <Text style={styles.detailValue}>S/ {bet.stake.toFixed(2)}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Estado</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bet.status) + "20" }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(bet.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(bet.status) }]}>
                      {getStatusText(bet.status)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Potential Winnings for Pending Bets */}
              {bet.status === "PENDING" && (
                <View style={styles.winningsRow}>
                  <Text style={styles.winningsLabel}>Ganancia Potencial:</Text>
                  <Text style={styles.winningsValue}>S/ {bet.potentialWinnings.toFixed(2)}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors, showInPanel: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: "transparent",
      borderRadius: borderRadius.xl,
      padding: 0,
      borderWidth: 0,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 2,
      borderBottomColor: showInPanel ? colors.border : "rgba(30, 41, 59, 0.2)",
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: showInPanel ? colors.foreground : "#1E293B",
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs / 2,
    },
    viewAllText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: showInPanel ? colors.accent.DEFAULT : "#1E293B",
    },
    loadingContainer: {
      padding: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyContainer: {
      padding: spacing.xl * 2,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    emptyText: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      color: showInPanel ? colors.foreground : "#1E293B",
      marginTop: spacing.md,
    },
    emptySubtext: {
      fontSize: fontSize.sm,
      color: showInPanel ? colors.muted.foreground : "rgba(30, 41, 59, 0.7)",
      textAlign: "center",
    },
    betsList: {
      maxHeight: 400,
    },
    betCard: {
      backgroundColor: showInPanel ? colors.card.DEFAULT : "rgba(255, 255, 255, 0.9)",
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: showInPanel ? colors.border : "rgba(30, 41, 59, 0.1)",
    },
    eventHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    eventName: {
      flex: 1,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: showInPanel ? colors.foreground : "#1E293B",
    },
    resultBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.md,
      marginLeft: spacing.xs,
    },
    resultText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    selectionsContainer: {
      gap: spacing.xs,
      marginBottom: spacing.sm,
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: showInPanel ? colors.border : "rgba(30, 41, 59, 0.1)",
    },
    selectionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    selectionInfo: {
      flex: 1,
      gap: 2,
    },
    selectionDescription: {
      fontSize: fontSize.xs,
      color: showInPanel ? colors.muted.foreground : "rgba(30, 41, 59, 0.6)",
      lineHeight: fontSize.xs * 1.3,
      marginBottom: 2,
    },
    selectionMarket: {
      fontSize: fontSize.xs,
      color: showInPanel ? colors.muted.foreground : "rgba(30, 41, 59, 0.7)",
    },
    selectionOption: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: showInPanel ? colors.accent.DEFAULT : "#3B82F6",
    },
    selectionOdds: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: showInPanel ? colors.foreground : "#1E293B",
    },
    noSelectionText: {
      fontSize: fontSize.xs,
      color: showInPanel ? colors.muted.foreground : "rgba(30, 41, 59, 0.5)",
      fontStyle: "italic",
    },
    detailsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    detailItem: {
      flex: 1,
      gap: spacing.xs / 2,
    },
    detailLabel: {
      fontSize: fontSize.xs,
      color: showInPanel ? colors.muted.foreground : "rgba(30, 41, 59, 0.6)",
    },
    detailValue: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: showInPanel ? colors.foreground : "#1E293B",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs / 2,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.md,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    winningsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: showInPanel ? colors.border : "rgba(30, 41, 59, 0.1)",
    },
    winningsLabel: {
      fontSize: fontSize.xs,
      color: showInPanel ? colors.muted.foreground : "rgba(30, 41, 59, 0.6)",
    },
    winningsValue: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: "#10B981",
    },
  });
