import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
    ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { OnboardingStorage } from '@/lib/onboarding-storage';
import { spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    emoji: string;
    title: string;
    description: string;
}

const slides: OnboardingSlide[] = [
    {
        id: '1',
        emoji: '⚽',
        title: 'Bienvenido a Qoribet',
        description: 'La mejor plataforma de apuestas deportivas. Vive la emoción del deporte.',
    },
    {
        id: '2',
        emoji: '🎯',
        title: 'Apuestas en Vivo',
        description: 'Realiza apuestas en tiempo real mientras sigues tus partidos favoritos.',
    },
    {
        id: '3',
        emoji: '🎁',
        title: 'Bonos y Recompensas',
        description: 'Agita tu teléfono para descubrir sorpresas y obtener bonos exclusivos.',
    },
    {
        id: '4',
        emoji: '🏆',
        title: '¡Comienza Ahora!',
        description: 'Regístrate y recibe tu bono de bienvenida para empezar a ganar.',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken<OnboardingSlide>[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentIndex(viewableItems[0].index);
            }
        }
    ).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        }
    };

    const handleSkip = async () => {
        try {
            await OnboardingStorage.setOnboardingCompleted(true);
            router.replace('/');
        } catch (error) {
            console.error('Error saving onboarding:', error);
            router.replace('/');
        }
    };

    const handleGetStarted = async () => {
        try {
            await OnboardingStorage.setOnboardingCompleted(true);
            router.replace('/');
        } catch (error) {
            console.error('Error saving onboarding:', error);
            router.replace('/');
        }
    };

    const renderSlide = ({ item }: { item: OnboardingSlide }) => (
        <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.description, { color: colors.muted.foreground }]}>
                {item.description}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style="light" />

            {/* Skip Button */}
            {currentIndex < slides.length - 1 && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={[styles.skipText, { color: colors.primary.DEFAULT }]}>Saltar</Text>
                </TouchableOpacity>
            )}

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                bounces={false}
            />

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            { backgroundColor: colors.muted.DEFAULT },
                            currentIndex === index && [
                                styles.activeDot,
                                { backgroundColor: colors.primary.DEFAULT },
                            ],
                        ]}
                    />
                ))}
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomContainer}>
                {currentIndex === slides.length - 1 ? (
                    <TouchableOpacity
                        style={[styles.getStartedButton, { backgroundColor: colors.primary.DEFAULT }]}
                        onPress={handleGetStarted}
                    >
                        <Text style={[styles.getStartedText, { color: colors.primary.foreground }]}>
                            Comenzar
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.nextButton, { backgroundColor: colors.primary.DEFAULT }]}
                        onPress={handleNext}
                    >
                        <Text style={[styles.nextText, { color: colors.primary.foreground }]}>
                            Siguiente
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipButton: {
        position: 'absolute',
        top: spacing.xl,
        right: spacing.xl,
        zIndex: 10,
        padding: spacing.sm,
    },
    skipText: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl * 2,
    },
    emoji: {
        fontSize: 120,
        marginBottom: spacing.xl * 2,
    },
    title: {
        fontSize: fontSize['3xl'],
        fontWeight: fontWeight.bold,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    description: {
        fontSize: fontSize.lg,
        textAlign: 'center',
        lineHeight: 28,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        width: 24,
    },
    bottomContainer: {
        paddingHorizontal: spacing.xl * 2,
        paddingBottom: spacing.xl * 2,
    },
    nextButton: {
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    nextText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    getStartedButton: {
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    getStartedText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
});
