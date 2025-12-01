# Step-by-Step Integration Guide for Auth Modal Validations

This guide provides exact code snippets to integrate all validations into `auth-modal.tsx`.

## ✅ STEP 1: Add Imports (Lines 26-29)

**FIND** these lines:
```typescript
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/toast-context";
import { useRouter } from "expo-router";
```

**REPLACE** with:
```typescript
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/toast-context";
import { useRouter } from "expo-router";
import { useLocation } from "@/context/location-context";
import { 
  validatePeruvianPhone, 
  formatPeruvianPhone, 
  toE164Format,
  logValidationAttempt 
} from "@/lib/utils/validation-utils";
```

---

## ✅ STEP 2: Add Location Hook (Lines 77-80)

**FIND** these lines:
```typescript
  const { colors, isDark } = useTheme();
  const { login, register, user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
```

**REPLACE** with:
```typescript
  const { colors, isDark } = useTheme();
  const { login, register, user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const { isInPeru, isLoading: locationLoading, permissionStatus, requestPermission } = useLocation();
  const styles = useMemo(() => createStyles(colors), [colors]);
```

---

## ✅ STEP 3: Update Phone Validation (Lines 134-135)

**FIND** this line:
```typescript
      if (!phone) newErrors.phone = "Phone is required";
```

**REPLACE** with:
```typescript
      // Phone validation - 9 digits, Peru only
      const phoneValidation = validatePeruvianPhone(phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.error || "Invalid phone number";
        logValidationAttempt('phone', false, { phone: phone.replace(/\d/g, 'X') });
      } else {
        logValidationAttempt('phone', true);
      }
```

---

## ✅ STEP 4: Phone Input Field - Add Auto-Formatting (Lines 356-363)

**FIND** this code block:
```typescript
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
```

**REPLACE** with:
```typescript
                      <View>
                        <Text style={styles.label}>Teléfono (9 dígitos)</Text>
                        <Input
                          value={formatPeruvianPhone(phone)}
                          onChangeText={(text) => {
                            const digitsOnly = text.replace(/\D/g, '');
                            const limited = digitsOnly.slice(0, 9);
                            setPhone(limited);
                            if (errors.phone) setErrors({ ...errors, phone: "" });
                          }}
                          placeholder="987 654 321"
                          keyboardType="phone-pad"
                          maxLength={11}
                        />
                        <Text style={[styles.errorText, { color: colors.muted.foreground, marginTop: 4 }]}>
                          Número móvil peruano (debe comenzar con 9)
                        </Text>
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                      </View>
```

---

## ✅ STEP 5: Format Phone for Backend (Lines 190-198)

**FIND** this code:
```typescript
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
```

**REPLACE** with:
```typescript
        // Format phone to E.164 for backend storage
        const formattedPhone = toE164Format(phone);
        
        const payload = {
          username: email,
          email,
          password,
          firstName,
          lastName,
          phone: formattedPhone, // Send as +51XXXXXXXXX
          dni,
          birthDate,
          address: "Default Address",
        };
```

---

## ✅ STEP 6: Add Location Validation to handleSubmit (Line 173, BEFORE validateForm)

**FIND** this code at the start of `handleSubmit`:
```typescript
  const handleSubmit = async () => {
    setGeneralError("");
    if (!validateForm()) return;
```

**REPLACE** with:
```typescript
  const handleSubmit = async () => {
    setGeneralError("");
    
    // LOCATION VALIDATION - Peru only
    if (permissionStatus === 'denied') {
      Alert.alert(
        "Ubicación Requerida",
        "Necesitamos acceso a tu ubicación para verificar que estás en Perú. Este servicio está disponible únicamente en Perú.\n\nPor favor, habilita los permisos de ubicación en la configuración de tu dispositivo.",
        [
          { text: "Ir a Configuración", onPress: () => requestPermission() },
          { text: "Cancelar", style: "cancel" }
        ]
      );
      logValidationAttempt('location', false, { reason: 'permission_denied' });
      return;
    }

    if (permissionStatus === 'undetermined') {
      Alert.alert(
        "Ubicación Requerida",
        "Para usar QORIBET debes permitir el acceso a tu ubicación. Esto nos permite verificar que te encuentras en Perú.",
        [
          { text: "Permitir", onPress: async () => {
            await requestPermission();
          }},
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
        [{ text: "Reintentar", onPress: async () => {
          await requestPermission();
        }},
        { text: "Cancelar", style: "cancel" }]
      );
      return;
    }

    // Location validated - now validate form
    if (!validateForm()) return;
```

---

## 🎯 Summary

After applying all 6 steps:
- ✅ GPS validation will block non-Peru users
- ✅ Phone will auto-format and validate 9 digits
- ✅ Age validation 18-70 (you already added this!)
- ✅ All validations logged for security monitoring
- ✅ Phone stored in E.164 format (+51XXXXXXXXX)

Test carefully on both Android and iOS!
