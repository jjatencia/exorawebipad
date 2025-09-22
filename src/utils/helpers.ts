export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDateForAPILocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

export const isValidEmail = (email: string): boolean => {
  // Usar validación más estricta de SecurityUtils
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Sanitiza comentarios para prevenir XSS
 */
export const sanitizeComment = (comment: string): string => {
  if (!comment || typeof comment !== 'string') return '';

  return comment
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim()
    .substring(0, 500); // Limitar longitud
};

/**
 * Valida que un importe sea seguro
 */
export const isValidAmount = (amount: number): boolean => {
  return typeof amount === 'number' &&
         !isNaN(amount) &&
         amount >= 0 &&
         amount <= 999999; // Límite razonable
};

/**
 * Valida ID de MongoDB
 */
export const isValidObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let timeoutId: number;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  }) as T;
};

/**
 * Determina si una cita debe estar deshabilitada basándose en:
 * - Si está pagada
 * - Si ya pasó su hora + 15 minutos de margen
 */
export const isAppointmentDisabled = (appointment: any): boolean => {
  if (!appointment.pagada) {
    return false;
  }

  const now = new Date();
  const appointmentDateTime = new Date(appointment.fecha);

  // Agregar 15 minutos de margen
  appointmentDateTime.setMinutes(appointmentDateTime.getMinutes() + 15);

  // Si la hora actual es mayor que la hora de la cita + 15 min, deshabilitar
  return now > appointmentDateTime;
};