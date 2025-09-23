import { API_BASE_URL, STORAGE_KEYS } from '../config/environment';
import { SecurityUtils, SecureStorage } from '../utils/security';
import { isValidEmail } from '../utils/helpers';

export interface LoginCredentials {
  email: string;
  password: string;
}

interface RawLoginResponse {
  ok: boolean;
  token?: string;
  uid?: string;
  id?: string;
  nombre?: string;
  name?: string;
  email?: string;
  msg?: string;
  message?: string;
}

export interface LoginResponse {
  ok: boolean;
  token?: string;
  user?: {
    _id: string;
    nombre: string;
    email: string;
  };
  msg?: string;
}

const resolveUser = (
  response: RawLoginResponse,
  credentials: LoginCredentials
): LoginResponse['user'] | undefined => {
  if (!response.ok) {
    return undefined;
  }

  const id = response.uid || response.id;
  const name = response.nombre || response.name || credentials.email.split('@')[0];
  const email = response.email || credentials.email;

  if (!id || !name) {
    return undefined;
  }

  return {
    _id: id,
    nombre: name,
    email
  };
};

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Validar credenciales antes de enviar
      if (!isValidEmail(credentials.email)) {
        return {
          ok: false,
          msg: 'Email inválido'
        };
      }

      if (!credentials.password || credentials.password.length < 1) {
        return {
          ok: false,
          msg: 'Password requerido'
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/ext-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...SecurityUtils.getSecurityHeaders()
        },
        body: JSON.stringify({
          email: SecurityUtils.sanitizeInput(credentials.email),
          password: credentials.password // No sanitizar passwords
        })
      });

      if (!response.ok) {
        let message = `Error HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          message = errorBody.msg || errorBody.message || message;
        } catch {
          // Mantener mensaje genérico si no se puede parsear
        }

        return {
          ok: false,
          msg: message
        };
      }

      const data: RawLoginResponse = await response.json();
      const user = resolveUser(data, credentials);

      if (data.ok && data.token) {
        // Validar estructura del token antes de almacenar
        if (SecurityUtils.isValidJWTStructure(data.token)) {
          this.setToken(data.token);

          // Almacenar datos de usuario de forma segura
          if (user) {
            SecureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
          }
        } else {
          return {
            ok: false,
            msg: 'Token inválido recibido del servidor'
          };
        }
      }

      return {
        ok: data.ok,
        token: data.token,
        user,
        msg: data.msg || data.message
      };
    } catch (error) {
      // No loggear el error completo por seguridad
      console.error('Login error');
      return {
        ok: false,
        msg: 'Error de conexión. Verifica tu internet.'
      };
    }
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return;

    // Validar token antes de almacenar
    if (!SecurityUtils.isValidJWTStructure(token)) {
      throw new Error('Token inválido');
    }

    SecureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;

    const token = SecureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    // Verificar si el token ha expirado
    if (token && SecurityUtils.isTokenExpired(token)) {
      this.removeToken();
      return null;
    }

    return token;
  }

  static removeToken(): void {
    if (typeof window === 'undefined') return;
    SecureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    SecureStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !SecurityUtils.isTokenExpired(token);
  }

  static getUserData(): any {
    if (typeof window === 'undefined') return null;

    try {
      const userData = SecureStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error reading user data');
      return null;
    }
  }

  static logout(): void {
    this.removeToken();
  }
}
