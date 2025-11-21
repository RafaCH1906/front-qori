import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/app/contexts/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";
import { spacing, fontSize, fontWeight } from "@/constants/theme";

export default function ProfileScreen() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.foreground }}>Loading...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                    User Profile
                </Text>

                <View style={[styles.card, { backgroundColor: colors.card.DEFAULT }]}>
                    <Text style={[styles.label, { color: colors.muted.foreground }]}>Email</Text>
                    <Text style={[styles.value, { color: colors.foreground }]}>{user.email}</Text>

                    {user.firstName && (
                        <>
                            <Text style={[styles.label, { color: colors.muted.foreground }]}>Name</Text>
                            <Text style={[styles.value, { color: colors.foreground }]}>{user.firstName} {user.lastName}</Text>
                        </>
                    )}
                </View>

                <Button onPress={() => router.push("/")} variant="outline">
                    Back to Home
                </Button>

                <View style={{ marginTop: spacing.lg }}>
                    <Button onPress={logout} variant="destructive">
                        Logout
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
    },
    content: {
        maxWidth: 600,
        width: "100%",
        alignSelf: "center",
        gap: spacing.lg,
    },
    title: {
        fontSize: fontSize["3xl"],
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
    },
    card: {
        padding: spacing.xl,
        borderRadius: 12,
        gap: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
    },
    value: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
});
