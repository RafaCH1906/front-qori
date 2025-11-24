import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
    ViewToken,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { OnboardingStorage } from '@/lib/onboarding-storage';
import { spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { promotionsApi, SlideshowSlide } from '@/lib/api/promotions';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slides, setSlides] = useState<SlideshowSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    // Redirect web users immediately - onboarding is mobile-only
    useEffect(() => {
        if (Platform.OS === 'web') {
            router.replace('/');
            return;
        }
        loadSlides();
    }, []);

    const loadSlides = async () => {
        try {
            setLoading(true);
            const slidesData = await promotionsApi.getSlideshow();
            setSlides(slidesData);
        } catch (err) {
            console.error('Error loading slides:', err);
            // Fallback to default slides
            setSlides([
                {
                    id: 1,
                    emoji: '⚽',
                    title: 'Bienvenido a Qoribet',
                    description: 'La mejor plataforma de apuestas deportivas. Vive la emoción del deporte.',
                    imageUrl: '',
                    displayOrder: 1,
                },
                {
                    id: 2,
                    emoji: '🎯',
                    title: 'Apuestas en Vivo',
                    description: 'Realiza apuestas en tiempo real mientras sigues tus partidos favoritos.',
                    imageUrl: '',
                    displayOrder: 2,
                },
                {
                    id: 3,
                    emoji: '🎁',
                    title: 'Bonos y Recompensas',
                    description: 'Agita tu teléfono para descubrir sorpresas y obtener bonos exclusivos.',
                    imageUrl: '',
                    displayOrder: 3,
                },
                {
                    id: 4,
                    emoji: '🏆',
                    title: '¡Comienza Ahora!',
                    description: 'Regístrate y recibe tu bono de bienvenida para empezar a ganar.',
                    imageUrl: '',
                    displayOrder: 4,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken<SlideshowSlide>[] }) => {
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

    const renderSlide = ({ item }: { item: SlideshowSlide }) => (
        <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.description, { color: colors.muted.foreground }]}>
                {item.description}
            </Text>
        </View>
    );

    // Don't render anything on web
    if (Platform.OS === 'web') {
        return null;
    }

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                    <Text style={[styles.loadingText, { color: colors.muted.foreground }]}>
                        Cargando...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

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
                keyExtractor={(item) => item.id.toString()}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    loadingText: {
        fontSize: fontSize.base,
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
