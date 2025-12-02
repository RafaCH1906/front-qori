import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useWindowDimensions } from "react-native";
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
import { getDeviceType } from "@/lib/platform-utils";

export default function ProfileScreen() {
    const { user, logout, loading, refreshUser } = useAuth();
    const { balance, freeBetsCount } = useBalance();
    const router = useRouter();
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const deviceType = getDeviceType(width);
    const isDesktop = deviceType === 'desktop';
    const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

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

                <View style={[styles.contentWrapper, isDesktop && styles.contentWrapperDesktop]}>
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
                                    <Ionicons name="person" size={isDesktop ? 64 : 48} color={colors.primary.foreground} />
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
                        <View style={[styles.balanceRow, isDesktop && styles.balanceRowDesktop]}>
                            <View style={styles.balanceItem}>
                                <Ionicons name="wallet" size={isDesktop ? 32 : 24} color={colors.accent.DEFAULT} />
                                <Text style={styles.balanceLabel}>Saldo</Text>
                                <Text style={styles.balanceValue}>S/ {balance.toFixed(2)}</Text>
                            </View>
                            <View style={styles.balanceDivider} />
                            <View style={styles.balanceItem}>
                                <Ionicons name="ticket" size={isDesktop ? 32 : 24} color={colors.primary.DEFAULT} />
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
                                <Ionicons name="time-outline" size={isDesktop ? 28 : 24} color={colors.accent.DEFAULT} />
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
                                <Ionicons name="home-outline" size={isDesktop ? 28 : 24} color={colors.primary.DEFAULT} />
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
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors, isDesktop: boolean = false) =>
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
            padding: isDesktop ? spacing.xl : spacing.lg,
            gap: spacing.lg,
        },
        contentWrapper: {
            gap: spacing.lg,
        },
        contentWrapperDesktop: {
            maxWidth: 800,
            alignSelf: 'center',
            width: '100%',
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
            fontSize: isDesktop ? fontSize["3xl"] : fontSize["2xl"],
            fontWeight: fontWeight.bold,
            color: colors.foreground,
        },
        profileCard: {
            padding: isDesktop ? spacing.lg : spacing.md,
            paddingVertical: isDesktop ? 40 : 32,
            backgroundColor: colors.card.DEFAULT,
            alignItems: 'center',
        },
        avatarContainer: {
            alignItems: "center",
            gap: isDesktop ? spacing.sm : spacing.xs,
            paddingVertical: isDesktop ? spacing.sm : spacing.xs,
        },
        avatar: {
            width: isDesktop ? 160 : 120,
            height: isDesktop ? 160 : 120,
            borderRadius: isDesktop ? 80 : 60,
            backgroundColor: colors.primary.DEFAULT,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: isDesktop ? spacing.lg : spacing.md,
            overflow: 'hidden',
        },
        avatarImage: {
            width: '100%',
            height: '100%',
        },
        userName: {
            fontSize: isDesktop ? fontSize["2xl"] : fontSize.xl,
            fontWeight: fontWeight.bold,
            color: colors.foreground,
        },
        userEmail: {
            fontSize: isDesktop ? fontSize.base : fontSize.sm,
            color: colors.muted.foreground,
        },
        balanceCard: {
            padding: isDesktop ? spacing.xl : spacing.lg,
            backgroundColor: colors.card.DEFAULT,
        },
        balanceRow: {
            flexDirection: "row",
            alignItems: "center",
        },
        balanceRowDesktop: {
            gap: spacing.xl,
            justifyContent: 'center',
        },
        balanceItem: {
            flex: 1,
            alignItems: "center",
            gap: spacing.xs,
        },
        balanceDivider: {
            width: 1,
            height: isDesktop ? 80 : 60,
            backgroundColor: colors.border,
        },
        balanceLabel: {
            fontSize: isDesktop ? fontSize.sm : fontSize.xs,
            color: colors.muted.foreground,
            textAlign: "center",
        },
        balanceValue: {
            fontSize: isDesktop ? fontSize["2xl"] : fontSize.xl,
            fontWeight: fontWeight.bold,
            color: colors.foreground,
        },
        menuCard: {
            padding: isDesktop ? spacing.lg : spacing.md,
            backgroundColor: colors.card.DEFAULT,
        },
        menuItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: isDesktop ? spacing.lg : spacing.md,
            paddingHorizontal: spacing.sm,
        },
        menuItemLeft: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },
        menuItemText: {
            fontSize: isDesktop ? fontSize.lg : fontSize.base,
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
            fontSize: isDesktop ? fontSize.lg : fontSize.base,
            fontWeight: fontWeight.semibold,
        },
    });
