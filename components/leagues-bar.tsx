import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { League, getLeagues } from "@/lib/api/leagues";
import { useTheme } from "@/context/theme-context";
import { spacing, borderRadius, fontSize, fontWeight, ThemeColors } from "@/constants/theme";

interface LeaguesBarProps {
    onLeagueSelect?: (league: League | null) => void;
    selectedLeagueId?: number | null;
}

export default function LeaguesBar({ onLeagueSelect, selectedLeagueId }: LeaguesBarProps) {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { colors } = useTheme();
    const styles = createStyles(colors);

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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select a League</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* All Leagues Button */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        selectedLeagueId === null ? styles.buttonActive : styles.buttonInactive,
                    ]}
                    onPress={() => onLeagueSelect?.(null)}
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
                    const isSelected = selectedLeagueId === league.id;
                    return (
                        <TouchableOpacity
                            key={league.id}
                            style={[
                                styles.button,
                                isSelected ? styles.buttonActive : styles.buttonInactive,
                            ]}
                            onPress={() => onLeagueSelect?.(league)}
                        >
                            {league.logo ? (
                                <Image
                                    source={{ uri: league.logo }}
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
        scrollContent: {
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
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
