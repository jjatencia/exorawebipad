import CryptoJS from 'crypto-js';

// Clave de cifrado (en producción debería venir de variables de entorno)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-should-be-changed';

/**
 * Utilidades de seguridad centralizadas
 */
export class SecurityUtils {
  /**
   * Cifra datos sensibles antes de almacenarlos
   */
  static encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Error al cifrar datos');
      throw new Error('Encryption failed');
    }
  }

  /**
   * Descifra datos previamente cifrados
   */
  static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error al descifrar datos');
      throw new Error('Decryption failed');
    }
  }

  /**
   * Sanitiza entrada de texto para prevenir XSS
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .trim();
  }

  /**
   * Valida email con regex estricta
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  /**
   * Valida que un importe sea válido
   */
  static isValidAmount(amount: number): boolean {
    return typeof amount === 'number' &&
           !isNaN(amount) &&
           amount >= 0 &&
           amount <= 999999; // Límite razonable
  }

  /**
   * Valida ID de MongoDB
   */
  static isValidObjectId(id: string): boolean {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }

  /**
   * Valida fecha en formato esperado
   */
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Genera un nonce para CSP
   */
  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Valida JWT token básico (estructura)
   */
  static isValidJWTStructure(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Verifica si un token JWT ha expirado
   */
  static isTokenExpired(token: string): boolean {
    try {
      if (!this.isValidJWTStructure(token)) return true;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      return true; // Si no se puede parsear, considerarlo expirado
    }
  }

  /**
   * Limpia datos sensibles de objetos para logs
   */
  static sanitizeForLogging(obj: any): any {
    const sensitiveFields = ['password', 'token', 'authorization', 'x-token', 'email', 'telefono'];

    const sanitized = { ...obj };

    const recursiveSanitize = (item: any, path: string = ''): any => {
      if (typeof item !== 'object' || item === null) return item;

      if (Array.isArray(item)) {
        return item.map((element, index) => recursiveSanitize(element, `${path}[${index}]`));
      }

      const result: any = {};
      Object.keys(item).forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;

        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '[REDACTED]';
        } else if (typeof item[key] === 'object') {
          result[key] = recursiveSanitize(item[key], fullPath);
        } else {
          result[key] = item[key];
        }
      });

      return result;
    };

    return recursiveSanitize(sanitized);
  }

  /**
   * Headers de seguridad recomendados para requests
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }
}

/**
 * Hook para almacenamiento seguro en localStorage
 */
export class SecureStorage {
  static setItem(key: string, value: string): void {
    try {
      const encryptedValue = SecurityUtils.encrypt(value);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error storing secure data');
      throw error;
    }
  }

  static getItem(key: string): string | null {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;

      return SecurityUtils.decrypt(encryptedValue);
    } catch (error) {
      console.error('Error retrieving secure data');
      // Si no se puede descifrar, eliminar el item corrupto
      localStorage.removeItem(key);
      return null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }
}