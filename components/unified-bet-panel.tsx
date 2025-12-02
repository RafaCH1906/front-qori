import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { spacing, borderRadius, fontSize, fontWeight, ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import BetSlip from "./bet-slip";
import RecentBetsPanel from "./recent-bets-panel";

interface UnifiedBetPanelProps {
  bets: any[];
  onRemoveBet: (matchId: number, betType?: string) => void;
  onPlaceBet: (stake: number, bets: any[], useFreeBet?: boolean) => void;
}

type TabType = "create" | "history";

export default function UnifiedBetPanel({ bets, onRemoveBet, onPlaceBet }: UnifiedBetPanelProps) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header with yellow background - ALWAYS VISIBLE */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Mis Apuestas</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "create" && styles.tabActive]}
          onPress={() => setActiveTab("create")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "create" && styles.tabTextActive]}>
            Realizar Apuesta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.tabActive]}
          onPress={() => setActiveTab("history")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>
            Historial de Apuestas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === "create" ? (
          <BetSlip
            bets={bets}
            onRemoveBet={onRemoveBet}
            onPlaceBet={onPlaceBet}
            showHeader={false}
          />
        ) : (
          <View style={styles.historyWrapper}>
            <RecentBetsPanel showInPanel={true} />
          </View>
        )}
      </View>
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
    header: {
      padding: spacing.lg,
      backgroundColor: colors.primary.DEFAULT, // Yellow background
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
    },
    headerText: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.primary.foreground, // Dark text on yellow
    },
    tabNavigation: {
      flexDirection: "row",
      backgroundColor: colors.card.DEFAULT,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.muted.DEFAULT,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabActive: {
      backgroundColor: colors.card.DEFAULT,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary.DEFAULT, // Yellow underline for active tab
    },
    tabText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.muted.foreground,
    },
    tabTextActive: {
      color: colors.foreground,
      fontWeight: fontWeight.bold,
    },
    tabContent: {
      flex: 1,
      backgroundColor: colors.card.DEFAULT,
    },
    historyWrapper: {
      flex: 1,
      padding: spacing.md,
    },
  });
