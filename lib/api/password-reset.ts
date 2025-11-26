import api from "./axios";

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * Request password reset email
 */
export const forgotPassword = async (email: string): Promise<string> => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
};

/**
 * Reset password with token
 */
export const resetPassword = async (request: ResetPasswordRequest): Promise<string> => {
    const { data } = await api.post("/auth/reset-password", request);
    return data;
};

/**
 * Validate reset token
 */
export const validateResetToken = async (token: string): Promise<string> => {
    const { data } = await api.get(`/auth/reset-password?token=${token}`);
    return data;
};
