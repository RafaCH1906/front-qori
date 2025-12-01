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
import { useLocation } from "@/context/location-context";
import {
  validatePeruvianPhone,
  formatPeruvianPhone,
  toE164Format,
  logValidationAttempt,
  validateAge,
  isValidDate,
  calculateAge,
  ValidationResult,
  validatePassword
} from "@/lib/utils/validation-utils";
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
  const [phoneValidationState, setPhoneValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [ageValidationState, setAgeValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  // Password visibility toggle (single state for both fields)
  const [showPassword, setShowPassword] = useState(false);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));

  const { colors, isDark } = useTheme();
  const { login, register, user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const { isInPeru, isLoading: locationLoading, permissionStatus, requestPermission } = useLocation();
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
    setPhoneValidationState('idle');
    setAgeValidationState('idle');
    setPasswordRequirements({
      length: false,
      upper: false,
      lower: false,
      number: false,
      special: false,
    });
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
      const dateString = `${year}-${month}-${day}`;
      setBirthDate(dateString);
      if (errors.birthDate) setErrors({ ...errors, birthDate: "" });
      
      // Real-time age validation
      const ageValidation = validateAge(dateString, 18, 70);
      setAgeValidationState(ageValidation.isValid ? 'valid' : 'invalid');
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

    if (!email) newErrors.email = "El correo electrónico es obligatorio";
    else if (!emailRegex.test(email)) newErrors.email = "Formato de correo inválido";

    if (!password) newErrors.password = "La contraseña es obligatoria";
    else if (mode === "register") {
      const pwdValidation = validatePassword(password);
      if (!pwdValidation.isValid) {
        newErrors.password = "La contraseña debe cumplir todos los requisitos";
      }
    } else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (mode === "register") {
      if (!firstName) newErrors.firstName = "El nombre es obligatorio";
      if (!lastName) newErrors.lastName = "El apellido es obligatorio";
      
      if (!dni) newErrors.dni = "El DNI es obligatorio";
      else if (dni.length !== 8) newErrors.dni = "El DNI debe tener exactamente 8 dígitos";
      else if (!/^\d{8}$/.test(dni)) newErrors.dni = "El DNI solo debe contener números";
      
      // Phone validation using utility
      if (!phone) {
        newErrors.phone = "El número de teléfono es obligatorio";
      } else {
        const phoneValidation = validatePeruvianPhone(phone);
        if (!phoneValidation.isValid) {
          newErrors.phone = phoneValidation.error || "Número de teléfono inválido";
          logValidationAttempt('phone', false, { phone, error: phoneValidation.error });
        } else {
          logValidationAttempt('phone', true, { phone });
        }
      }
      
      // Birth date and age validation using utility
      if (!birthDate) {
        newErrors.birthDate = "La fecha de nacimiento es obligatoria";
      } else {
        const dateValidation = isValidDate(birthDate);
        if (!dateValidation.isValid) {
          newErrors.birthDate = dateValidation.error || "Fecha inválida";
        } else {
          const ageValidation = validateAge(birthDate, 18, 70);
          if (!ageValidation.isValid) {
            newErrors.birthDate = ageValidation.error || "Edad no permitida";
            const age = calculateAge(birthDate);
            logValidationAttempt('age', false, { birthDate, age, error: ageValidation.error });
          } else {
            const age = calculateAge(birthDate);
            logValidationAttempt('age', true, { birthDate, age });
          }
        }
      }
      
      if (!confirmPassword) newErrors.confirmPassword = "Por favor confirma tu contraseña";
      else if (password !== confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
      setGeneralError("");

      // LOCATION VALIDATION - Peru only
      if (permissionStatus === 'denied') {
        Alert.alert(
          " Ubicación Requerida",
          "QORIBET está disponible únicamente en Perú por regulaciones de juego responsable.\n\n" +
          "Para continuar, necesitamos verificar tu ubicación. Por favor, habilita los permisos de ubicación en:" +
          "\n\n📱 Ajustes → Aplicaciones → QORIBET → Permisos → Ubicación → Permitir",
          [
            { 
              text: "Abrir Configuración", 
              onPress: () => {
                requestPermission();
                showToast("Habilita el permiso de ubicación y vuelve a intentarlo", "info");
              }
            },
            { text: "Cancelar", style: "cancel" }
          ]
        );
        logValidationAttempt('location', false, { reason: 'permission_denied', mode });
        return;
      }

      if (permissionStatus === 'undetermined') {
        Alert.alert(
          " Verificación de Ubicación",
          "QORIBET está disponible únicamente en Perú.\n\n" +
          "Necesitamos verificar tu ubicación para cumplir con las regulaciones de juego responsable.\n\n" +
          "✓ Tu ubicación solo se usa para verificar que estás en Perú\n" +
          "✓ No compartimos tu ubicación con terceros\n" +
          "✓ Puedes desactivarla después del registro",
          [
            {
              text: "Permitir Ubicación", 
              onPress: async () => {
                const status = await requestPermission();
                if (status === 'granted') {
                  showToast("Verificando ubicación...", "info");
                  // Wait a bit for location context to update
                  setTimeout(() => handleSubmit(), 1000);
                } else {
                  showToast("Permiso de ubicación denegado", "error");
                }
              }
            },
            { text: "Cancelar", style: "cancel" }
          ]
        );
        return;
      }

      if (locationLoading) {
        showToast("Verificando ubicación...", "info");
        return;
      }

      if (isInPeru === false) {
        Alert.alert(
          "Servicio No Disponible",
          "Lo sentimos, QORIBET está disponible únicamente en Perú. Tu ubicación actual indica que no te encuentras en el territorio peruano.",
          [{ text: "Entendido" }]
        );
        logValidationAttempt('location', false, { reason: 'outside_peru', mode });
        return;
      }

      if (isInPeru === null) {
        Alert.alert(
          "Error de Ubicación",
          "No pudimos verificar tu ubicación. Por favor, asegúrate de tener GPS activado e internet disponible.",
          [{
            text: "Reintentar", onPress: async () => {
              await requestPermission();
            }
          },
          { text: "Cancelar", style: "cancel" }]
        );
        return;
      }

      // Location validated - now validate form
      if (!validateForm()) return;

      setIsLoading(true);
      try {
        if (mode === "login") {
          console.log('[AUTH MODAL] Attempting login with:', email);
          const userData = await login({ email: email, password });
          console.log('[AUTH MODAL] Login successful');

          handleClose();

          // Show welcome message after modal closes
          setTimeout(() => {
            const displayName = userData?.firstName || "Usuario";
            showToast(`¡Bienvenido de nuevo, ${displayName}!`, "success");
          }, 300);
        } else {
          // Construct payload matching backend RegisterRequest
          const formattedPhone = toE164Format(phone);

          const payload = {
            username: email,
            email,
            password,
            firstName,
            lastName,
            phone: formattedPhone,
            dni,
            birthDate,
            address: "Default Address",
          };
          console.log('[AUTH MODAL] Attempting registration');

          // Register now returns LoginResponse with token (Auto-login)
          const loginResponse = await register(payload);

          handleClose();

          // Show success toast
          setTimeout(() => {
            showToast(`¡Bienvenido, ${firstName}! Tu cuenta ha sido creada.`, "success");
          }, 300);
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
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingBottom: Platform.OS === 'android' ? spacing.xl : 0,
                }}
                keyboardShouldPersistTaps="handled"
              >
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
                            placeholder="Numero de DNI"
                            keyboardType="numeric"
                            maxLength={8}
                          />
                          {errors.dni && <Text style={styles.errorText}>{errors.dni}</Text>}
                        </View>

                        <View>
                          <Text style={styles.label}>Teléfono (9 dígitos)</Text>
                          <View style={styles.validationInputContainer}>
                            <Input
                              value={formatPeruvianPhone(phone)}
                              onChangeText={(text) => {
                                const digitsOnly = text.replace(/\D/g, '');
                                const limited = digitsOnly.slice(0, 9);
                                setPhone(limited);
                                if (errors.phone) setErrors({ ...errors, phone: "" });
                                
                                // Real-time validation feedback
                                if (limited.length === 0) {
                                  setPhoneValidationState('idle');
                                } else if (limited.length === 9) {
                                  const validation = validatePeruvianPhone(limited);
                                  setPhoneValidationState(validation.isValid ? 'valid' : 'invalid');
                                } else {
                                  setPhoneValidationState('invalid');
                                }
                              }}
                              placeholder="987 654 321"
                              keyboardType="phone-pad"
                              maxLength={11}
                            />
                            {phoneValidationState === 'valid' && (
                              <View style={styles.validationIcon}>
                                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                              </View>
                            )}
                            {phoneValidationState === 'invalid' && phone.length > 0 && (
                              <View style={styles.validationIcon}>
                                <Ionicons name="close-circle" size={20} color={colors.destructive.DEFAULT} />
                              </View>
                            )}
                          </View>
                          <Text style={[styles.hintText, { color: colors.muted.foreground }]}>
                            📱 Número móvil peruano (debe comenzar con 9)
                          </Text>
                          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                        </View>

                        <View>
                          <Text style={styles.label}>Fecha de Nacimiento</Text>
                          {Platform.OS === 'web' ? (
                            // Web: Use native HTML date input
                            <View style={styles.validationInputContainer}>
                              <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setBirthDate(value);
                                  if (errors.birthDate) setErrors({ ...errors, birthDate: "" });
                                  
                                  // Real-time age validation
                                  if (value) {
                                    const ageValidation = validateAge(value, 18, 70);
                                    setAgeValidationState(ageValidation.isValid ? 'valid' : 'invalid');
                                  } else {
                                    setAgeValidationState('idle');
                                  }
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
                              {ageValidationState === 'valid' && (
                                <View style={[styles.validationIcon, { top: 12 }]}>
                                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                </View>
                              )}
                              {ageValidationState === 'invalid' && birthDate && (
                                <View style={[styles.validationIcon, { top: 12 }]}>
                                  <Ionicons name="close-circle" size={20} color={colors.destructive.DEFAULT} />
                                </View>
                              )}
                            </View>
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
                                {ageValidationState === 'valid' && (
                                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                )}
                                {ageValidationState === 'invalid' && birthDate && (
                                  <Ionicons name="close-circle" size={20} color={colors.destructive.DEFAULT} />
                                )}
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
                          {birthDate && ageValidationState !== 'invalid' && (
                            <Text style={[styles.hintText, { color: colors.muted.foreground }]}>
                              🎂 Tienes {calculateAge(birthDate)} años
                            </Text>
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
                          onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) setErrors({ ...errors, password: "" });
                            // Update password requirements in real-time
                            if (mode === "register") {
                              const requirements = validatePassword(text);
                              setPasswordRequirements(requirements);
                            }
                          }}
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
                      
                      {/* Password Requirements - Only show in register mode */}
                      {mode === "register" && password.length > 0 && (
                        <View style={styles.passwordRequirements}>
                          <Text style={[styles.requirementsTitle, { color: colors.muted.foreground }]}>
                            Requisitos de contraseña:
                          </Text>
                          <View style={styles.requirementsList}>
                            <View style={styles.requirementItem}>
                              <Ionicons 
                                name={passwordRequirements.length ? "checkmark-circle" : "close-circle"} 
                                size={16} 
                                color={passwordRequirements.length ? "#10b981" : colors.muted.foreground} 
                              />
                              <Text style={[
                                styles.requirementText,
                                { color: passwordRequirements.length ? "#10b981" : colors.muted.foreground }
                              ]}>
                                Mínimo 8 caracteres
                              </Text>
                            </View>
                            <View style={styles.requirementItem}>
                              <Ionicons 
                                name={passwordRequirements.upper ? "checkmark-circle" : "close-circle"} 
                                size={16} 
                                color={passwordRequirements.upper ? "#10b981" : colors.muted.foreground} 
                              />
                              <Text style={[
                                styles.requirementText,
                                { color: passwordRequirements.upper ? "#10b981" : colors.muted.foreground }
                              ]}>
                                Una letra mayúscula
                              </Text>
                            </View>
                            <View style={styles.requirementItem}>
                              <Ionicons 
                                name={passwordRequirements.lower ? "checkmark-circle" : "close-circle"} 
                                size={16} 
                                color={passwordRequirements.lower ? "#10b981" : colors.muted.foreground} 
                              />
                              <Text style={[
                                styles.requirementText,
                                { color: passwordRequirements.lower ? "#10b981" : colors.muted.foreground }
                              ]}>
                                Una letra minúscula
                              </Text>
                            </View>
                            <View style={styles.requirementItem}>
                              <Ionicons 
                                name={passwordRequirements.number ? "checkmark-circle" : "close-circle"} 
                                size={16} 
                                color={passwordRequirements.number ? "#10b981" : colors.muted.foreground} 
                              />
                              <Text style={[
                                styles.requirementText,
                                { color: passwordRequirements.number ? "#10b981" : colors.muted.foreground }
                              ]}>
                                Un número
                              </Text>
                            </View>
                            <View style={styles.requirementItem}>
                              <Ionicons 
                                name={passwordRequirements.special ? "checkmark-circle" : "close-circle"} 
                                size={16} 
                                color={passwordRequirements.special ? "#10b981" : colors.muted.foreground} 
                              />
                              <Text style={[
                                styles.requirementText,
                                { color: passwordRequirements.special ? "#10b981" : colors.muted.foreground }
                              ]}>
                                Un carácter especial (@$!%*?&)
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                      
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
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                      </View>
                    )}

                    {mode === "login" && (
                      <View style={styles.forgotPasswordContainer}>
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
      </Modal >
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
        padding: Platform.OS === 'android' ? spacing.sm : spacing.lg, // Reduced padding on Android
      },
      card: {
        width: "100%",
        maxWidth: 448,
        backgroundColor: colors.card.DEFAULT,
        maxHeight: Platform.OS === 'android' ? "95%" : "90%", // More height on Android
      },
      content: {
        padding: Platform.OS === 'android' ? spacing.md : spacing.xl, // Reduced padding on Android
        paddingBottom: Platform.OS === 'android' ? spacing.xl : spacing.xl, // Extra bottom padding for button visibility
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: Platform.OS === 'android' ? spacing.lg : spacing.xl,
      },
      title: {
        fontSize: Platform.OS === 'android' ? fontSize.xl : fontSize["2xl"], // Slightly smaller on Android
        fontWeight: fontWeight.bold,
        color: colors.foreground,
      },
      form: {
        gap: Platform.OS === 'android' ? spacing.md : spacing.lg, // Reduced gap on Android
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
        backgroundColor: "rgba(239, 68, 68, 0.1)",
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
      forgotPasswordContainer: {
        alignItems: "flex-end",
      },
      passwordRequirements: {
        marginTop: spacing.sm,
        padding: spacing.sm,
        backgroundColor: colors.muted.DEFAULT + '10',
        borderRadius: borderRadius.sm,
      },
      requirementsTitle: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.xs,
      },
      requirementsList: {
        gap: spacing.xs,
      },
      requirementItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
      },
      requirementText: {
        fontSize: fontSize.xs,
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
        marginBottom: Platform.OS === 'android' ? spacing.lg : 0, // Extra bottom margin on Android
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
      validationInputContainer: {
        position: 'relative',
        width: '100%',
      },
      validationIcon: {
        position: 'absolute',
        right: spacing.md,
        top: 12,
        zIndex: 10,
      },
      hintText: {
        fontSize: fontSize.xs,
        marginTop: spacing.xs,
        fontStyle: 'italic',
      },
    });
