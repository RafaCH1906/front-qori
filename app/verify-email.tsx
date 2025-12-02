import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { verifyEmail } from '@/lib/api/auth';
import { AuthStorage, UserData } from '@/lib/auth/storage';
import { useTheme } from '@/context/theme-context';
import { useToast } from '@/context/toast-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, fontSize } from '@/constants/theme';

export default function VerifyEmailScreen() {
    const { token } = useLocalSearchParams<{ token: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const { showToast } = useToast();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const handleVerification = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link');
                return;
            }

            try {
                console.log('[VERIFY EMAIL] Starting verification with token');
                const response = await verifyEmail(token);

                if (response.success && response.accessToken && response.user) {
                    // Save authentication data
                    await AuthStorage.saveToken(response.accessToken);

                    const userData: UserData = {
                        id: response.user.id,
                        username: response.user.username,
                        email: response.user.email,
                        firstName: response.user.firstName,
                        lastName: response.user.lastName || response.user.firstLastName,
                        phone: response.user.telephone || response.user.phone,
                        role: response.user.role,
                        freeBetsCount: response.user.freeBetsCount || 0,
                        profilePhotoUrl: response.user.profilePhotoUrl,
                    };

                    await AuthStorage.saveUserData(userData);

                    setStatus('success');
                    setMessage('Email verified successfully! Redirecting...');

                    // Show success toast and redirect
                    setTimeout(() => {
                        showToast(`Welcome, ${userData.firstName}! Your account is now active.`, 'success');
                        router.replace('/');
                    }, 1500);
                } else {
                    setStatus('error');
                    setMessage(response.message || 'Verification failed');
                }
            } catch (error: any) {
                console.error('[VERIFY EMAIL] Error:', error);
                setStatus('error');
                setMessage(
                    error.response?.data?.message ||
                    'Verification failed. The link may be invalid or expired.'
                );

                // Redirect to home after showing error
                setTimeout(() => {
                    router.replace('/');
                }, 3000);
            }
        };

        handleVerification();
    }, [token]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
            padding: spacing.xl,
        },
        iconContainer: {
            marginBottom: spacing.xl,
        },
        message: {
            fontSize: fontSize.lg,
            color: colors.foreground,
            textAlign: 'center',
            marginTop: spacing.md,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                {status === 'loading' && (
                    <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                )}
                {status === 'success' && (
                    <Ionicons name="checkmark-circle" size={80} color="#10b981" />
                )}
                {status === 'error' && (
                    <Ionicons name="close-circle" size={80} color={colors.destructive.DEFAULT} />
                )}
            </View>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}
