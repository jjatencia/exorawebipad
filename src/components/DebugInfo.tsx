import React from 'react';
import { useAppointmentStore } from '../stores/appointmentStore';
import { MOCK_APPOINTMENTS } from '../mocks/appointments';

const DebugInfo: React.FC = () => {
  const { appointments, currentDate, isLoading } = useAppointmentStore();

  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  const todayDisplay = today.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg m-4 text-xs">
      <h3 className="font-bold mb-2">🐛 Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Current Date:</strong> {currentDate}</div>
        <div><strong>Today API Format:</strong> {todayFormatted}</div>
        <div><strong>Today Display:</strong> {todayDisplay}</div>
        <div><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
        <div><strong>Appointments Count:</strong> {appointments.length}</div>
        <div><strong>Mock Data Count:</strong> {MOCK_APPOINTMENTS.length}</div>
        
        <div className="mt-2">
          <strong>Sample Mock Dates:</strong>
          {MOCK_APPOINTMENTS.slice(0, 3).map((app, i) => (
            <div key={i} className="ml-2">
              • {app.cliente}: {app.apiDate} (display: {app.fecha})
            </div>
          ))}
        </div>
        
        <div className="mt-2">
          <strong>Current Appointments:</strong>
          {appointments.length > 0 ? (
            appointments.map((app, i) => (
              <div key={i} className="ml-2">
                • {app.usuario.nombre} {app.usuario.apellidos}: {new Date(app.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            ))
          ) : (
            <div className="ml-2 text-red-600">No appointments found!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;