import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/theme-context';
import { spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';

interface LocationPermissionModalProps {
    isOpen: boolean;
    onAllow: () => void;
    onDeny: () => void;
    featureName?: string;
}

export function LocationPermissionModal({
    isOpen,
    onAllow,
    onDeny,
    featureName = 'esta función',
}: LocationPermissionModalProps) {
    const { colors } = useTheme();

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={onDeny}
        >
            <View style={styles.overlay}>
                <Card style={[styles.card, { backgroundColor: colors.card.DEFAULT }]}>
                    <View style={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={[styles.iconCircle, { backgroundColor: colors.primary.DEFAULT + '20' }]}>
                                <Ionicons name="location" size={32} color={colors.primary.DEFAULT} />
                            </View>
                            <TouchableOpacity onPress={onDeny} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.foreground} />
                            </TouchableOpacity>
                        </View>

                        {/* Title */}
                        <Text style={[styles.title, { color: colors.foreground }]}>
                            Permiso de Ubicación
                        </Text>

                        {/* Description */}
                        <Text style={[styles.description, { color: colors.muted.foreground }]}>
                            Para usar {featureName}, necesitamos verificar que te encuentras en Perú.
                        </Text>

                        {/* Features list */}
                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.accent.DEFAULT} />
                                <Text style={[styles.featureText, { color: colors.foreground }]}>
                                    Solo verificamos tu país
                                </Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.accent.DEFAULT} />
                                <Text style={[styles.featureText, { color: colors.foreground }]}>
                                    No guardamos tu ubicación
                                </Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.accent.DEFAULT} />
                                <Text style={[styles.featureText, { color: colors.foreground }]}>
                                    Función exclusiva para Perú
                                </Text>
                            </View>
                        </View>

                        {/* Info box */}
                        <View style={[styles.infoBox, { backgroundColor: colors.muted.DEFAULT }]}>
                            <Ionicons name="information-circle" size={18} color={colors.accent.DEFAULT} />
                            <Text style={[styles.infoText, { color: colors.foreground }]}>
                                Esta verificación es necesaria para cumplir con regulaciones locales.
                            </Text>
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <Button
                                variant="outline"
                                size="lg"
                                onPress={onDeny}
                                style={styles.denyButton}
                            >
                                No Permitir
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                onPress={onAllow}
                                style={styles.allowButton}
                            >
                                Permitir Ubicación
                            </Button>
                        </View>
                    </View>
                </Card>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: spacing.lg,
    },
    card: {
        width: '100%',
        maxWidth: 500,
    },
    content: {
        padding: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        padding: spacing.sm,
    },
    title: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
    },
    description: {
        fontSize: fontSize.base,
        lineHeight: 24,
        marginBottom: spacing.lg,
    },
    featuresList: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    featureText: {
        fontSize: fontSize.sm,
        flex: 1,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    infoText: {
        flex: 1,
        fontSize: fontSize.xs,
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    denyButton: {
        flex: 1,
    },
    allowButton: {
        flex: 1,
    },
});
