import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from '@/context/theme-context';
import { getBetHistory } from '@/lib/api/bets';
import {
    spacing,
    borderRadius,
    fontSize,
    fontWeight,
    ThemeColors,
} from '@/constants/theme';

interface BetHistorySummaryProps {
    maxBets?: number;
}

export default function BetHistorySummary({ maxBets = 3 }: BetHistorySummaryProps) {
    const { user } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [recentBets, setRecentBets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchRecentBets = async () => {
            try {
                setLoading(true);
                const bets = await getBetHistory(user.id);
                setRecentBets(bets.slice(0, maxBets));
            } catch (error) {
                console.error('Failed to fetch recent bets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentBets();
    }, [user, maxBets]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WON':
                return colors.accent.DEFAULT;
            case 'LOST':
                return colors.destructive.DEFAULT;
            case 'PENDING':
                return colors.ring;
            default:
                return colors.muted.foreground;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'WON':
                return 'Ganada';
            case 'LOST':
                return 'Perdida';
            case 'PENDING':
                return 'Pendiente';
            case 'VOID':
                return 'Anulada';
            default:
                return status;
        }
    };

    if (!user) {
        return (
            <Card style={styles.loginPrompt}>
                <Ionicons name="lock-closed-outline" size={32} color={colors.muted.foreground} />
                <Text style={styles.loginText}>Inicia sesión para ver tus apuestas</Text>
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => router.push('/')}
                >
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                </View>
            </Card>
        );
    }

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mis Apuestas Recientes</Text>
                <TouchableOpacity onPress={() => router.push('/bet-history')}>
                    <Text style={styles.viewAll}>Ver Todas →</Text>
                </TouchableOpacity>
            </View>

            {recentBets.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={32} color={colors.muted.foreground} />
                    <Text style={styles.emptyText}>No tienes apuestas aún</Text>
                    <Text style={styles.emptySubText}>Comienza a apostar en tus partidos favoritos</Text>
                </View>
            ) : (
                <View style={styles.betsContainer}>
                    {recentBets.map((bet) => (
                        <TouchableOpacity
                            key={bet.id}
                            style={styles.betItem}
                            onPress={() => router.push('/bet-history')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.betInfo}>
                                <Text style={styles.betId}>#{bet.id}</Text>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: `${getStatusColor(bet.state || bet.status)}20` }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: getStatusColor(bet.state || bet.status) }
                                    ]}>
                                        {getStatusLabel(bet.state || bet.status)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.betDetails}>
                                <Text style={styles.betAmount}>
                                    S/ {bet.totalStake?.toFixed(2) || bet.amount?.toFixed(2)}
                                </Text>
                                <Text style={styles.betOdds}>
                                    Cuota: {bet.totalOdds?.toFixed(2)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </Card>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            padding: spacing.lg,
            marginBottom: spacing.md,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
        },
        title: {
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            color: colors.foreground,
        },
        viewAll: {
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.primary.DEFAULT,
        },
        loginPrompt: {
            padding: spacing.xl,
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.md,
        },
        loginText: {
            fontSize: fontSize.base,
            color: colors.muted.foreground,
            textAlign: 'center',
        },
        loginButton: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            backgroundColor: colors.primary.DEFAULT,
            borderRadius: borderRadius.md,
        },
        loginButtonText: {
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.primary.foreground,
        },
        loadingContainer: {
            padding: spacing.lg,
            alignItems: 'center',
        },
        emptyContainer: {
            padding: spacing.lg,
            alignItems: 'center',
            gap: spacing.sm,
        },
        emptyText: {
            fontSize: fontSize.base,
            fontWeight: fontWeight.medium,
            color: colors.foreground,
        },
        emptySubText: {
            fontSize: fontSize.sm,
            color: colors.muted.foreground,
            textAlign: 'center',
        },
        betsContainer: {
            gap: spacing.sm,
        },
        betItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing.md,
            backgroundColor: colors.muted.DEFAULT,
            borderRadius: borderRadius.md,
        },
        betInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        betId: {
            fontSize: fontSize.sm,
            fontWeight: fontWeight.bold,
            color: colors.foreground,
        },
        statusBadge: {
            paddingHorizontal: spacing.sm,
            paddingVertical: 4,
            borderRadius: borderRadius.sm,
        },
        statusText: {
            fontSize: fontSize.xs,
            fontWeight: fontWeight.semibold,
        },
        betDetails: {
            alignItems: 'flex-end',
        },
        betAmount: {
            fontSize: fontSize.base,
            fontWeight: fontWeight.bold,
            color: colors.foreground,
        },
        betOdds: {
            fontSize: fontSize.xs,
            color: colors.muted.foreground,
        },
    });
