import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DeviceMotion } from 'expo-sensors';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PeruOnlyGuard } from '@/components/peru-only-guard';
import { useTheme } from '@/context/theme-context';
import { spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function ShakeSensorScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [shakeCount, setShakeCount] = useState(0);
    const [lastShake, setLastShake] = useState<Date | null>(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (!isActive) return;

        let subscription: any;
        const SHAKE_THRESHOLD = 1.5; // Adjust sensitivity

        const startSensor = async () => {
            try {
                await DeviceMotion.setUpdateInterval(100);

                subscription = DeviceMotion.addListener((data) => {
                    const { acceleration } = data;
                    if (!acceleration) return;

                    const totalAcceleration = Math.sqrt(
                        acceleration.x ** 2 +
                        acceleration.y ** 2 +
                        acceleration.z ** 2
                    );

                    if (totalAcceleration > SHAKE_THRESHOLD) {
                        setShakeCount((prev) => prev + 1);
                        setLastShake(new Date());
                    }
                });
            } catch (error) {
                console.error('[ShakeSensor] Failed to start sensor:', error);
            }
        };

        startSensor();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, [isActive]);

    const toggleSensor = () => {
        setIsActive(!isActive);
        if (isActive) {
            setShakeCount(0);
            setLastShake(null);
        }
    };

    const resetCounter = () => {
        setShakeCount(0);
        setLastShake(null);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </Button>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                    Sensor de Movimiento
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Peru-only content */}
            <PeruOnlyGuard
                loadingMessage="Verificando ubicación para activar sensor..."
                deniedMessage="El sensor de movimiento solo está disponible en Perú"
            >
                <View style={styles.content}>
                    {/* Status Card */}
                    <Card style={[styles.statusCard, { backgroundColor: colors.card.DEFAULT }]}>
                        <View style={[
                            styles.statusIcon,
                            { backgroundColor: isActive ? colors.accent.DEFAULT + '20' : colors.muted.DEFAULT }
                        ]}>
                            <Ionicons
                                name={isActive ? "radio-button-on" : "radio-button-off"}
                                size={48}
                                color={isActive ? colors.accent.DEFAULT : colors.muted.foreground}
                            />
                        </View>

                        <Text style={[styles.statusText, { color: colors.foreground }]}>
                            {isActive ? 'Sensor Activo' : 'Sensor Inactivo'}
                        </Text>

                        <Text style={[styles.statusSubtext, { color: colors.muted.foreground }]}>
                            {isActive
                                ? 'Agita tu dispositivo para detectar movimiento'
                                : 'Presiona el botón para activar el sensor'}
                        </Text>
                    </Card>

                    {/* Shake Counter */}
                    <Card style={[styles.counterCard, { backgroundColor: colors.card.DEFAULT }]}>
                        <Text style={[styles.counterLabel, { color: colors.muted.foreground }]}>
                            Movimientos Detectados
                        </Text>
                        <Text style={[styles.counterValue, { color: colors.accent.DEFAULT }]}>
                            {shakeCount}
                        </Text>
                        {lastShake && (
                            <Text style={[styles.lastShakeText, { color: colors.muted.foreground }]}>
                                Último: {lastShake.toLocaleTimeString()}
                            </Text>
                        )}
                    </Card>

                    {/* Info Box */}
                    <View style={[styles.infoBox, { backgroundColor: colors.primary.DEFAULT + '15' }]}>
                        <Ionicons name="information-circle" size={20} color={colors.primary.DEFAULT} />
                        <Text style={[styles.infoText, { color: colors.foreground }]}>
                            Este sensor utiliza el acelerómetro de tu dispositivo para detectar movimientos bruscos.
                            Solo funciona en Perú por regulaciones locales.
                        </Text>
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <Button
                            variant={isActive ? "destructive" : "secondary"}
                            size="lg"
                            onPress={toggleSensor}
                            style={styles.controlButton}
                        >
                            <Ionicons
                                name={isActive ? "stop" : "play"}
                                size={20}
                                color={isActive ? colors.destructive.foreground : colors.secondary.foreground}
                            />
                            <Text style={{
                                marginLeft: spacing.sm,
                                color: isActive ? colors.destructive.foreground : colors.secondary.foreground
                            }}>
                                {isActive ? 'Detener Sensor' : 'Iniciar Sensor'}
                            </Text>
                        </Button>

                        {shakeCount > 0 && (
                            <Button
                                variant="outline"
                                size="lg"
                                onPress={resetCounter}
                                style={styles.controlButton}
                            >
                                <Ionicons name="refresh" size={20} color={colors.primary.DEFAULT} />
                                <Text style={{ marginLeft: spacing.sm, color: colors.primary.DEFAULT }}>
                                    Reiniciar Contador
                                </Text>
                            </Button>
                        )}
                    </View>

                    {/* Platform info */}
                    {Platform.OS === 'web' && (
                        <View style={[styles.warningBox, { backgroundColor: colors.destructive.DEFAULT + '15' }]}>
                            <Ionicons name="warning" size={20} color={colors.destructive.DEFAULT} />
                            <Text style={[styles.warningText, { color: colors.destructive.DEFAULT }]}>
                                El sensor de movimiento tiene funcionalidad limitada en navegadores web.
                                Para mejor experiencia, usa la app móvil.
                            </Text>
                        </View>
                    )}
                </View>
            </PeruOnlyGuard>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
        gap: spacing.lg,
    },
    statusCard: {
        padding: spacing.xl,
        alignItems: 'center',
        gap: spacing.md,
    },
    statusIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
    },
    statusSubtext: {
        fontSize: fontSize.sm,
        textAlign: 'center',
        maxWidth: 300,
    },
    counterCard: {
        padding: spacing.xl,
        alignItems: 'center',
        gap: spacing.sm,
    },
    counterLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    counterValue: {
        fontSize: 64,
        fontWeight: fontWeight.bold,
    },
    lastShakeText: {
        fontSize: fontSize.xs,
        fontStyle: 'italic',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: fontSize.sm,
        lineHeight: 20,
    },
    controls: {
        gap: spacing.md,
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    warningText: {
        flex: 1,
        fontSize: fontSize.sm,
        lineHeight: 20,
    },
});
