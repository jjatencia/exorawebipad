import React from 'react';
import { animated } from '@react-spring/web';
import { Appointment } from '../types';

interface AppointmentCardProps {
  appointment: Appointment;
  style?: any;
  isActive?: boolean;
  onClick?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  style,
  isActive = false,
  onClick
}) => {
  const PhoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92V19a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h2.09a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9a16 16 0 006.92 6.92l1.27-.36a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );

  const ServiceIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.24 12.24a6 6 0 000-8.49L16.5 7.5a6 6 0 008.49 8.49l3.75-3.75z"/>
      <path d="M16 8L2 22"/>
      <path d="M17.5 15H9"/>
    </svg>
  );

  const LocationIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );

  const TagIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );

  const CommentIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );


  return (
    <animated.div
      style={{
        ...style,
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        cursor: 'pointer',
        zIndex: isActive ? 20 : 10,
        width: '90%',
        maxWidth: '380px',
        height: '90%', // Usar 90% del contenedor disponible
        maxHeight: '550px',
        minHeight: '400px',
        margin: '0 auto',
        position: 'relative'
      }}
      onClick={onClick}
    >
      <div className="p-6 h-full flex flex-col overflow-hidden">
        {/* Top section - Header */}
        <div className="flex-shrink-0">
          {/* Cliente Name */}
          <div className="text-center mb-3">
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              {appointment.cliente}
            </h2>
          </div>

          {/* Hora */}
          <div className="text-center mb-5">
            <div 
              className="text-5xl font-bold leading-none"
              style={{ color: 'var(--exora-primary)' }}
            >
              {appointment.hora}
            </div>
          </div>
        </div>

        {/* Middle section - Information */}
        <div className="flex-1 space-y-4 min-h-0">
          <div className="flex items-center space-x-3 text-gray-700">
            <PhoneIcon />
            <span className="text-base">{appointment.telefono}</span>
          </div>

          <div className="flex items-start space-x-3 text-gray-700">
            <ServiceIcon />
            <div className="flex-1">
              <div className="text-base font-medium">{appointment.servicio}</div>
              {appointment.variante && (
                <div className="text-sm text-gray-600 mt-1">{appointment.variante}</div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-700">
            <LocationIcon />
            <span className="text-base">{appointment.sucursal}</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-700">
            <TagIcon />
            <span className="text-base">
              Descuentos: <span className={appointment.descuentos === 'No' ? 'text-gray-500' : 'text-green-600 font-medium'}>{appointment.descuentos}</span>
            </span>
          </div>

          {appointment.comentarios && appointment.comentarios.trim() !== '' && (
            <div className="flex items-start space-x-3 text-gray-700 pt-3 border-t border-gray-200 mt-4">
              <div className="flex-shrink-0">
                <CommentIcon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 mb-2">Comentarios:</div>
                <div className="text-sm text-gray-600 leading-relaxed break-words">
                  {appointment.comentarios}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom section - Date */}
        <div className="flex-shrink-0 pt-3 border-t border-gray-100 text-center">
          <div className="text-sm text-gray-500">{appointment.fecha}</div>
        </div>
      </div>
    </animated.div>
  );
};

export default AppointmentCard;