import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/theme-context";
import { useBalance } from "@/context/balance-context";
import { Ionicons } from "@expo/vector-icons";
import { spacing, fontSize, fontWeight, borderRadius, ThemeColors } from "@/constants/theme";
import ProfilePhotoSelector from "@/components/profile-photo-selector";

export default function ProfileScreen() {
    const { user, logout, loading, refreshUser } = useAuth();
    const { balance, freeBetsCount } = useBalance();
    const router = useRouter();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/");
        }
    }, [user, loading, router]);

    const handlePhotoUploaded = async (url: string) => {
        console.log('[Profile] Photo uploaded, refreshing user data');
        // Refrescar los datos del usuario para obtener la nueva URL
        await refreshUser();
    };

    if (loading || !user) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mi Perfil</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Profile Card */}
                <Card style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            {user.profilePhotoUrl ? (
                                <Image 
                                    source={{ uri: user.profilePhotoUrl }} 
                                    style={styles.avatarImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Ionicons name="person" size={48} color={colors.primary.foreground} />
                            )}
                        </View>
                        <Text style={styles.userName}>
                            {user.firstName} {user.lastName}
                        </Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                </Card>

                {/* Profile Photo Selector */}
                <ProfilePhotoSelector onPhotoUploaded={handlePhotoUploaded} />

                {/* Balance Card */}
                <Card style={styles.balanceCard}>
                    <View style={styles.balanceRow}>
                        <View style={styles.balanceItem}>
                            <Ionicons name="wallet" size={24} color={colors.accent.DEFAULT} />
                            <Text style={styles.balanceLabel}>Saldo</Text>
                            <Text style={styles.balanceValue}>S/ {balance.toFixed(2)}</Text>
                        </View>
                        <View style={styles.balanceDivider} />
                        <View style={styles.balanceItem}>
                            <Ionicons name="ticket" size={24} color={colors.primary.DEFAULT} />
                            <Text style={styles.balanceLabel}>Apuestas Gratis</Text>
                            <Text style={styles.balanceValue}>{freeBetsCount}</Text>
                        </View>
                    </View>
                </Card>

                {/* Menu Options */}
                <Card style={styles.menuCard}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push("/bet-history")}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="time-outline" size={24} color={colors.accent.DEFAULT} />
                            <Text style={styles.menuItemText}>Historial de Apuestas</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.muted.foreground} />
                    </TouchableOpacity>

                    <View style={styles.menuDivider} />

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push("/")}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="home-outline" size={24} color={colors.primary.DEFAULT} />
                            <Text style={styles.menuItemText}>Volver al Inicio</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.muted.foreground} />
                    </TouchableOpacity>
                </Card>

                {/* Logout Button */}
                <Button onPress={logout} variant="destructive" size="lg">
                    <View style={styles.logoutButtonContent}>
                        <Ionicons name="log-out-outline" size={20} color={colors.destructive.foreground} />
                        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                    </View>
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background,
        },
        loadingText: {
            fontSize: fontSize.base,
            color: colors.muted.foreground,
        },
        scrollContent: {
            padding: spacing.lg,
            gap: spacing.lg,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.md,
        },
        backButton: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
        },
        headerTitle: {
            fontSize: fontSize["2xl"],
            fontWeight: fontWeight.bold,
            color: colors.foreground,
        },
        profileCard: {
            padding: spacing.xl,
            backgroundColor: colors.card.DEFAULT,
        },
        avatarContainer: {
            alignItems: "center",
            gap: spacing.sm,
        },
        avatar: {
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: colors.primary.DEFAULT,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.sm,
            overflow: 'hidden',
        },
        avatarImage: {
            width: '100%',
            height: '100%',
        },
        userName: {
            fontSize: fontSize.xl,
            fontWeight: fontWeight.bold,
            color: colors.foreground,
        },
        userEmail: {
            fontSize: fontSize.sm,
            color: colors.muted.foreground,
        },
        balanceCard: {
            padding: spacing.lg,
            backgroundColor: colors.card.DEFAULT,
        },
        balanceRow: {
            flexDirection: "row",
            alignItems: "center",
        },
        balanceItem: {
            flex: 1,
            alignItems: "center",
            gap: spacing.xs,
        },
        balanceDivider: {
            width: 1,
            height: 60,
            backgroundColor: colors.border,
        },
        balanceLabel: {
            fontSize: fontSize.xs,
            color: colors.muted.foreground,
            textAlign: "center",
        },
        balanceValue: {
            fontSize: fontSize.xl,
            fontWeight: fontWeight.bold,
            color: colors.foreground,
        },
        menuCard: {
            padding: spacing.md,
            backgroundColor: colors.card.DEFAULT,
        },
        menuItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.sm,
        },
        menuItemLeft: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },
        menuItemText: {
            fontSize: fontSize.base,
            fontWeight: fontWeight.semibold,
            color: colors.foreground,
        },
        menuDivider: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: spacing.xs,
        },
        logoutButtonContent: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        logoutButtonText: {
            color: colors.destructive.foreground,
            fontSize: fontSize.base,
            fontWeight: fontWeight.semibold,
        },
    });
