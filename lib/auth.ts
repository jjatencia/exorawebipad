interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  ok: boolean;
  token?: string;
  user?: {
    _id: string;
    nombre: string;
    email: string;
  };
  msg?: string;
}

export class AuthService {
  private static readonly API_BASE = 'https://api.exora.app/api';
  private static readonly TOKEN_KEY = 'exora_token';

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/ext-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.ok && data.token) {
        this.setToken(data.token);
      }

      // Transform the response to match our expected format
      return {
        ok: data.ok,
        token: data.token,
        user: data.ok ? {
          _id: data.uid,
          nombre: data.nombre,
          email: data.email
        } : undefined,
        msg: data.msg
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        ok: false,
        msg: 'Error de conexión'
      };
    }
  }

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  static logout(): void {
    this.removeToken();
  }
}