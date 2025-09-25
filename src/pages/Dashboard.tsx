import React from 'react';
import DayView from '../components/DayView';
import DateSelector from '../components/DateSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import AppointmentModal from '../components/AppointmentModal';
import { LogoutIcon, CalendarIcon, UserIcon, SettingsIcon, StatsIcon } from '../components/icons';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard: React.FC = () => {
  const {
    userName,
    isAuthenticated,
    currentDate,
    isLoading,
    error,
    showPaidOnly,
    filteredAppointments,
    selectedAppointment,
    handlers
  } = useDashboard();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Agenda Exora
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Hola, {userName}
              </p>
            </div>
            <button
              onClick={handlers.logout}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2"
              title="Cerrar sesión"
            >
              <LogoutIcon size={20} />
            </button>
          </div>

          {/* Date Selector */}
          <DateSelector selectedDate={currentDate} onDateChange={handlers.changeDate} />
        </div>

        {/* Stats Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <StatsIcon size={20} className="mr-2" />
            Resumen del Día
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total de citas</span>
              <span className="font-semibold text-gray-900">{filteredAppointments.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Citas {showPaidOnly ? 'pagadas' : 'pendientes'}</span>
              <span className="font-semibold text-exora-primary">{filteredAppointments.length}</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-6">
          <nav className="space-y-2">
            <div className="flex items-center px-3 py-2 text-sm font-medium text-exora-primary bg-exora-primary bg-opacity-10 rounded-lg">
              <CalendarIcon size={18} className="mr-3" />
              Calendario
            </div>
            <button className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <UserIcon size={18} className="mr-3" />
              Clientes
            </button>
            <button className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <SettingsIcon size={18} className="mr-3" />
              Configuración
            </button>
          </nav>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Cargando citas...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">Error al cargar las citas</p>
              <p className="text-sm mt-2">{error}</p>
              <button
                onClick={handlers.refreshAppointments}
                className="mt-4 px-4 py-2 bg-exora-primary text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <DayView
              appointments={filteredAppointments}
              selectedDate={currentDate}
              onAppointmentClick={handlers.selectAppointment}
            />
          </div>
        )}
      </div>

      {/* Modal de detalles de cita */}
      <AppointmentModal
        appointment={selectedAppointment}
        onClose={handlers.closeAppointmentModal}
        onCompletePayment={handlers.completePayment}
        onCompleteWalletPayment={handlers.completeWalletPayment}
        onMarkNoShow={handlers.markNoShow}
      />
    </div>
  );
};

export default Dashboard;
