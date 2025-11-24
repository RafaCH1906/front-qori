import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Vibration,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/theme-context';
import { spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { promotionsApi, GiftReward } from '@/lib/api/promotions';
import { useAuth } from '@/context/AuthProvider';

export default function WelcomeGiftScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();
    const [opened, setOpened] = useState(false);
    const [reward, setReward] = useState<GiftReward | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const prizeAnim = useRef(new Animated.Value(0)).current;

    // Redirect web users immediately
    if (Platform.OS === 'web') {
        router.replace('/');
        return null;
    }

    const handleOpenGift = async () => {
        if (loading || opened) return;

        setLoading(true);
        Vibration.vibrate([0, 100, 50, 100]);

        // Animate gift box
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start(() => {
            (async () => {
                try {
                    const rewardData = await promotionsApi.openWelcomeGift();
                    setReward(rewardData);
                    setOpened(true);
                    setError(null);
                    Vibration.vibrate([0, 200, 100, 200]);

                    Animated.spring(prizeAnim, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 7,
                    }).start();
                } catch (err: any) {
                    console.error('Error opening welcome gift:', err);
                    setError(err.response?.data?.message || 'Error al abrir el regalo. Intenta de nuevo.');
                } finally {
                    setLoading(false);
                }
            })();
        });
    };

    const handleContinue = () => {
        router.replace('/');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {!opened ? (
                    <View style={styles.giftContainer}>
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <Text style={styles.giftEmoji}>🎁</Text>
                        </Animated.View>
                        <Text style={[styles.title, { color: colors.foreground }]}>
                            ¡Bienvenido a QoriBet!
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.muted.foreground }]}>
                            Tienes un regalo especial esperándote
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.openButton,
                                { backgroundColor: colors.primary.DEFAULT },
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={handleOpenGift}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={colors.primary.foreground} />
                            ) : (
                                <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                                    Abrir Regalo
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : error ? (
                    <View style={styles.resultContainer}>
                        <Text style={styles.errorEmoji}>⚠️</Text>
                        <Text style={[styles.resultTitle, { color: '#ff6b6b' }]}>¡Ups!</Text>
                        <Text style={[styles.resultMessage, { color: colors.muted.foreground }]}>
                            {error}
                        </Text>
                        <TouchableOpacity
                            style={[styles.continueButton, { backgroundColor: colors.primary.DEFAULT }]}
                            onPress={handleContinue}
                        >
                            <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                                Continuar
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : reward ? (
                    <Animated.View
                        style={[
                            styles.resultContainer,
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
                        <Text style={styles.successEmoji}>✨</Text>
                        <Text style={[styles.resultTitle, { color: colors.primary.DEFAULT }]}>
                            ¡Felicidades!
                        </Text>
                        <Text style={[styles.rewardAmount, { color: colors.foreground }]}>
                            {reward.rewardDescription}
                        </Text>
                        <Text style={[styles.resultMessage, { color: colors.muted.foreground }]}>
                            {reward.message}
                        </Text>
                        <TouchableOpacity
                            style={[styles.continueButton, { backgroundColor: colors.primary.DEFAULT }]}
                            onPress={handleContinue}
                        >
                            <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
                                Comenzar a Apostar
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    giftContainer: {
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
    },
    resultContainer: {
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
    },
    giftEmoji: {
        fontSize: 120,
        marginBottom: spacing.xl,
    },
    successEmoji: {
        fontSize: 100,
        marginBottom: spacing.lg,
    },
    errorEmoji: {
        fontSize: 100,
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fontSize.lg,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    resultTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    rewardAmount: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    resultMessage: {
        fontSize: fontSize.base,
        textAlign: 'center',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    openButton: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
        minWidth: 200,
        alignItems: 'center',
    },
    continueButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
