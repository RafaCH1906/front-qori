import React, { useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
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

interface MatchBettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    time: string;
    odds: { home: number; draw: number; away: number };
  };
}

export default function MatchBettingModal({
  isOpen,
  onClose,
  match,
}: MatchBettingModalProps) {
  const { colors } = useTheme();
  const { addBet, selectedBets } = useBetting();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isBetSelected = (category: BetCategoryKey, value: string) => {
    return selectedBets.some(
      (bet) =>
        bet.matchId === match.id &&
        bet.type === value &&
        bet.betType === category
    );
  };

  const handleAddBet = (
    category: BetCategoryKey,
    option: { label: string; odds: number; value: string }
  ) => {
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

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.timeText}>{match.time}</Text>
              <Text style={styles.matchTitle}>
                {match.homeTeam} vs {match.awayTeam}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
          >
            {Object.entries(BET_OPTIONS).map(([key, config]) => (
              <View key={key} style={styles.section}>
                <Text style={styles.sectionTitle}>{config.label}</Text>
                <View style={styles.sectionGrid}>
                  {config.options.map((option) => {
                    const isSelected = isBetSelected(
                      key as BetCategoryKey,
                      option.value
                    );
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          handleAddBet(key as BetCategoryKey, option)
                        }
                      >
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text
                          style={[
                            styles.optionOdds,
                            isSelected && styles.optionOddsSelected,
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
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.doneButton}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      padding: spacing.lg,
    },
    modalContainer: {
      width: "100%",
      maxWidth: 600,
      maxHeight: "90%",
      backgroundColor: colors.card.DEFAULT,
      borderRadius: borderRadius.xl,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card.DEFAULT,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.muted.DEFAULT,
    },
    timeText: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: spacing.xs,
    },
    matchTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: colors.foreground,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    section: {
      backgroundColor: colors.background,
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
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.card.DEFAULT,
      alignItems: "center",
    },
    optionCardSelected: {
      backgroundColor: "#FDB81E",
      borderColor: "#FDB81E",
    },
    optionLabel: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.foreground,
    },
    optionLabelSelected: {
      color: "#1E293B",
    },
    optionOdds: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.accent.DEFAULT,
      marginTop: spacing.xs,
    },
    optionOddsSelected: {
      color: "#1E293B",
    },
    footer: {
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card.DEFAULT,
    },
    doneButton: {
      backgroundColor: colors.primary.DEFAULT,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: "center",
    },
    doneButtonText: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: colors.primary.foreground,
    },
  });
