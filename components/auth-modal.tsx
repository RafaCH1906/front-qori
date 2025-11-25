import React, { useState, useMemo, useEffect } from "react";
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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { useRouter } from "expo-router";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onSwitchMode: (mode: "login" | "register") => void;
  onForgotPassword?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  mode,
  onSwitchMode,
  onForgotPassword,
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

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));

  const { colors, isDark } = useTheme();
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Reset form when modal closes or mode changes
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setDni("");
    setBirthDate("");
    setErrors({});
    setGeneralError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Reset form when mode changes
  useEffect(() => {
    resetForm();
  }, [mode]);

  // Handle date picker change
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
    if (date) {
      setSelectedDate(date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setBirthDate(`${year}-${month}-${day}`);
      if (errors.birthDate) setErrors({ ...errors, birthDate: "" });
    }
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

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
        console.log('[AUTH MODAL] Attempting login with:', email);
        await login({ email: email, password });
        console.log('[AUTH MODAL] Login successful');
        handleClose();

        // Show welcome message after modal closes
        // Note: We'll get the actual user name from the auth context after login completes
        setTimeout(() => {
          showToast(`¡Bienvenido de nuevo!`, "success");
        }, 300);
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
        console.log('[AUTH MODAL] Attempting registration');
        const userData = await register(payload);
        handleClose();

        // Show success toast with email verification message
        setTimeout(() => {
          showToast("✅ Cuenta creada exitosamente. Revise su correo para verificar su cuenta.", "success");
        }, 300);

        // Note: User won't be automatically logged in until they verify their email
        // The backend will reject login attempts for unverified users
      }
    } catch (error: any) {
      console.error('[AUTH MODAL] Error:', error);

      // Extract error message from various possible locations
      let message = "Ocurrió un error. Por favor, intenta nuevamente.";
      let title = mode === "login" ? "Error de Inicio de Sesión" : "Error de Registro";

      if (error.response?.data) {
        const status = error.response.status;

        // Backend returned structured error
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        } else if (error.response.data.error) {
          message = error.response.data.error;
        }

        // Handle specific status codes
        if (mode === "login") {
          if (status === 401) {
            message = "Credenciales incorrectas. Verifica tu email y contraseña.";
          } else if (status === 403) {
            message = "Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo y haz clic en el enlace de verificación.";
          } else if (status === 404) {
            message = "No se encontró una cuenta con ese email. ¿Deseas registrarte?";
          }
        } else {
          // Registration errors
          if (status === 409 || status === 400) {
            if (message.toLowerCase().includes('email')) {
              message = "Este email ya está registrado. ¿Deseas iniciar sesión?";
            } else if (message.toLowerCase().includes('username')) {
              message = "Este nombre de usuario ya está en uso. Intenta con otro.";
            } else if (message.toLowerCase().includes('dni')) {
              message = "Este DNI ya está registrado.";
            }
          }
        }
      } else if (error.message) {
        // Network or other error
        if (error.message.includes('Network')) {
          message = "Error de conexión. Por favor, verifica tu conexión a internet y asegúrate de que el servidor esté funcionando.";
          title = "Error de Conexión";
        } else {
          message = error.message;
        }
      }

      console.error('[AUTH MODAL] Error message:', message);

      // Show error alert instead of inline error for better visibility
      Alert.alert(title, message, [{ text: "OK" }]);
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
      onRequestClose={handleClose}
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
                    {mode === "login" ? "Bienvenido de Nuevo" : "Únete a QORIBET"}
                  </Text>
                  <TouchableOpacity onPress={handleClose}>
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
                          <Text style={styles.label}>Nombre</Text>
                          <Input
                            value={firstName}
                            onChangeText={(text) => { setFirstName(text); if (errors.firstName) setErrors({ ...errors, firstName: "" }); }}
                            placeholder="Ingresa tu nombre"
                          />
                          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                        </View>
                        <View style={styles.halfInput}>
                          <Text style={styles.label}>Apellido</Text>
                          <Input
                            value={lastName}
                            onChangeText={(text) => { setLastName(text); if (errors.lastName) setErrors({ ...errors, lastName: "" }); }}
                            placeholder="Ingresa tu apellido"
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
                        <Text style={styles.label}>Fecha de Nacimiento</Text>
                        {Platform.OS === 'web' ? (
                          // Web: Use native HTML date input
                          <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => {
                              const value = e.target.value;
                              setBirthDate(value);
                              if (errors.birthDate) setErrors({ ...errors, birthDate: "" });
                            }}
                            max={new Date().toISOString().split('T')[0]}
                            min="1900-01-01"
                            placeholder="DD/MM/AAAA"
                            style={{
                              width: '100%',
                              height: 44,
                              paddingLeft: 12,
                              paddingRight: 12,
                              borderRadius: 6,
                              border: `1px solid ${colors.border}`,
                              backgroundColor: colors.input,
                              color: colors.foreground,
                              fontSize: 14,
                              fontFamily: 'inherit',
                              cursor: 'pointer',
                            }}
                          />
                        ) : (
                          // Mobile: Use DateTimePicker
                          <>
                            <TouchableOpacity
                              style={styles.datePickerButton}
                              onPress={() => setShowDatePicker(true)}
                            >
                              <Ionicons name="calendar" size={20} color={colors.accent.DEFAULT} />
                              <Text style={[
                                styles.datePickerText,
                                birthDate
                                  ? { color: colors.foreground }
                                  : { color: colors.muted.foreground }
                              ]}>
                                {birthDate || "Selecciona tu fecha de nacimiento"}
                              </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                              <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                                minimumDate={new Date(1900, 0, 1)}
                                themeVariant={isDark ? 'dark' : 'light'}
                              />
                            )}
                          </>
                        )}
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
                    <Text style={styles.label}>Contraseña</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[styles.passwordInput, { color: colors.foreground, backgroundColor: colors.input }]}
                        value={password}
                        onChangeText={(text) => { setPassword(text); if (errors.password) setErrors({ ...errors, password: "" }); }}
                        placeholder="••••••••"
                        placeholderTextColor={colors.muted.foreground}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color={colors.muted.foreground}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                  </View>

                  {mode === "register" && (
                    <View>
                      <Text style={styles.label}>Confirmar Contraseña</Text>
                      <View style={styles.passwordContainer}>
                        <TextInput
                          style={[styles.passwordInput, { color: colors.foreground, backgroundColor: colors.input }]}
                          value={confirmPassword}
                          onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" }); }}
                          placeholder="••••••••"
                          placeholderTextColor={colors.muted.foreground}
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          style={styles.eyeIcon}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <Ionicons
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={colors.muted.foreground}
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>
                  )}

                  {mode === "login" && (
                    <View style={styles.rememberRow}>
                      <Text style={styles.rememberText}>Recordarme</Text>
                      <TouchableOpacity onPress={onForgotPassword}>
                        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <Button
                    variant="secondary"
                    size="lg"
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? "Procesando..." : (mode === "login" ? "Iniciar Sesión" : "Crear Cuenta")}
                  </Button>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  {mode === "login" ? (
                    <View style={styles.switchRow}>
                      <Text style={styles.switchText}>
                        ¿No tienes una cuenta?{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={() => onSwitchMode("register")}
                      >
                        <Text style={styles.switchLink}>Registrarse</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.switchRow}>
                      <Text style={styles.switchText}>
                        ¿Ya tienes una cuenta?{" "}
                      </Text>
                      <TouchableOpacity onPress={() => onSwitchMode("login")}>
                        <Text style={styles.switchLink}>Iniciar Sesión</Text>
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
    passwordContainer: {
      position: 'relative',
      width: '100%',
    },
    passwordInput: {
      width: '100%',
      height: 44,
      paddingHorizontal: spacing.md,
      paddingRight: 44,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: fontSize.sm,
    },
    eyeIcon: {
      position: 'absolute',
      right: spacing.md,
      top: 12,
      padding: spacing.xs,
    },
    datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      height: 44,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.input,
    },
    datePickerText: {
      fontSize: fontSize.sm,
      flex: 1,
    },
  });
