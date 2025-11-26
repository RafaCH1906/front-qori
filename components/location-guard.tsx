import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Linking, ActivityIndicator } from 'react-native';
import { useLocation } from '@/context/location-context';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@expo/vector-icons';
import { spacing, fontSize, fontWeight, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface LocationGuardProps {
    children: React.ReactNode;
}

export function LocationGuard({ children }: LocationGuardProps) {
    const { permissionStatus, requestPermission, isLoading } = useLocation();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    useEffect(() => {
        // If status is undetermined, request permission immediately
        if (permissionStatus === 'undetermined') {
            requestPermission();
        }
    }, [permissionStatus, requestPermission]);

    const openSettings = async () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else if (Platform.OS === 'android') {
            // Open app settings directly
            Linking.openSettings();
        } else {
            // Web: Instruct user to check browser settings
            alert('Please check your browser settings to allow location access.');
        }
    };

    if (isLoading || permissionStatus === 'undetermined') {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                <Text style={styles.loadingText}>Checking location permissions...</Text>
            </View>
        );
    }

    if (permissionStatus === 'denied') {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <Ionicons name="alert-circle" size={64} color={colors.destructive.DEFAULT} style={styles.icon} />
                    <Text style={styles.title}>Location Access Required</Text>
                    <Text style={styles.description}>
                        This app requires access to your location to function correctly.
                        We use this to verify your region for regulatory compliance.
                    </Text>

                    <View style={styles.actions}>
                        <Button onPress={requestPermission} style={styles.button}>
                            Try Again
                        </Button>

                        {Platform.OS !== 'web' && (
                            <Button variant="outline" onPress={openSettings} style={styles.button}>
                                Open Settings
                            </Button>
                        )}
                    </View>
                </View>
            </View>
        );
    }

    // Permission granted
    return <>{children}</>;
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    card: {
        backgroundColor: colors.card.DEFAULT,
        padding: spacing.xl,
        borderRadius: 16,
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    icon: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.foreground,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    description: {
        fontSize: fontSize.base,
        color: colors.muted.foreground,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    actions: {
        width: '100%',
        gap: spacing.md,
    },
    button: {
        width: '100%',
    },
    loadingText: {
        marginTop: spacing.md,
        color: colors.muted.foreground,
        fontSize: fontSize.base,
    }
});
