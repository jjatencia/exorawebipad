import React from 'react';
import CardStack from '../components/CardStack';
import DateSelector from '../components/DateSelector';
import BottomNavigation from '../components/BottomNavigation';
import LoadingSpinner from '../components/LoadingSpinner';
import { LogoutIcon } from '../components/icons';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard: React.FC = () => {
  const {
    userName,
    isAuthenticated,
    paymentMode,
    currentDate,
    currentIndex,
    isLoading,
    error,
    showPaidOnly,
    filteredAppointments,
    canGoBack,
    canGoForward,
    handlers
  } = useDashboard();

  const navigationDisabled = filteredAppointments.length === 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--exora-background)' }}>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Hola, {userName}
              </h1>
              <p className="text-sm text-gray-600">
                {filteredAppointments.length} citas {showPaidOnly ? 'pagadas' : 'pendientes'}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <DateSelector selectedDate={currentDate} onDateChange={handlers.changeDate} />

              <button
                onClick={handlers.logout}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                title="Cerrar sesión"
              >
                <LogoutIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
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
          <div className="flex-1 flex items-center justify-center px-4">
            <CardStack
              appointments={filteredAppointments}
              currentIndex={currentIndex}
              onNext={handlers.nextAppointment}
              onPrevious={handlers.previousAppointment}
              onRefresh={handlers.refreshAppointments}
              paymentMode={paymentMode}
              onCompletePayment={handlers.completePayment}
            />
          </div>
        )}
      </main>

      <BottomNavigation
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onPrevious={paymentMode ? undefined : handlers.previousAppointment}
        onNext={paymentMode ? undefined : handlers.nextAppointment}
        onAdd={handlers.initiatePaymentMode}
        disabled={navigationDisabled}
      />
    </div>
  );
};

export default Dashboard;
