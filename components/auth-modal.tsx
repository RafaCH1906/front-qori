import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onSwitchMode: (mode: "login" | "register") => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  mode,
  onSwitchMode,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSubmit = () => {
    Alert.alert(
      mode === "login" ? "Login" : "Register",
      `${mode === "login" ? "Logging in" : "Registering"} as ${email}`
    );
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.overlay}>
          <Card style={styles.card}>
            <ScrollView>
              <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>
                    {mode === "login" ? "Welcome Back" : "Join QORIBET"}
                  </Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={colors.foreground}
                    />
                  </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={styles.form}>
                  <View>
                    <Text style={styles.label}>Email</Text>
                    <Input
                      value={email}
                      onChangeText={setEmail}
                      placeholder="your@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View>
                    <Text style={styles.label}>Password</Text>
                    <Input
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      secureTextEntry
                    />
                  </View>

                  {mode === "register" && (
                    <View>
                      <Text style={styles.label}>Confirm Password</Text>
                      <Input
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••••"
                        secureTextEntry
                      />
                    </View>
                  )}

                  {mode === "login" && (
                    <View style={styles.rememberRow}>
                      <Text style={styles.rememberText}>Remember me</Text>
                      <TouchableOpacity>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <Button variant="secondary" size="lg" onPress={handleSubmit}>
                    {mode === "login" ? "Login" : "Create Account"}
                  </Button>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  {mode === "login" ? (
                    <View style={styles.switchRow}>
                      <Text style={styles.switchText}>
                        Don't have an account?{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={() => onSwitchMode("register")}
                      >
                        <Text style={styles.switchLink}>Sign up</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.switchRow}>
                      <Text style={styles.switchText}>
                        Already have an account?{" "}
                      </Text>
                      <TouchableOpacity onPress={() => onSwitchMode("login")}>
                        <Text style={styles.switchLink}>Login</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
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
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: fontSize["2xl"],
      fontWeight: fontWeight.bold,
      color: colors.foreground,
    },
    form: {
      gap: spacing.lg,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
      marginBottom: spacing.sm,
    },
    rememberRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rememberText: {
      fontSize: fontSize.sm,
      color: colors.foreground,
    },
    forgotText: {
      fontSize: fontSize.sm,
      color: colors.accent.DEFAULT,
      fontWeight: fontWeight.semibold,
    },
    footer: {
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    switchText: {
      fontSize: fontSize.sm,
      color: colors.muted.foreground,
    },
    switchLink: {
      fontSize: fontSize.sm,
      color: colors.accent.DEFAULT,
      fontWeight: fontWeight.bold,
    },
  });
