import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/AuthProvider";
import { getBetHistory } from "@/lib/api/bets";

type BetStatus = "PENDING" | "WON" | "LOST" | "VOID";

interface BetSelection {
  id: number;
  odds: number;
  state: string;
  option: {
    id: number;
    name: string;
    description: string;
  };
}

interface Bet {
  id: number;
  amount: number;
  date: string;
  state: BetStatus;
  betType: "SINGLE" | "COMBINED";
  totalOdds: number;
  selections: BetSelection[];
}

export default function BetHistoryScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<BetStatus | "ALL">("ALL");

  const fetchBets = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await getBetHistory(user.id);
      setBets(data);
    } catch (error) {
      console.error("Failed to fetch bet history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBets();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBets();
  }, [user]);

  const filteredBets = filter === "ALL"
    ? bets
    : bets.filter(bet => bet.state === filter);

  const getStatusColor = (status: BetStatus) => {
    switch (status) {
      case "WON":
        return colors.accent.DEFAULT;
      case "LOST":
        return colors.destructive.DEFAULT;
      case "PENDING":
        return colors.ring;
      case "VOID":
        return colors.muted.foreground;
      default:
        return colors.foreground;
    }
  };

  const getStatusLabel = (status: BetStatus) => {
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

  const getStatusIcon = (status: BetStatus) => {
    switch (status) {
      case "WON":
        return "checkmark-circle";
      case "LOST":
        return "close-circle";
      case "PENDING":
        return "time";
      case "VOID":
        return "ban";
      default:
        return "help-circle";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Por favor, inicia sesión para ver tu historial de apuestas
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Apuestas</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {["ALL", "PENDING", "WON", "LOST", "VOID"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(status as BetStatus | "ALL")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === status && styles.filterButtonTextActive,
              ]}
            >
              {status === "ALL" ? "Todas" : getStatusLabel(status as BetStatus)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bets List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          <Text style={styles.loadingText}>Cargando apuestas...</Text>
        </View>
      ) : filteredBets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.muted.foreground} />
          <Text style={styles.emptyText}>
            {filter === "ALL"
              ? "No tienes apuestas registradas"
              : `No tienes apuestas ${getStatusLabel(filter as BetStatus).toLowerCase()}`}
          </Text>
          <Text style={styles.emptySubText}>
            Comienza a apostar en tus partidos favoritos
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredBets.map((bet) => (
            <Card key={bet.id} style={styles.betCard}>
              {/* Bet Header */}
              <View style={styles.betHeader}>
                <View style={styles.betHeaderLeft}>
                  <Text style={styles.betId}>#{bet.id}</Text>
                  <View
                    style={[
                      styles.betTypeBadge,
                      bet.betType === "COMBINED"
                        ? styles.combinedBadge
                        : styles.simpleBadge,
                    ]}
                  >
                    <Text style={styles.betTypeBadgeText}>
                      {bet.betType === "COMBINED" ? "Combinada" : "Simple"}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(bet.state)}20` }]}>
                  <Ionicons
                    name={getStatusIcon(bet.state) as any}
                    size={16}
                    color={getStatusColor(bet.state)}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(bet.state) }]}>
                    {getStatusLabel(bet.state)}
                  </Text>
                </View>
              </View>

              {/* Bet Selections */}
              <View style={styles.selectionsContainer}>
                {bet.selections.map((selection, index) => (
                  <View key={selection.id} style={styles.selectionItem}>
                    <View style={styles.selectionInfo}>
                      <Text style={styles.selectionDescription}>
                        {selection.option.description}
                      </Text>
                      <Text style={styles.selectionName}>
                        {selection.option.name}
                      </Text>
                    </View>
                    <Text style={styles.selectionOdds}>{selection.odds.toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              {/* Bet Summary */}
              <View style={styles.betSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Cuota Total:</Text>
                  <Text style={styles.summaryValue}>{bet.totalOdds.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Monto Apostado:</Text>
                  <Text style={styles.summaryValue}>S/ {bet.amount.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowFinal]}>
                  <Text style={styles.summaryFinalLabel}>
                    {bet.state === "WON" ? "Ganancia:" : "Ganancia Potencial:"}
                  </Text>
                  <Text style={[
                    styles.summaryFinalValue,
                    bet.state === "WON" && { color: colors.accent.DEFAULT }
                  ]}>
                    S/ {(bet.amount * bet.totalOdds).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Bet Date */}
              <View style={styles.betFooter}>
                <Ionicons name="time-outline" size={14} color={colors.muted.foreground} />
                <Text style={styles.betDate}>{formatDate(bet.date)}</Text>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: spacing.lg,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: colors.foreground,
    },
    filterContainer: {
      maxHeight: 60,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterContent: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    filterButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card.DEFAULT,
    },
    filterButtonActive: {
      backgroundColor: colors.accent.DEFAULT,
      borderColor: colors.accent.DEFAULT,
    },
    filterButtonText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.muted.foreground,
    },
    filterButtonTextActive: {
      color: colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
    },
    loadingText: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },
    emptyCard: {
      padding: spacing.xl,
      alignItems: "center",
    },
    emptyText: {
      fontSize: fontSize.base,
      color: colors.muted.foreground,
      textAlign: "center",
      marginTop: spacing.md,
    },
    emptySubText: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
      textAlign: "center",
      marginTop: spacing.xs,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    betCard: {
      padding: spacing.lg,
      backgroundColor: colors.card.DEFAULT,
    },
    betHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    betHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    betId: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: colors.foreground,
    },
    betTypeBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.md,
    },
    simpleBadge: {
      backgroundColor: `${colors.primary.DEFAULT}20`,
    },
    combinedBadge: {
      backgroundColor: `${colors.accent.DEFAULT}20`,
    },
    betTypeBadgeText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.md,
    },
    statusText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
    },
    selectionsContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
      marginBottom: spacing.md,
    },
    selectionItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.sm,
    },
    selectionInfo: {
      flex: 1,
    },
    selectionDescription: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
    },
    selectionName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    selectionOdds: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.bold,
      color: colors.accent.DEFAULT,
    },
    betSummary: {
      backgroundColor: colors.muted.DEFAULT,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
      marginBottom: spacing.md,
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
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    summaryRowFinal: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
      marginTop: spacing.xs,
    },
    summaryFinalLabel: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
    },
    summaryFinalValue: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.foreground,
    },
    betFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    betDate: {
      fontSize: fontSize.xs,
      color: colors.muted.foreground,
    },
  });
