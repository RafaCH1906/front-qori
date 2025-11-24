import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Vibration,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/theme-context';
import { spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { promotionsApi, GiftReward } from '@/lib/api/promotions';
import { useAuth } from '@/context/AuthProvider';
import { AuthStorage } from '@/lib/auth/storage';

interface ShakeModalProps {
    visible: boolean;
    onClose: () => void;
}

export function ShakeModal({ visible, onClose }: ShakeModalProps) {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [shakeDetected, setShakeDetected] = useState(false);
    const [prizeRevealed, setPrizeRevealed] = useState(false);
    const [reward, setReward] = useState<GiftReward | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const prizeAnim = useRef(new Animated.Value(0)).current;

    const handleShake = async () => {
        if (!user) {
            setError('Debes iniciar sesión para abrir regalos');
            setPrizeRevealed(true);
            return;
        }
        const token = await AuthStorage.getToken();
        console.log('[SHAKE MODAL] Pre‑flight token check:', token ? 'Token exists' : 'TOKEN MISSING');
        if (!token) {
            console.error('[SHAKE MODAL] User is logged in but token is missing from storage!');
            setError('Error de sesión. Por favor, cierra sesión y vuelve a entrar.');
            setPrizeRevealed(true);
            return;
        }
        setLoading(true);
        Vibration.vibrate([0, 100, 50, 100]);
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start(() => {
            (async () => {
                try {
                    const rewardData = await promotionsApi.openGift();
                    setReward(rewardData);
                    setPrizeRevealed(true);
                    setError(null);
                    Vibration.vibrate([0, 200, 100, 200]);
                    Animated.spring(prizeAnim, { toValue: 1, useNativeDriver: true }).start();
                } catch (err: any) {
                    console.error('Error opening gift:', err);
                    setError(err.response?.data?.message || 'Error al abrir el regalo. Intenta de nuevo.');
                    setPrizeRevealed(true);
                } finally {
                    setLoading(false);
                    setShakeDetected(false);
                }
            })();
        });
    };

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }).start();
            if (Platform.OS !== 'web') {
                const subscription = Accelerometer.addListener(data => {
                    const { x, y, z } = data;
                    const acceleration = Math.sqrt(x * x + y * y + z * z);
                    if (acceleration > 2.5 && !shakeDetected && !loading) {
                        setShakeDetected(true);
                        handleShake();
                    }
                });
                Accelerometer.setUpdateInterval(100);
                return () => subscription.remove();
            }
        } else {
            scaleAnim.setValue(0);
            setShakeDetected(false);
            setPrizeRevealed(false);
            setReward(null);
            setError(null);
            prizeAnim.setValue(0);
        }
    }, [visible, shakeDetected, loading]);

    const handleClose = () => {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: colors.card.DEFAULT,
                            borderColor: colors.border,
                            transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
                        },
                    ]}
                >
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name="close" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    {!prizeRevealed ? (
                        <View style={styles.instructionContainer}>
                            <Text style={[styles.emoji, styles.giftEmoji]}>🎁</Text>
                            <Text style={[styles.title, { color: colors.foreground }]}>¡Agita tu teléfono!</Text>
                            <Text style={[styles.subtitle, { color: colors.muted.foreground }]}>Descubre tu sorpresa</Text>
                            {loading && (
                                <ActivityIndicator
                                    size="large"
                                    color={colors.primary.DEFAULT}
                                    style={{ marginTop: spacing.lg }}
                                />
                            )}
                        </View>
                    ) : error ? (
                        <View style={styles.prizeContainer}>
                            <Text style={[styles.emoji, styles.sparkleEmoji]}>⚠️</Text>
                            <Text style={[styles.prizeTitle, { color: '#ff6b6b' }]}>¡Ups!</Text>
                            <Text style={[styles.prizeDescription, { color: colors.muted.foreground }]}>{error}</Text>
                            <TouchableOpacity style={[styles.claimButton, { backgroundColor: colors.primary.DEFAULT }]} onPress={handleClose}>
                                <Text style={[styles.claimButtonText, { color: colors.primary.foreground }]}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : reward ? (
                        <Animated.View
                            style={[
                                styles.prizeContainer,
                                {
                                    opacity: prizeAnim,
                                    transform: [
                                        {
                                            scale: prizeAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.5, 1],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <Text style={[styles.emoji, styles.sparkleEmoji]}>✨</Text>
                            <Text style={[styles.prizeTitle, { color: colors.primary.DEFAULT }]}>¡Felicidades!</Text>
                            <Text style={[styles.prizeAmount, { color: colors.foreground }]}>{reward.rewardDescription}</Text>
                            <Text style={[styles.prizeDescription, { color: colors.muted.foreground }]}>{reward.message}</Text>
                            <TouchableOpacity style={[styles.claimButton, { backgroundColor: colors.primary.DEFAULT }]} onPress={handleClose}>
                                <Text style={[styles.claimButtonText, { color: colors.primary.foreground }]}>Reclamar Premio</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ) : null}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 8,
    },
    closeButton: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        zIndex: 10,
        padding: spacing.xs,
    },
    instructionContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    prizeContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    emoji: {
        fontSize: 80,
        marginBottom: spacing.lg,
    },
    giftEmoji: {
        marginTop: spacing.lg,
    },
    sparkleEmoji: {
        marginTop: spacing.md,
    },
    title: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fontSize.base,
        textAlign: 'center',
    },
    prizeTitle: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    prizeAmount: {
        fontSize: fontSize['3xl'],
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    prizeDescription: {
        fontSize: fontSize.sm,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    claimButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
        marginTop: spacing.md,
    },
    claimButtonText: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.bold,
        textAlign: 'center',
    },
});
