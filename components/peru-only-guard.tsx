import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/theme-context';
import { spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { usePeruOnly } from '@/hooks/usePeruOnly';

interface PeruOnlyGuardProps {
    children: React.ReactNode;
    loadingMessage?: string;
    deniedMessage?: string;
    showRetry?: boolean;
}

export function PeruOnlyGuard({
    children,
    loadingMessage = 'Verificando ubicación...',
    deniedMessage = 'Esta función solo está disponible en Perú',
    showRetry = true,
}: PeruOnlyGuardProps) {
    const { colors } = useTheme();
    const { isAvailable, isLoading, error, checkAgain, countryCode } = usePeruOnly();

    // Loading state
    if (isLoading) {
        return (
            <Card style={[styles.container, { backgroundColor: colors.card.DEFAULT }]}>
                <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                <Text style={[styles.message, { color: colors.foreground }]}>
                    {loadingMessage}
                </Text>
            </Card>
        );
    }

    // Feature available - render children
    if (isAvailable) {
        return <>{children}</>;
    }

    // Not in Peru or error occurred
    return (
        <Card style={[styles.container, { backgroundColor: colors.card.DEFAULT }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.destructive.DEFAULT + '20' }]}>
                <Ionicons name="location-outline" size={48} color={colors.destructive.DEFAULT} />
            </View>

            <Text style={[styles.title, { color: colors.foreground }]}>
                Función No Disponible
            </Text>

            <Text style={[styles.message, { color: colors.muted.foreground }]}>
                {error || deniedMessage}
            </Text>

            {countryCode && countryCode !== 'PE' && (
                <Text style={[styles.detailText, { color: colors.muted.foreground }]}>
                    Ubicación detectada: {countryCode}
                </Text>
            )}

            {showRetry && (
                <Button
                    variant="outline"
                    size="lg"
                    onPress={checkAgain}
                    style={styles.retryButton}
                >
                    <Ionicons name="refresh" size={20} color={colors.primary.DEFAULT} />
                    <Text style={{ marginLeft: spacing.sm, color: colors.primary.DEFAULT }}>
                        Verificar Nuevamente
                    </Text>
                </Button>
            )}

            <View style={[styles.infoBox, { backgroundColor: colors.muted.DEFAULT }]}>
                <Ionicons name="information-circle" size={20} color={colors.accent.DEFAULT} />
                <Text style={[styles.infoText, { color: colors.foreground }]}>
                    Esta función requiere que te encuentres en Perú para poder activarse.
                </Text>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        gap: spacing.lg,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        textAlign: 'center',
    },
    message: {
        fontSize: fontSize.base,
        textAlign: 'center',
        maxWidth: 400,
    },
    detailText: {
        fontSize: fontSize.sm,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    retryButton: {
        marginTop: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        marginTop: spacing.lg,
        maxWidth: 400,
    },
    infoText: {
        flex: 1,
        fontSize: fontSize.sm,
        lineHeight: 20,
    },
});
