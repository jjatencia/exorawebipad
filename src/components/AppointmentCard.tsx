import React from 'react';
import { animated } from '@react-spring/web';
import { Appointment } from '../types';
import { isAppointmentDisabled } from '../utils/helpers';

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
  const isDisabled = isAppointmentDisabled(appointment);

  // Icono Teléfono (teléfono clásico)
  const PhoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92V19a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h2.09a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9a16 16 0 006.92 6.92l1.27-.36a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );

  // Icono Servicio (bolsa/shopping bag)
  const ServiceIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );

  // Icono Variante (flechas cruzadas curvas - como intercambio)
  const VariantIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Flecha curva superior */}
      <path d="M3 7h13l-4-4"/>
      <path d="M21 7l-4 4"/>

      {/* Flecha curva inferior */}
      <path d="M21 17H8l4 4"/>
      <path d="M3 17l4-4"/>
    </svg>
  );

  // Icono Ubicación (pin de localización)
  const LocationIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );


  // Icono Descuentos (porcentaje)
  const DiscountIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="5" x2="5" y2="19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  );

  // Icono Estado/Pago (tarjeta de crédito)
  const PaymentIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );

  // Icono Comentarios (mensaje)
  const CommentIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );


  return (
    <animated.div
      style={{
        ...style,
        backgroundColor: isDisabled ? '#f8f9fa' : 'white',
        borderRadius: '20px',
        boxShadow: isDisabled ? '0 2px 8px rgba(0, 0, 0, 0.04)' : '0 4px 15px rgba(0, 0, 0, 0.08)',
        cursor: isDisabled ? 'default' : 'pointer',
        zIndex: isActive ? 20 : 10,
        width: '90%',
        maxWidth: '380px',
        height: '90%', // Using 90% of available container
        maxHeight: '550px',
        minHeight: '400px',
        margin: '0 auto',
        position: 'relative',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.3s ease'
      }}
      onClick={isDisabled ? undefined : onClick}
    >
      <div className="p-6 h-full flex flex-col overflow-hidden">
        {/* Top section - Header */}
        <div className="flex-shrink-0">
          {/* Badge de estado pagada */}
          {appointment.pagada && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                PAGADA
              </span>
              {isDisabled && (
                <span className="text-xs text-gray-500 font-medium">
                  Cita finalizada
                </span>
              )}
            </div>
          )}

          {/* Cliente Name */}
          <div className="text-center mb-3">
            <h2 className={`text-3xl font-bold leading-tight ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
              {appointment.usuario.nombre} {appointment.usuario.apellidos}
            </h2>
          </div>

          {/* Hora */}
          <div className="text-center mb-5">
            <div
              className="text-5xl font-bold leading-none"
              style={{ color: isDisabled ? '#9ca3af' : 'var(--exora-primary)' }}
            >
              {new Date(appointment.fecha).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Middle section - Information */}
        <div className="flex-1 space-y-4 min-h-0">
          <div className={`flex items-center space-x-3 ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
            <PhoneIcon />
            <span className="text-base">{appointment.usuario.telefono}</span>
          </div>

          <div className={`flex items-start space-x-3 ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
            <ServiceIcon />
            <div className="flex-1">
              <div className="text-base font-medium">
                {appointment.servicios[0]?.nombre || 'Servicio no especificado'}
              </div>
            </div>
          </div>

          {appointment.variantes && appointment.variantes.length > 0 && (
            <div className={`flex items-start space-x-3 ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
              <VariantIcon />
              <div className="flex-1">
                <div className="text-base font-medium">Variante:</div>
                <div className={`text-sm mt-1 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                  {appointment.variantes.map(v => v.nombre).join(', ')}
                </div>
              </div>
            </div>
          )}

          <div className={`flex items-center space-x-3 ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
            <LocationIcon />
            <span className="text-base">{appointment.sucursal.nombre}</span>
          </div>

          <div className={`flex items-center space-x-3 ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
            <PaymentIcon />
            <span className="text-base">
              Estado: <span className={
                isDisabled
                  ? 'text-gray-400 font-medium'
                  : appointment.pagada
                    ? 'text-green-600 font-medium'
                    : 'text-orange-600 font-medium'
              }>
                {appointment.pagada ? 'Pagada' : 'Pendiente'}
              </span>
            </span>
          </div>

          {/* Promociones */}
          <div className={`flex items-start space-x-3 ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
            <DiscountIcon />
            <div className="flex-1">
              <div className="text-base font-medium">Promociones:</div>
              {appointment.promocion.length > 0 ? (
                <div className={`text-sm mt-1 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                  {appointment.promocion.map((promocionId: string, index: number) => {
                    // Mapeo temporal de IDs a nombres
                    let promocionNombre = "Promoción especial";

                    if (promocionId === "66945b4a5706bb70baa15bc0") {
                      promocionNombre = "Aleatorio o barbero Junior";
                    } else if (promocionId === "66aff43347f5e3f837f20ad7") {
                      promocionNombre = "Mañanas";
                    }

                    return (
                      <span key={promocionId || index} className="bg-green-50 text-green-700 px-2 py-1 rounded-md inline-block mr-1 mb-1">
                        {promocionNombre}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-600 mt-1">No</div>
              )}
            </div>
          </div>

          {appointment.comentarios && appointment.comentarios.length > 0 && (
            <div className="flex items-start space-x-3 text-gray-700 pt-3 border-t border-gray-200 mt-4">
              <div className="flex-shrink-0">
                <CommentIcon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 mb-2">Comentarios:</div>
                <div className="text-sm text-gray-600 leading-relaxed break-words">
                  {appointment.comentarios.map(comentario =>
                    typeof comentario === 'string' ? comentario :
                    (comentario?.texto || comentario?.comentario || JSON.stringify(comentario))
                  ).join(' | ')}
                </div>
              </div>
            </div>
          )}

          {appointment.usuario.comentarios && appointment.usuario.comentarios.length > 0 && (
            <div className="flex items-start space-x-3 text-gray-700 pt-3 border-t border-gray-200 mt-4">
              <div className="flex-shrink-0">
                <CommentIcon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 mb-2">Comentarios del cliente:</div>
                <div className="text-sm text-gray-600 leading-relaxed break-words">
                  {appointment.usuario.comentarios.map(comentario =>
                    typeof comentario === 'string' ? comentario :
                    (comentario?.texto || comentario?.comentario || JSON.stringify(comentario))
                  ).join(' | ')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom section - Date */}
        <div className="flex-shrink-0 pt-3 border-t border-gray-100 text-center">
          <div className="text-sm text-gray-500">
            {new Date(appointment.fecha).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export default AppointmentCard;