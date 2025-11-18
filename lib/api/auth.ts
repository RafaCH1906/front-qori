import api from './axios';

export type LoginPayload = {
  username?: string;
  email?: string;
  password: string;
};

export type RegisterPayload = {
  username?: string;
  email: string;
  password: string;
  name?: string;
  [key: string]: any;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: any;
};

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export async function register(payload: RegisterPayload): Promise<any> {
  const response = await api.post('/auth/register', payload);
  return response.data;
}

export async function logout(refreshToken?: string | null): Promise<void> {
  try {
    await api.post('/auth/logout', { refreshToken });
  } catch (error) {
    // Ignore logout errors
    console.error('Logout error:', error);
  }
}

export async function getCurrentUser(): Promise<any> {
  const response = await api.get('/auth/me');
  return response.data;
}
