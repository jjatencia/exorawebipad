import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useAppointmentStore } from '../stores/appointmentStore';
import CardStack from '../components/CardStack';
import DateSelector from '../components/DateSelector';
import BottomNavigation from '../components/BottomNavigation';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const {
    appointments,
    currentDate,
    currentIndex,
    isLoading,
    error,
    fetchAppointments,
    setCurrentIndex,
    setCurrentDate
  } = useAppointmentStore();

  useEffect(() => {
    checkAuth();
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments(currentDate);
    }
  }, [currentDate, isAuthenticated, fetchAppointments]);

  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    console.log('handleNext called from swipe, currentIndex:', currentIndex, 'total:', appointments.length);
    if (currentIndex < appointments.length - 1) {
      setCurrentIndex(currentIndex + 1);
      console.log('Index updated to:', currentIndex + 1);
    } else {
      console.log('Cannot go next, already at last card');
    }
  };

  const handlePrevious = () => {
    console.log('handlePrevious called from swipe, currentIndex:', currentIndex);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      console.log('Index updated to:', currentIndex - 1);
    } else {
      console.log('Cannot go previous, already at first card');
    }
  };

  const handleAdd = () => {
    toast.success('Funcionalidad de agregar cita no implementada');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--exora-background)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Hola, {user.name}
              </h1>
              <p className="text-sm text-gray-600">
                {appointments.length} citas programadas
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <DateSelector
                selectedDate={currentDate}
                onDateChange={handleDateChange}
              />
              
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                title="Cerrar sesión"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
                onClick={() => fetchAppointments(currentDate)}
                className="mt-4 px-4 py-2 bg-exora-primary text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4 py-4">
            <CardStack
              appointments={appointments}
              currentIndex={currentIndex}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        canGoBack={currentIndex > 0}
        canGoForward={currentIndex < appointments.length - 1}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onAdd={handleAdd}
      />
    </div>
  );
};

export default Dashboard;