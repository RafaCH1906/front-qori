import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { League, getLeagues } from "@/lib/api/leagues";
import { useTheme } from "@/context/theme-context";
import { spacing, borderRadius, fontSize, fontWeight, ThemeColors } from "@/constants/theme";

interface LeaguesBarProps {
    onLeagueSelect?: (leagueId: number | null) => void;
    selectedLeagueId?: number | null;
}

export default function LeaguesBar({ onLeagueSelect, selectedLeagueId }: LeaguesBarProps) {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [currentScrollPosition, setCurrentScrollPosition] = useState(0);
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const scrollViewRef = useRef<ScrollView>(null);
    const SCROLL_AMOUNT = 300; // Amount to scroll in pixels

    useEffect(() => {
        fetchLeagues();
    }, []);

    const fetchLeagues = async () => {
        try {
            setLoading(true);
            const data = await getLeagues();
            setLeagues(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching leagues:", err);
            setError("Failed to load leagues");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
            </View>
        );
    }

    if (error || leagues.length === 0) {
        return null;
    }

    const handleSelect = (leagueId: number | null) => {
        onLeagueSelect?.(leagueId);
    };

    const handleScroll = (event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const scrollPosition = contentOffset.x;
        const maxScrollPosition = contentSize.width - layoutMeasurement.width;

        // Update current scroll position
        setCurrentScrollPosition(scrollPosition);

        // Show left arrow if scrolled right
        setShowLeftArrow(scrollPosition > 10);
        // Show right arrow if not at the end
        setShowRightArrow(scrollPosition < maxScrollPosition - 10);
    };

    const handleScrollLeft = () => {
        const newPosition = Math.max(0, currentScrollPosition - SCROLL_AMOUNT);
        scrollViewRef.current?.scrollTo({ x: newPosition, animated: true });
    };

    const handleScrollRight = () => {
        const newPosition = currentScrollPosition + SCROLL_AMOUNT;
        scrollViewRef.current?.scrollTo({ x: newPosition, animated: true });
    };

    const handleContentSizeChange = (width: number, height: number) => {
        // Check if content is wider than the container
        setShowRightArrow(width > 0);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select a League</Text>
            <View style={styles.scrollContainer}>
                {/* Left Arrow */}
                {showLeftArrow && (
                    <TouchableOpacity
                        style={[styles.arrowButton, styles.leftArrow]}
                        onPress={handleScrollLeft}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                )}

                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    onScroll={handleScroll}
                    onContentSizeChange={handleContentSizeChange}
                    scrollEventThrottle={16}
                >
                    {/* All Leagues Button */}
                    <TouchableOpacity
                        style={[
                            styles.button,
                            selectedLeagueId === null ? styles.buttonActive : styles.buttonInactive,
                        ]}
                        onPress={() => handleSelect(null)}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                selectedLeagueId === null ? styles.textActive : styles.textInactive,
                            ]}
                        >
                            All Leagues
                        </Text>
                    </TouchableOpacity>

                    {/* League Buttons */}
                    {leagues.map((league) => {
                        const leagueId = league.id;
                        const isSelected = selectedLeagueId === leagueId;
                        const logoUri = league.logoUrl || league.logo;

                        return (
                            <TouchableOpacity
                                key={`${league.id}-${leagueId}`}
                                style={[
                                    styles.button,
                                    isSelected ? styles.buttonActive : styles.buttonInactive,
                                ]}
                                onPress={() => handleSelect(leagueId)}
                            >
                                {logoUri ? (
                                    <Image
                                        source={{ uri: logoUri }}
                                        style={styles.icon}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Text style={styles.emoji}>🏆</Text>
                                )}
                                <Text
                                    style={[
                                        styles.buttonText,
                                        isSelected ? styles.textActive : styles.textInactive,
                                    ]}
                                >
                                    {league.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Right Arrow */}
                {showRightArrow && (
                    <TouchableOpacity
                        style={[styles.arrowButton, styles.rightArrow]}
                        onPress={handleScrollRight}
                    >
                        <Ionicons name="chevron-forward" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            marginBottom: spacing.md,
        },
        loadingContainer: {
            padding: spacing.md,
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            color: colors.foreground,
            marginBottom: spacing.md,
            paddingHorizontal: spacing.md,
        },
        scrollContainer: {
            position: "relative",
            flexDirection: "row",
            alignItems: "center",
        },
        scrollContent: {
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
        },
        arrowButton: {
            position: "absolute",
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 5,
            borderWidth: 1,
            borderColor: colors.border,
        },
        leftArrow: {
            left: spacing.xs,
        },
        rightArrow: {
            right: spacing.xs,
        },
        button: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.primary.DEFAULT,
        },
        buttonActive: {
            backgroundColor: colors.primary.DEFAULT,
        },
        buttonInactive: {
            backgroundColor: "transparent",
        },
        buttonText: {
            fontSize: fontSize.sm,
            fontWeight: fontWeight.bold,
        },
        textActive: {
            color: colors.primary.foreground, // Usually black on yellow
        },
        textInactive: {
            color: colors.primary.DEFAULT, // Yellow text on dark bg
        },
        icon: {
            width: 16,
            height: 16,
            marginRight: spacing.xs,
        },
        emoji: {
            fontSize: 14,
            marginRight: spacing.xs,
        },
    });
