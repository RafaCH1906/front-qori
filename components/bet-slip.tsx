import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  ThemeColors,
} from "@/constants/theme";
import { Bet } from "@/context/betting-context";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/AuthProvider";

interface BetSlipProps {
  bets: Bet[];
  onRemoveBet: (id: number) => void;
  onPlaceBet: (stake: number, bets: Bet[], useFreeBet?: boolean) => Promise<void>;
  showHeader?: boolean;
}

export default function BetSlip({
  bets,
  onRemoveBet,
  onPlaceBet,
  showHeader = true,
}: BetSlipProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [stake, setStake] = useState<string>("10");
  const [isPlacing, setIsPlacing] = useState(false);
  const [useFreeBet, setUseFreeBet] = useState(false);

  const handleQuickAmount = (amount: number) => {
    if (useFreeBet) return; // Cannot change amount when using free bet
    const currentStake = parseFloat(stake) || 0;
    setStake((currentStake + amount).toString());
  };

  // Determine if it's a simple or combined bet
  const isCombinedBet = bets.length > 1;
  const betTypeLabel = isCombinedBet ? "Apuesta Combinada" : "Apuesta Simple";

  const totalOdds =
    bets.length > 0 ? bets.reduce((acc, bet) => acc * bet.odds, 1) : 0;

  // If using free bet, stake is fixed (e.g., 1 free bet unit) or handled by backend
  // For display, we might show "1 Free Bet" or similar
  const displayStake = useFreeBet ? 0 : parseFloat(stake);
  const potentialWinnings = useFreeBet
    ? totalOdds * 10 // Assuming free bet value is fixed or calculated elsewhere, placeholder
    : displayStake * totalOdds;

  const handlePlaceBet = async () => {
    if (bets.length === 0 || (!useFreeBet && parseFloat(stake) <= 0) || isPlacing) return;

    setIsPlacing(true);
    try {
      await onPlaceBet(useFreeBet ? 0 : parseFloat(stake), bets, useFreeBet);
      setStake("10"); // Reset stake after successful bet
      setUseFreeBet(false);
    } catch (error) {
      // Error handled by parent
      console.error('[BetSlip] Failed to place bet:', error);
    } finally {
      setIsPlacing(false);
    }
  };

  const getTypeLabel = (bet: Bet) => {
    if (bet.label) return bet.label;

    switch (bet.type) {
      case "home":
        return "1 (Victoria Local)";
      case "draw":
        return "X (Empate)";
      case "away":
        return "2 (Victoria Visitante)";
      default:
        return bet.type;
    }
  };

  const getCategoryBadgeStyle = (betType: string) =>
    getBadgeStyles(betType, colors);

  const getCategoryLabel = (betType: string) => {
    switch (betType) {
      case "result":
        return "Resultado del Partido";
      case "goals":
        return "Goles";
      case "cards":
        return "Tarjetas";
      case "corners":
        return "Corners";
      case "shots":
        return "Tiros";
      default:
        return betType;
    }
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerText}>Mis Apuestas</Text>
        </View>
      )}

      {bets.length === 0 ? (
        <Card style={styles.card}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay apuestas seleccionadas</Text>
            <Text style={styles.emptySubText}>
              Selecciona cuotas de los partidos para agregar apuestas
            </Text>
          </View>
        </Card>
      ) : (
        <Card style={styles.card}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Bet Type Indicator */}
            <View style={[
              styles.betTypeIndicator,
              isCombinedBet ? styles.combinedBetIndicator : styles.simpleBetIndicator
            ]}>
              <Ionicons
                name={isCombinedBet ? "git-merge-outline" : "document-text-outline"}
                size={18}
                color={isCombinedBet ? colors.accent.DEFAULT : colors.primary.DEFAULT}
              />
              <Text style={[
                styles.betTypeText,
                isCombinedBet ? styles.combinedBetText : styles.simpleBetText
              ]}>
                {betTypeLabel}
              </Text>
              {isCombinedBet && (
                <Text style={styles.betTypeDescription}>
                  (Todas las selecciones deben ganar)
                </Text>
              )}
            </View>

            <View style={styles.betsContainer}>
              {bets.map((bet) => (
                <View key={bet.id} style={styles.betItem}>
                  <View style={styles.betContent}>
                    <View
                      style={[
                        styles.categoryBadge,
                        getCategoryBadgeStyle(bet.betType),
                      ]}
                    >
                      <Text style={styles.categoryText}>
                        {getCategoryLabel(bet.betType)}
                      </Text>
                    </View>
                    <Text style={styles.matchText} numberOfLines={1}>
                      {bet.match}
                    </Text>
                    <Text style={styles.betDetailsText}>
                      {getTypeLabel(bet)} @ {bet.odds.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => onRemoveBet(bet.id)}>
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={colors.destructive.DEFAULT}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.stakeContainer}>
              {/* Free Bet Toggle */}
              {user?.freeBetsCount && user.freeBetsCount > 0 && (
                <TouchableOpacity
                  style={[styles.freeBetToggle, useFreeBet && styles.freeBetToggleActive]}
                  onPress={() => {
                    setUseFreeBet(!useFreeBet);
                    if (!useFreeBet) setStake(""); // Clear stake when using free bet
                    else setStake("10"); // Restore default
                  }}
                >
                  <Ionicons name="gift" size={20} color={useFreeBet ? colors.primary.foreground : colors.primary.DEFAULT} />
                  <Text style={[styles.freeBetText, useFreeBet && styles.freeBetTextActive]}>
                    Usar Apuesta Gratis ({user.freeBetsCount} disponibles)
                  </Text>
                  {useFreeBet && <Ionicons name="checkmark-circle" size={20} color={colors.primary.foreground} />}
                </TouchableOpacity>
              )}

              {!useFreeBet && (
                <View style={styles.stakeSection}>
                  <Text style={styles.sectionLabel}>Monto a Apostar (Soles)</Text>
                  <Input
                    value={stake}
                    onChangeText={setStake}
                    placeholder="Ingresa el monto"
                    keyboardType="numeric"
                  />

                  <View style={styles.quickAmountsContainer}>
                    {[5, 20, 50, 100].map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        onPress={() => handleQuickAmount(amount)}
                        style={styles.quickAmountButton}
                      >
                        <Text style={styles.quickAmountText}>+{amount}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Cuota Total:</Text>
                  <Text style={styles.summaryValue}>{totalOdds.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Monto:</Text>
                  <Text style={styles.summaryValueNormal}>
                    {useFreeBet ? "1 Apuesta Gratis" : `S/ ${parseFloat(stake || "0").toFixed(2)}`}
                  </Text>
                </View>
                <View style={styles.summaryRowFinal}>
                  <Text style={styles.summaryFinalLabel}>Ganancia Potencial:</Text>
                  <Text style={styles.summaryFinalValue}>
                    {useFreeBet ? "Calculado al confirmar" : `S/ ${potentialWinnings.toFixed(2)}`}
                  </Text>
                </View>
              </View>

              <Button
                variant="secondary"
                size="lg"
                onPress={handlePlaceBet}
                disabled={bets.length === 0 || (!useFreeBet && parseFloat(stake) <= 0) || isPlacing}
              >
                <Text>{isPlacing ? "Procesando..." : "Realizar Apuesta"}</Text>
              </Button>
            </View>
          </ScrollView>
        </Card>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
      maxHeight: "100%",
    },
    card: {
      flex: 1,
      width: "100%",
      backgroundColor: colors.card.DEFAULT,
      borderRadius: borderRadius.lg,
      maxHeight: "100%",
    },
    header: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.primary.DEFAULT,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      marginBottom: spacing.sm,
    },
    headerText: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.primary.foreground,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    emptyText: {
      color: colors.muted.foreground,
      fontSize: fontSize.sm,
      textAlign: "center",
    },
    emptySubText: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
      marginTop: spacing.sm,
      textAlign: "center",
    },
    scrollView: {
      flex: 1,
      maxHeight: "100%",
    },
    scrollContent: {
      paddingBottom: spacing.lg,
      flexGrow: 1,
    },
    betsContainer: {
      padding: spacing.lg,
      gap: spacing.sm,
    },
    betItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      backgroundColor: colors.card.DEFAULT,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    betContent: {
      flex: 1,
    },
    categoryBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.md,
      alignSelf: "flex-start",
      marginBottom: 4,
      borderWidth: 1,
    },
    categoryText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    matchText: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
    },
    betDetailsText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: colors.foreground,
      marginTop: 4,
    },
    stakeContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
      backgroundColor: colors.card.DEFAULT,
    },
    stakeSection: {
      gap: spacing.sm,
    },
    sectionLabel: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    quickAmountsContainer: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    quickAmountButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    quickAmountText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.accent.DEFAULT,
    },
    summaryCard: {
      backgroundColor: colors.card.DEFAULT,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
    },
    summaryValue: {
      fontWeight: fontWeight.bold,
      color: colors.foreground,
      fontSize: fontSize.base,
    },
    summaryValueNormal: {
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    summaryRowFinal: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
      marginTop: 4,
    },
    summaryFinalLabel: {
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    summaryFinalValue: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: colors.accent.DEFAULT,
    },
    betTypeIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: borderRadius.lg,
      gap: spacing.sm,
      borderWidth: 2,
    },
    simpleBetIndicator: {
      backgroundColor: withAlpha(colors.primary.DEFAULT, 0.1),
      borderColor: withAlpha(colors.primary.DEFAULT, 0.3),
    },
    combinedBetIndicator: {
      backgroundColor: withAlpha(colors.accent.DEFAULT, 0.1),
      borderColor: withAlpha(colors.accent.DEFAULT, 0.3),
    },
    betTypeText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
    },
    simpleBetText: {
      color: colors.primary.DEFAULT,
    },
    combinedBetText: {
      color: colors.accent.DEFAULT,
    },
    betTypeDescription: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
      fontStyle: 'italic',
    },
    freeBetToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card.DEFAULT,
      borderWidth: 1,
      borderColor: colors.primary.DEFAULT,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    freeBetToggleActive: {
      backgroundColor: colors.primary.DEFAULT,
    },
    freeBetText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.primary.DEFAULT,
      flex: 1,
      marginLeft: spacing.sm,
    },
    freeBetTextActive: {
      color: colors.primary.foreground,
    },
  });

const getBadgeStyles = (betType: string, colors: ThemeColors) => {
  const map: Record<string, string> = {
    result: "#3B82F6", // Blue for "Resultado del Partido"
    goals: "#10B981", // Green for "Goles"
    cards: "#F59E0B", // Amber/Orange for "Tarjetas"
    corners: "#8B5CF6", // Purple for "Corners"
    shots: "#EF4444", // Red for "Tiros"
  };

  const baseColor = map[betType] ?? colors.muted.DEFAULT;
  return {
    backgroundColor: withAlpha(baseColor, 0.15),
    borderColor: withAlpha(baseColor, 0.4),
  };
};

const withAlpha = (hexColor: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hexColor);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const hexToRgb = (hexColor: string) => {
  const hex = hexColor.replace("#", "");
  const int = parseInt(hex, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};
