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

      // Calcular altura proporcional (2 píxeles por minuto para mejor visualización)
      const heightPx = Math.max(40, duration * 2);

      return {
        ...appointment,
        index,
        hour,
        minute,
        startMinutes,
        durationMinutes: duration,
        heightPx,
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
            <div className="relative bg-white rounded-lg shadow-sm border border-gray-100" style={{ height: `${timeSlots.length * 80}px` }}>
              {/* Grid de horarios de fondo */}
            <div className="grid grid-cols-1 gap-0">
              {timeSlots.map((slot) => (
                <div
                  key={`${slot.hour}-${slot.minute}`}
                  className="border-b border-gray-50 h-[80px] flex hover:bg-gray-50/50 transition-colors"
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
                    <div className="absolute inset-0 border-l-2 border-gray-100 ml-6"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Citas posicionadas absolutamente - optimizado para iPad */}
            <div className="absolute top-0 left-24 right-0 bottom-0">
              {processedAppointments.map((appointment) => {
                // Posición vertical exacta basada en minutos reales (80px por hora = 1.33px por minuto)
                const topPosition = appointment.startMinutes * 1.33;
                const heightPx = Math.max(60, appointment.durationMinutes * 1.33);

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
                    <div className="h-full flex flex-col justify-start overflow-hidden">
                      {/* Primera línea: Hora y Cliente - Más grande para iPad */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded">
                          {appointment.timeDisplay}
                        </span>
                        <span className="text-base font-bold truncate ml-3 group-hover:text-exora-primary transition-colors" style={{ color: '#555BF6' }}>
                          {appointment.usuario.nombre}
                        </span>
                      </div>

                      {/* Segunda línea: Servicio - Más prominente */}
                      <div className="flex items-center space-x-2 mb-2">
                        <ServiceIcon size={16} className="text-gray-600 flex-shrink-0" />
                        <span className="text-sm text-gray-800 truncate font-semibold">
                          {appointment.servicios[0]?.nombre || 'Sin servicio'}
                        </span>
                      </div>

                      {/* Tercera línea: Profesional - Más visible */}
                      <div className="flex items-center space-x-2 mb-2">
                        <ProfessionalIcon size={14} className="text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">
                          {appointment.profesional.nombre}
                        </span>
                      </div>

                      {/* Cuarta línea: Sucursal y duración - Siempre visible en iPad */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mt-auto">
                        <div className="flex items-center space-x-2">
                          <LocationIcon size={12} className="text-gray-500" />
                          <span className="font-medium">{appointment.sucursal.nombre}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon size={12} className="text-gray-500" />
                          <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                            {appointment.durationMinutes}min
                          </span>
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

    // Solo mostrar si la hora actual está dentro del rango dinámico
    if (hour < timeRange.start || hour > timeRange.end) return null;

    // Calcular posición exacta en minutos desde el inicio del rango dinámico (2px por minuto)
    const totalMinutesFromStart = (hour - timeRange.start) * 60 + minute;

    return totalMinutesFromStart * 2;
  }, [selectedDate, timeRange, currentTime]);

  if (currentTimePosition === null) return null;

  return (
    <div
      className="absolute left-0 right-0 z-10 pointer-events-none"
      style={{ top: `${currentTimePosition}px` }}
    >
      <div className="flex items-center">
        <div className="w-16 flex justify-center">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
        <div className="flex-1 h-0.5 bg-red-500"></div>
      </div>
    </div>
  );
};

export default DayView;