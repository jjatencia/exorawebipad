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
      const loginUrl = `${this.API_BASE}/auth/ext-login`;
      console.log('🔐 Attempting login with:', { email: credentials.email });
      console.log('🌐 Calling endpoint:', loginUrl);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);

        // Try to get error message from response
        try {
          const errorData = await response.json();
          console.log('❌ Error data:', errorData);
          return {
            ok: false,
            msg: errorData.msg || errorData.message || `Error HTTP ${response.status}`
          };
        } catch {
          return {
            ok: false,
            msg: `Error HTTP ${response.status}: ${response.statusText}`
          };
        }
      }

      const data = await response.json();
      console.log('✅ Login response:', { ok: data.ok, hasToken: !!data.token, msg: data.msg });

      if (data.ok && data.token) {
        this.setToken(data.token);
      }

      // Transform the response to match our expected format
      return {
        ok: data.ok,
        token: data.token,
        user: data.ok ? {
          _id: data.uid || data.id,
          nombre: data.nombre || data.name || credentials.email.split('@')[0],
          email: data.email || credentials.email
        } : undefined,
        msg: data.msg || data.message
      };
    } catch (error) {
      console.error('💥 Network/Parse error:', error);
      return {
        ok: false,
        msg: 'Error de conexión. Verifica tu internet.'
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