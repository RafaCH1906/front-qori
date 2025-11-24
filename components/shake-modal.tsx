import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Vibration,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/theme-context';
import { spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';

interface ShakeModalProps {
    visible: boolean;
    onClose: () => void;
}

export function ShakeModal({ visible, onClose }: ShakeModalProps) {
    const { colors } = useTheme();
    const [shakeDetected, setShakeDetected] = useState(false);
    const [prizeRevealed, setPrizeRevealed] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const prizeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }).start();

            // Start listening to accelerometer
            const subscription = Accelerometer.addListener((data) => {
                const { x, y, z } = data;
                const acceleration = Math.sqrt(x * x + y * y + z * z);

                if (acceleration > 2.5 && !shakeDetected) {
                    setShakeDetected(true);
                    handleShake();
                }
            });

            Accelerometer.setUpdateInterval(100);

            return () => {
                subscription.remove();
            };
        } else {
            scaleAnim.setValue(0);
            setShakeDetected(false);
            setPrizeRevealed(false);
            prizeAnim.setValue(0);
        }
    }, [visible, shakeDetected]);

    const handleShake = () => {
        // Vibrate on shake detection
        Vibration.vibrate([0, 100, 50, 100]);

        // Shake animation
        Animated.sequence([
            Animated.timing(shakeAnim, {
                toValue: 10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: -10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: 10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setPrizeRevealed(true);
            // Vibrate again when prize is revealed
            Vibration.vibrate([0, 200, 100, 200]);

            Animated.spring(prizeAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }).start();
        });
    };

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
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: colors.card.DEFAULT,
                            borderColor: colors.border,
                            transform: [
                                { scale: scaleAnim },
                                { translateX: shakeAnim },
                            ],
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                    >
                        <Ionicons name="close" size={24} color={colors.foreground} />
                    </TouchableOpacity>

                    {!prizeRevealed ? (
                        <View style={styles.instructionContainer}>
                            <Text style={[styles.emoji, styles.giftEmoji]}>🎁</Text>
                            <Text style={[styles.title, { color: colors.foreground }]}>
                                ¡Agita tu teléfono!
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.muted.foreground }]}>
                                Descubre tu sorpresa
                            </Text>
                        </View>
                    ) : (
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
                            <Text style={[styles.prizeTitle, { color: colors.primary.DEFAULT }]}>
                                ¡Felicidades!
                            </Text>
                            <Text style={[styles.prizeAmount, { color: colors.foreground }]}>
                                5 Apuestas Gratis
                            </Text>
                            <Text style={[styles.prizeDescription, { color: colors.muted.foreground }]}>
                                Usa este bono en cualquier partido
                            </Text>
                            <TouchableOpacity
                                style={[styles.claimButton, { backgroundColor: colors.primary.DEFAULT }]}
                                onPress={handleClose}
                            >
                                <Text style={[styles.claimButtonText, { color: colors.primary.foreground }]}>
                                    Reclamar Premio
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
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
