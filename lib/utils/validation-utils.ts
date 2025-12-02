// Validation utilities for QORIBET

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export function validatePeruvianPhone(phone: string): ValidationResult {
    if (!phone) {
        return { isValid: false, error: "El número de teléfono es obligatorio" };
    }

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // Remove leading +51 if present
    const phoneDigits = digitsOnly.startsWith('51') ? digitsOnly.slice(2) : digitsOnly;

    if (phoneDigits.length !== 9) {
        return {
            isValid: false,
            error: "El número de teléfono debe contener exactamente 9 dígitos"
        };
    }

    // Peruvian mobile numbers start with 9
    if (!phoneDigits.startsWith('9')) {
        return {
            isValid: false,
            error: "El número de teléfono móvil debe comenzar con 9"
        };
    }

    return { isValid: true };
}

export function formatPeruvianPhone(phone: string): string {
    const digitsOnly = phone.replace(/\D/g, '');
    const phoneDigits = digitsOnly.startsWith('51') ? digitsOnly.slice(2) : digitsOnly;

    // Format as: XXX XXX XXX
    if (phoneDigits.length >= 9) {
        return `${phoneDigits.slice(0, 3)} ${phoneDigits.slice(3, 6)} ${phoneDigits.slice(6, 9)}`;
    } else if (phoneDigits.length >= 6) {
        return `${phoneDigits.slice(0, 3)} ${phoneDigits.slice(3, 6)} ${phoneDigits.slice(6)}`;
    } else if (phoneDigits.length >= 3) {
        return `${phoneDigits.slice(0, 3)} ${phoneDigits.slice(3)}`;
    }

    return phoneDigits;
}

export function toE164Format(phone: string): string {
    const digitsOnly = phone.replace(/\D/g, '');
    const phoneDigits = digitsOnly.startsWith('51') ? digitsOnly.slice(2) : digitsOnly;
    return `+51${phoneDigits}`;
}

export function getCurrentPeruDate(): Date {
    // Peru is UTC-5 (no daylight saving)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const peruTime = new Date(utc + (3600000 * -5));
    return peruTime;
}

export function calculateAge(birthDate: string, referenceDate?: Date): number {
    const birth = new Date(birthDate);
    const today = referenceDate || getCurrentPeruDate();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // Adjust if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

export function validateAge(
    birthDate: string,
    minAge: number = 18,
    maxAge: number = 70
): ValidationResult {
    if (!birthDate) {
        return { isValid: false, error: "La fecha de nacimiento es obligatoria" };
    }

    const age = calculateAge(birthDate);

    if (age < minAge) {
        return {
            isValid: false,
            error: `Debes tener al menos ${minAge} años para crear una cuenta`
        };
    }

    if (age > maxAge) {
        return {
            isValid: false,
            error: `Lo sentimos, el servicio está disponible solo para personas de hasta ${maxAge} años`
        };
    }

    return { isValid: true };
}

export function isValidDate(dateString: string): ValidationResult {
    if (!dateString) {
        return { isValid: false, error: "La fecha es obligatoria" };
    }

    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
        return { isValid: false, error: "Formato de fecha inválido (use YYYY-MM-DD)" };
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return { isValid: false, error: "Fecha inválida" };
    }

    // Check if date is not in the future
    if (date > getCurrentPeruDate()) {
        return { isValid: false, error: "La fecha no puede ser futura" };
    }

    return { isValid: true };
}

export function logValidationAttempt(
    type: 'phone' | 'age' | 'location',
    success: boolean,
    details?: Record<string, any>
): void {
    const timestamp = getCurrentPeruDate().toISOString();
    const logEntry = {
        timestamp,
        type,
        success,
        ...details,
    };

    console.log('[ValidationLog]', JSON.stringify(logEntry));
}

// Password Validation Helper
export const validatePassword = (password: string) => {
    return {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&\-+#]/.test(password),
        isValid: password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /\d/.test(password) &&
            /[@$!%*?&\-+#]/.test(password)
    };
};
