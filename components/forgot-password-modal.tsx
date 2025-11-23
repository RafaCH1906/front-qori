import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    spacing,
    borderRadius,
    fontSize,
    fontWeight,
    ThemeColors,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { forgotPassword } from "@/lib/api/password-reset";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ForgotPasswordModal({
    isOpen,
    onClose,
}: ForgotPasswordModalProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const { colors } = useTheme();
    const { showToast } = useToast();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        setError("");

        if (!email) {
            setError("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            await forgotPassword(email);
            setSuccess(true);
            showToast("Password reset email sent! Check your inbox.", "success");
        } catch (err: any) {
            console.error("Forgot password error:", err);
            let message = "Failed to send reset email. Please try again.";

            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    message = err.response.data;
                } else if (typeof err.response.data === 'object' && err.response.data.message) {
                    message = err.response.data.message;
                }
            }

            setError(message);
            showToast("Failed to send reset email", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        setError("");
        setSuccess(false);
        onClose();
    };

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.overlay}>
                    <Card style={styles.card}>
                        <View style={styles.content}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Forgot Password</Text>
                                <TouchableOpacity onPress={handleClose}>
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color={colors.foreground}
                                    />
                                </TouchableOpacity>
                            </View>

                            {success ? (
                                <View style={styles.successContainer}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={64}
                                        color={colors.accent.DEFAULT}
                                    />
                                    <Text style={styles.successTitle}>Email Sent!</Text>
                                    <Text style={styles.successMessage}>
                                        We've sent a password reset link to{" "}
                                        <Text style={styles.emailText}>{email}</Text>
                                    </Text>
                                    <Text style={styles.successHint}>
                                        Please check your inbox and follow the instructions to reset your password.
                                        The link will expire in 60 minutes.
                                    </Text>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onPress={handleClose}
                                        style={styles.closeButton}
                                    >
                                        Close
                                    </Button>
                                </View>
                            ) : (
                                <>
                                    {/* Description */}
                                    <Text style={styles.description}>
                                        Enter your email address and we'll send you a link to reset your password.
                                    </Text>

                                    {/* Error Message */}
                                    {error ? (
                                        <View style={styles.errorContainer}>
                                            <Ionicons name="alert-circle" size={20} color={colors.destructive.DEFAULT} />
                                            <Text style={styles.errorText}>{error}</Text>
                                        </View>
                                    ) : null}

                                    {/* Email Input */}
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Email Address</Text>
                                        <Input
                                            value={email}
                                            onChangeText={(text) => {
                                                setEmail(text);
                                                setError("");
                                            }}
                                            placeholder="your@email.com"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            editable={!isLoading}
                                        />
                                    </View>

                                    {/* Submit Button */}
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onPress={handleSubmit}
                                        disabled={isLoading}
                                        style={styles.submitButton}
                                    >
                                        {isLoading ? (
                                            <View style={styles.loadingContainer}>
                                                <ActivityIndicator size="small" color={colors.background} />
                                                <Text style={styles.loadingText}>Sending...</Text>
                                            </View>
                                        ) : (
                                            "Send Reset Link"
                                        )}
                                    </Button>

                                    {/* Back to Login */}
                                    <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                                        <Ionicons name="arrow-back" size={16} color={colors.accent.DEFAULT} />
                                        <Text style={styles.backText}>Back to Login</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </Card>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        keyboardView: {
            flex: 1,
        },
        overlay: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: spacing.lg,
        },
        card: {
            width: "100%",
            maxWidth: 448,
            backgroundColor: colors.card.DEFAULT,
        },
        content: {
            padding: spacing.xl,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.lg,
        },
        title: {
            fontSize: fontSize["2xl"],
            fontWeight: fontWeight.bold,
            color: colors.foreground,
        },
        description: {
            fontSize: fontSize.sm,
            color: colors.muted.foreground,
            marginBottom: spacing.xl,
            lineHeight: 20,
        },
        errorContainer: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            padding: spacing.md,
            borderRadius: borderRadius.md,
            marginBottom: spacing.lg,
            gap: spacing.sm,
        },
        errorText: {
            color: colors.destructive.DEFAULT,
            fontSize: fontSize.sm,
            flex: 1,
        },
        inputContainer: {
            marginBottom: spacing.xl,
        },
        label: {
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.foreground,
            marginBottom: spacing.sm,
        },
        submitButton: {
            marginBottom: spacing.md,
        },
        loadingContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        loadingText: {
            color: colors.background,
            fontSize: fontSize.base,
            fontWeight: fontWeight.semibold,
        },
        backButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.xs,
            paddingVertical: spacing.sm,
        },
        backText: {
            fontSize: fontSize.sm,
            color: colors.accent.DEFAULT,
            fontWeight: fontWeight.semibold,
        },
        successContainer: {
            alignItems: "center",
            paddingVertical: spacing.xl,
        },
        successTitle: {
            fontSize: fontSize.xl,
            fontWeight: fontWeight.bold,
            color: colors.foreground,
            marginTop: spacing.lg,
            marginBottom: spacing.md,
        },
        successMessage: {
            fontSize: fontSize.base,
            color: colors.muted.foreground,
            textAlign: "center",
            marginBottom: spacing.md,
            lineHeight: 22,
        },
        emailText: {
            color: colors.accent.DEFAULT,
            fontWeight: fontWeight.semibold,
        },
        successHint: {
            fontSize: fontSize.sm,
            color: colors.muted.foreground,
            textAlign: "center",
            marginBottom: spacing.xl,
            lineHeight: 20,
        },
        closeButton: {
            width: "100%",
        },
    });
