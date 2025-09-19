import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const navigate = useNavigate();
  const { login, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const handlePasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }, []);

  const validateForm = useCallback((): boolean => {
    const result = loginSchema.safeParse({ email, password });

    if (result.success) {
      setErrors({});
      return true;
    }

    const newErrors: { email?: string; password?: string } = {};

    result.error.errors.forEach((err) => {
      if (err.path[0] === 'email') {
        newErrors.email = err.message;
      }

      if (err.path[0] === 'password') {
        newErrors.password = err.message;
      }
    });

    setErrors(newErrors);
    return false;
  }, [email, password]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error handled via toast inside store
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login, navigate, validateForm]);

  const isSubmitDisabled = useMemo(() => isLoading, [isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--exora-background)' }}>
      <div className="w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--exora-primary)' }}>
            Exora
          </h1>
          <p className="text-gray-600 text-lg">Gestión de Citas</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-exora-primary focus:border-transparent'
              }`}
              placeholder="tu@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                errors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-exora-primary focus:border-transparent'
              }`}
              placeholder="••••••••"
              disabled={isSubmitDisabled}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-3 px-4 rounded-lg text-white font-semibold text-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ backgroundColor: 'var(--exora-primary)' }}
          >
            {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="text-center mt-6">
          <button
            type="button"
            className="text-sm hover:underline transition-colors"
            style={{ color: 'var(--exora-primary)' }}
            onClick={() => {
              // Placeholder for forgot password functionality
              alert('Funcionalidad de recuperación de contraseña no implementada');
            }}
          >
            ¿Has olvidado tu contraseña?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
