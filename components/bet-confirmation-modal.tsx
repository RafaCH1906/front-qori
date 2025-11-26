import React, { useMemo } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    spacing,
    borderRadius,
    fontSize,
    fontWeight,
    ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { Bet } from "@/context/betting-context";

interface BetConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    bets: Bet[];
    stake: number;
    totalOdds: number;
    potentialWinnings: number;
    balance: number;
    isLoading?: boolean;
    useFreeBet?: boolean;
}

export default function BetConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    bets,
    stake,
    totalOdds,
    potentialWinnings,
    balance,
    isLoading = false,
    useFreeBet = false,
}: BetConfirmationModalProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const insufficientBalance = !useFreeBet && stake > balance;
    const isCombinedBet = bets.length > 1;
    const betTypeLabel = isCombinedBet ? "Apuesta Combinada" : "Apuesta Simple";

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Card style={styles.card}>
                    <View style={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Confirmar Apuesta</Text>
                            <TouchableOpacity onPress={onClose} disabled={isLoading}>
                                <Ionicons name="close" size={24} color={colors.foreground} />
                            </TouchableOpacity>
                        </View>

                        {/* Bet Type Badge */}
                        <View style={[
                            styles.betTypeBadge,
                            isCombinedBet ? styles.combinedBadge : styles.simpleBadge
                        ]}>
                            <Ionicons
                                name={isCombinedBet ? "git-merge-outline" : "document-text-outline"}
                                size={16}
                                color={isCombinedBet ? colors.accent.DEFAULT : colors.primary.DEFAULT}
                            />
                            <Text style={[
                                styles.betTypeBadgeText,
                                isCombinedBet ? styles.combinedBadgeText : styles.simpleBadgeText
                            ]}>
                                {betTypeLabel}
                            </Text>
                        </View>

                        {/* Bet Summary */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tus Selecciones</Text>
                            {bets.map((bet, index) => (
                                <View key={bet.id} style={styles.betItem}>
                                    <View style={styles.betInfo}>
                                        <Text style={styles.matchText} numberOfLines={1}>
                                            {bet.match}
                                        </Text>
                                        <Text style={styles.betType}>
                                            {bet.label || bet.type}
                                        </Text>
                                    </View>
                                    <Text style={styles.oddsText}>{bet.odds.toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Financial Summary */}
                        <View style={styles.summarySection}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Cuota Total:</Text>
                                <Text style={styles.summaryValue}>{totalOdds.toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Monto Apostado:</Text>
                                <Text style={styles.summaryValue}>
                                    {useFreeBet ? "1 Apuesta Gratis" : `S/ ${stake.toFixed(2)}`}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tu Saldo:</Text>
                                <Text style={[
                                    styles.summaryValue,
                                    insufficientBalance && styles.errorText
                                ]}>
                                    S/ {balance.toFixed(2)}
                                </Text>
                            </View>
                            <View style={[styles.summaryRow, styles.summaryRowFinal]}>
                                <Text style={styles.summaryFinalLabel}>Ganancia Potencial:</Text>
                                <Text style={styles.summaryFinalValue}>
                                    {useFreeBet ? "Calculado al confirmar" : `S/ ${potentialWinnings.toFixed(2)}`}
                                </Text>
                            </View>
                        </View>

                        {/* Info for combined bets */}
                        {isCombinedBet && !insufficientBalance && (
                            <View style={styles.infoContainer}>
                                <Ionicons name="information-circle" size={20} color={colors.accent.DEFAULT} />
                                <Text style={styles.infoText}>
                                    En las apuestas combinadas, todas tus selecciones deben ganar para obtener la ganancia.
                                </Text>
                            </View>
                        )}

                        {/* Warning for insufficient balance */}
                        {insufficientBalance && (
                            <View style={styles.warningContainer}>
                                <Ionicons name="warning" size={20} color={colors.destructive.DEFAULT} />
                                <Text style={styles.warningText}>
                                    Saldo insuficiente. Por favor, deposita fondos para realizar esta apuesta.
                                </Text>
                            </View>
                        )}

                        {/* Actions */}
                        <View style={styles.actions}>
                            <Button
                                variant="outline"
                                size="lg"
                                onPress={onClose}
                                disabled={isLoading}
                                style={styles.cancelButton}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                onPress={onConfirm}
                                disabled={isLoading || insufficientBalance}
                                style={styles.confirmButton}
                            >
                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="small" color={colors.background} />
                                        <Text style={styles.loadingText}>Procesando...</Text>
                                    </View>
                                ) : (
                                    "Confirmar Apuesta"
                                )}
                            </Button>
                        </View>
                    </View>
                </Card>
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
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: spacing.lg,
        },
        card: {
            width: "100%",
            maxWidth: 500,
            backgroundColor: colors.card.DEFAULT,
        },
        content: {
            padding: spacing.xl,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.lg,
        },
        title: {
            fontSize: fontSize["2xl"],
            fontWeight: fontWeight.bold,
            color: colors.foreground,
        },
        section: {
            marginBottom: spacing.lg,
        },
        sectionTitle: {
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.muted.foreground,
            marginBottom: spacing.sm,
        },
        betItem: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        betInfo: {
            flex: 1,
            marginRight: spacing.md,
        },
        matchText: {
            fontSize: fontSize.sm,
            color: colors.foreground,
            marginBottom: 2,
        },
        betType: {
            fontSize: fontSize.xs,
            color: colors.muted.foreground,
        },
        oddsText: {
            fontSize: fontSize.base,
            fontWeight: fontWeight.bold,
            color: colors.accent.DEFAULT,
        },
        summarySection: {
            backgroundColor: colors.muted.DEFAULT,
            padding: spacing.md,
            borderRadius: borderRadius.md,
            marginBottom: spacing.lg,
        },
        summaryRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: spacing.xs,
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
            fontSize: fontSize.xl,
            fontWeight: fontWeight.bold,
            color: colors.accent.DEFAULT,
        },
        warningContainer: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            padding: spacing.md,
            borderRadius: borderRadius.md,
            marginBottom: spacing.lg,
            gap: spacing.sm,
        },
        warningText: {
            flex: 1,
            fontSize: fontSize.sm,
            color: colors.destructive.DEFAULT,
        },
        errorText: {
            color: colors.destructive.DEFAULT,
        },
        actions: {
            flexDirection: "row",
            gap: spacing.md,
        },
        cancelButton: {
            flex: 1,
        },
        confirmButton: {
            flex: 1,
        },
        loadingContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        loadingText: {
            color: colors.background,
            fontSize: fontSize.base,
            fontWeight: fontWeight.semibold,
        },
        betTypeBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.md,
            gap: spacing.xs,
            alignSelf: 'flex-start',
            marginBottom: spacing.md,
            borderWidth: 1.5,
        },
        simpleBadge: {
            backgroundColor: `${colors.primary.DEFAULT}15`,
            borderColor: `${colors.primary.DEFAULT}40`,
        },
        combinedBadge: {
            backgroundColor: `${colors.accent.DEFAULT}15`,
            borderColor: `${colors.accent.DEFAULT}40`,
        },
        betTypeBadgeText: {
            fontSize: fontSize.sm,
            fontWeight: fontWeight.bold,
        },
        simpleBadgeText: {
            color: colors.primary.DEFAULT,
        },
        combinedBadgeText: {
            color: colors.accent.DEFAULT,
        },
        infoContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            backgroundColor: `${colors.accent.DEFAULT}10`,
            padding: spacing.md,
            borderRadius: borderRadius.md,
            marginBottom: spacing.lg,
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: `${colors.accent.DEFAULT}30`,
        },
        infoText: {
            flex: 1,
            fontSize: fontSize.sm,
            color: colors.foreground,
            lineHeight: 20,
        },
    });
