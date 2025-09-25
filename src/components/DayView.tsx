import React, { useMemo, useState, useEffect } from 'react';
import { Appointment } from '../types';
import { ClockIcon, ServiceIcon, LocationIcon, CalendarIcon, ProfessionalIcon } from './icons';

interface DayViewProps {
  appointments: Appointment[];
  selectedDate: string;
  onAppointmentClick?: (appointment: Appointment) => void;
}

interface TimeSlot {
  hour: number;
  minute: number;
  time: string;
  fullTime: string;
}

const DayView: React.FC<DayViewProps> = ({
  appointments,
  selectedDate,
  onAppointmentClick
}) => {
  // Calcular rango dinámico basado en las citas del día
  const timeRange = useMemo(() => {
    if (appointments.length === 0) {
      return null; // Sin citas
    }

    let earliestHour = 23;
    let latestHour = 0;

    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.fecha);
      const hour = appointmentDate.getHours();
      const minute = appointmentDate.getMinutes();
      const duration = parseInt(appointment.duracion || '60');

      // Hora de inicio (redondeada hacia abajo)
      const startHour = hour;

      // Hora de fin (redondeada hacia arriba)
      const endMinutes = minute + duration;
      const endHour = hour + Math.floor(endMinutes / 60);
      const finalEndHour = endMinutes % 60 > 0 ? endHour + 1 : endHour;

      earliestHour = Math.min(earliestHour, startHour);
      latestHour = Math.max(latestHour, finalEndHour);
    });

    return { start: earliestHour, end: latestHour };
  }, [appointments]);

  // Generar slots de tiempo dinámicos
  const timeSlots = useMemo((): TimeSlot[] => {
    if (!timeRange) return [];

    const slots: TimeSlot[] = [];
    for (let hour = timeRange.start; hour <= timeRange.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === timeRange.end && minute > 0) break; // Terminar en la hora exacta final

        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const fullTimeString = `${timeString}:00`;

        slots.push({
          hour,
          minute,
          time: timeString,
          fullTime: fullTimeString
        });
      }
    }
    return slots;
  }, [timeRange]);

  // Procesar citas para posicionarlas en el timeline
  const processedAppointments = useMemo(() => {
    if (!timeRange) return [];

    return appointments.map((appointment, index) => {
      const appointmentDate = new Date(appointment.fecha);
      const hour = appointmentDate.getHours();
      const minute = appointmentDate.getMinutes();

      // Usar la duración real de la cita (en minutos)
      const duration = parseInt(appointment.duracion || '60');

      // Calcular posición exacta en minutos desde el inicio del rango dinámico
      const startMinutes = (hour - timeRange.start) * 60 + minute;

      // Con slots de 80px cada 30min, cada minuto = 80/30 = 2.67px
      const pixelsPerMinute = 80 / 30;
      const heightPx = Math.max(40, duration * pixelsPerMinute);

      return {
        ...appointment,
        index,
        hour,
        minute,
        startMinutes,
        durationMinutes: duration,
        heightPx,
        pixelsPerMinute,
        timeDisplay: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      };
    });
  }, [appointments, timeRange]);

  const handleAppointmentClick = (appointment: Appointment) => {
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header del día optimizado para iPad */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-exora-primary/5 to-exora-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {formatDate(selectedDate)}
            </h2>
            <p className="text-base text-gray-600 mt-1">
              {processedAppointments.length} citas programadas
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <ClockIcon size={18} className="text-exora-primary mr-2" />
              <span className="text-sm font-medium text-gray-900">
                {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline optimizado para iPad */}
      <div className="flex-1 overflow-y-auto px-4">
        {!timeRange ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center text-gray-500 bg-gray-50 p-12 rounded-2xl">
              <CalendarIcon size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium mb-2">No hay citas disponibles hoy</p>
              <p className="text-base text-gray-600">Selecciona otra fecha para ver las citas programadas</p>
            </div>
          </div>
        ) : (
          <div className="relative my-6">
            {/* Timeline continuo optimizado para iPad */}
            <div className="relative bg-white rounded-lg shadow-sm border border-gray-100" style={{ height: `${timeSlots.length * 80}px`, minHeight: '600px' }}>
              {/* Grid de horarios de fondo */}
            <div className="grid grid-cols-1 gap-0">
              {timeSlots.map((slot) => (
                <div
                  key={`${slot.hour}-${slot.minute}`}
                  className="border-b border-gray-100 h-[80px] flex hover:bg-gray-50/50 transition-colors relative"
                >
                  {/* Columna de hora más ancha para iPad */}
                  <div className="w-24 flex-shrink-0 p-3 border-r border-gray-100 bg-gray-50/30">
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-sm font-semibold text-gray-700">
                        {slot.time}
                      </span>
                      {slot.minute === 0 && (
                        <div className="w-2 h-2 bg-exora-primary rounded-full mt-2 opacity-60"></div>
                      )}
                    </div>
                  </div>

                  {/* Columna de contenido más espaciosa */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-0 border-l-2 border-gray-200 ml-6"></div>
                    {/* Líneas de minutos cada 15 minutos */}
                    {slot.minute === 15 && (
                      <div className="absolute right-0 top-1/2 w-3 h-px bg-gray-300 -translate-y-0.5"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Citas posicionadas absolutamente - optimizado para iPad */}
            <div className="absolute top-0 left-24 right-0 bottom-0">
              {processedAppointments.map((appointment) => {
                // Posición vertical exacta basada en minutos reales
                // Cada slot de 30min = 80px, entonces cada minuto = 80/30 = 2.67px
                const topPosition = appointment.startMinutes * appointment.pixelsPerMinute;
                const heightPx = appointment.heightPx;

                return (
                  <button
                    key={appointment._id}
                    onClick={() => handleAppointmentClick(appointment)}
                    className="absolute left-4 right-4 text-left p-4 rounded-xl transition-all duration-200 hover:shadow-lg border-l-4 hover:scale-[1.02] group"
                    style={{
                      top: `${topPosition}px`,
                      height: `${heightPx}px`,
                      backgroundColor: appointment.pagada ? '#F0F9FF' : '#FCFFA8',
                      borderLeftColor: appointment.profesional.color || '#555BF6',
                      zIndex: 10
                    }}
                  >
                    <div className="h-full flex flex-col justify-start overflow-hidden p-1">
                      {/* Header con hora y estado de pago */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white bg-gray-800 px-2 py-1 rounded">
                          {appointment.timeDisplay}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs px-2 py-1 rounded font-bold ${
                            appointment.pagada
                              ? 'bg-green-500 text-white'
                              : 'bg-yellow-400 text-gray-800'
                          }`}>
                            {appointment.pagada ? 'PAGADO' : 'PENDIENTE'}
                          </span>
                        </div>
                      </div>

                      {/* Información principal */}
                      <div className="flex-1 flex flex-col justify-start space-y-1">
                        {/* Cliente */}
                        <div className="text-base font-bold text-gray-900 truncate">
                          {appointment.usuario.nombre}
                        </div>

                        {/* Servicios - Mostrar hasta 2 servicios */}
                        <div className="space-y-1">
                          {appointment.servicios.slice(0, 2).map((servicio, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 flex-1 min-w-0">
                                <ServiceIcon size={12} className="text-gray-500 flex-shrink-0" />
                                <span className="text-xs text-gray-700 truncate font-medium">
                                  {servicio.nombre}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-exora-primary ml-2">
                                {servicio.precio.toFixed(0)}€
                              </span>
                            </div>
                          ))}
                          {appointment.servicios.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{appointment.servicios.length - 2} más...
                            </div>
                          )}
                        </div>

                        {/* Profesional */}
                        <div className="flex items-center space-x-1">
                          <ProfessionalIcon size={12} className="text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 truncate">
                            {appointment.profesional.nombre}
                          </span>
                        </div>

                        {/* Footer con importe total, duración y sucursal */}
                        <div className="mt-auto pt-1 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <LocationIcon size={10} className="text-gray-400" />
                              <span>{appointment.sucursal.nombre}</span>
                              <ClockIcon size={10} className="text-gray-400" />
                              <span>{appointment.durationMinutes}'</span>
                            </div>
                            <div className="text-sm font-bold text-exora-primary">
                              {appointment.importe.toFixed(2)}€
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            </div>

            {/* Línea de tiempo actual */}
            <CurrentTimeLine selectedDate={selectedDate} timeRange={timeRange} />
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para mostrar la línea de tiempo actual
const CurrentTimeLine: React.FC<{ selectedDate: string; timeRange: { start: number; end: number } | null }> = ({ selectedDate, timeRange }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar la hora cada minuto
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Actualizar inmediatamente
    updateTime();

    // Configurar intervalo para actualizar cada minuto
    const interval = setInterval(updateTime, 60000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, []);

  const currentTimePosition = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    // Solo mostrar si es el día actual y hay un rango definido
    if (selectedDate !== today || !timeRange) return null;

    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();

    // Extender el rango para mostrar la línea aunque esté ligeramente fuera
    const extendedStart = Math.max(0, timeRange.start - 1);
    const extendedEnd = Math.min(23, timeRange.end + 1);

    // Solo mostrar si la hora actual está dentro del rango extendido
    if (hour < extendedStart || hour > extendedEnd) return null;

    // Calcular posición exacta en minutos desde el inicio del rango dinámico
    // Cada slot de 30min = 80px, entonces cada minuto = 80/30 = 2.67px
    const pixelsPerMinute = 80 / 30;
    const totalMinutesFromStart = (hour - timeRange.start) * 60 + minute;

    return totalMinutesFromStart * pixelsPerMinute;
  }, [selectedDate, timeRange, currentTime]);

  if (currentTimePosition === null) return null;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${currentTimePosition}px` }}
    >
      <div className="flex items-center">
        <div className="w-24 flex justify-center">
          <div className="flex items-center bg-red-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="flex-1 h-1 bg-red-500 shadow-sm relative">
          <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-red-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default DayView;