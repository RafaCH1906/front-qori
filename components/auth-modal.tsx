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
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/toast-context";

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

  // New Registration Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const { colors } = useTheme();
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;

    if (!email) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email format";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (mode === "register" && !passwordRegex.test(password)) {
      newErrors.password = "Password must contain at least one lowercase letter, one uppercase letter, and one number.";
    }

    if (mode === "register") {
      if (!firstName) newErrors.firstName = "First name is required";
      if (!lastName) newErrors.lastName = "Last name is required";
      if (!dni) newErrors.dni = "DNI is required";
      else if (dni.length !== 8) newErrors.dni = "DNI must be 8 digits";

      if (!phone) newErrors.phone = "Phone is required";
      if (!birthDate) newErrors.birthDate = "Birth date is required";

      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setGeneralError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === "login") {
        await login({ email, password });
        onClose();
      } else {
        // Construct payload matching backend RegisterRequest
        const payload = {
          username: email,
          email,
          password,
          firstName,
          lastName,
          phone,
          dni,
          birthDate,
          address: "Default Address",
        };
        await register(payload);
        showToast("Account created. Please check your email to activate it.", "success");
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "An error occurred. Please check your connection.";
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
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
                  {generalError ? (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={20} color={colors.destructive.DEFAULT} />
                      <Text style={styles.generalErrorText}>{generalError}</Text>
                    </View>
                  ) : null}

                  {mode === "register" && (
                    <>
                      <View style={styles.row}>
                        <View style={styles.halfInput}>
                          <Text style={styles.label}>First Name</Text>
                          <Input
                            value={firstName}
                            onChangeText={(text) => { setFirstName(text); if (errors.firstName) setErrors({ ...errors, firstName: "" }); }}
                            placeholder="John"
                          />
                          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                        </View>
                        <View style={styles.halfInput}>
                          <Text style={styles.label}>Last Name</Text>
                          <Input
                            value={lastName}
                            onChangeText={(text) => { setLastName(text); if (errors.lastName) setErrors({ ...errors, lastName: "" }); }}
                            placeholder="Doe"
                          />
                          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                        </View>
                      </View>

                      <View>
                        <Text style={styles.label}>DNI</Text>
                        <Input
                          value={dni}
                          onChangeText={(text) => { setDni(text); if (errors.dni) setErrors({ ...errors, dni: "" }); }}
                          placeholder="12345678"
                          keyboardType="numeric"
                          maxLength={8}
                        />
                        {errors.dni && <Text style={styles.errorText}>{errors.dni}</Text>}
                      </View>

                      <View>
                        <Text style={styles.label}>Phone</Text>
                        <Input
                          value={phone}
                          onChangeText={(text) => { setPhone(text); if (errors.phone) setErrors({ ...errors, phone: "" }); }}
                          placeholder="+51 999 999 999"
                          keyboardType="phone-pad"
                        />
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                      </View>

                      <View>
                        <Text style={styles.label}>Birth Date (YYYY-MM-DD)</Text>
                        <Input
                          value={birthDate}
                          onChangeText={(text) => { setBirthDate(text); if (errors.birthDate) setErrors({ ...errors, birthDate: "" }); }}
                          placeholder="1990-01-01"
                        />
                        {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
                      </View>
                    </>
                  )}

                  <View>
                    <Text style={styles.label}>Email</Text>
                    <Input
                      value={email}
                      onChangeText={(text) => { setEmail(text); if (errors.email) setErrors({ ...errors, email: "" }); }}
                      placeholder="your@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>

                  <View>
                    <Text style={styles.label}>Password</Text>
                    <Input
                      value={password}
                      onChangeText={(text) => { setPassword(text); if (errors.password) setErrors({ ...errors, password: "" }); }}
                      placeholder="••••••••"
                      secureTextEntry
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                  </View>

                  {mode === "register" && (
                    <View>
                      <Text style={styles.label}>Confirm Password</Text>
                      <Input
                        value={confirmPassword}
                        onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" }); }}
                        placeholder="••••••••"
                        secureTextEntry
                      />
                      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
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

                  <Button
                    variant="secondary"
                    size="lg"
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : (mode === "login" ? "Login" : "Create Account")}
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
                        onPress={() => { onSwitchMode("register"); setErrors({}); }}
                      >
                        <Text style={styles.switchLink}>Sign up</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.switchRow}>
                      <Text style={styles.switchText}>
                        Already have an account?{" "}
                      </Text>
                      <TouchableOpacity onPress={() => { onSwitchMode("login"); setErrors({}); }}>
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
      maxHeight: "90%",
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
    row: {
      flexDirection: "row",
      gap: spacing.md,
    },
    halfInput: {
      flex: 1,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.foreground,
      marginBottom: spacing.sm,
    },
    errorText: {
      color: colors.destructive.DEFAULT,
      fontSize: fontSize.xs,
      marginTop: spacing.xs,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(239, 68, 68, 0.1)", // Light red background
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    generalErrorText: {
      color: colors.destructive.DEFAULT,
      fontSize: fontSize.sm,
      flex: 1,
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
