import React from 'react';
import { animated } from '@react-spring/web';
import { Appointment } from '../types';
import AppointmentCard from './AppointmentCard';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

interface CardStackProps {
  appointments: Appointment[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
}

const CardStack: React.FC<CardStackProps> = ({
  appointments,
  currentIndex,
  onNext,
  onPrevious
}) => {
  const currentAppointment = appointments[currentIndex];
  const nextAppointment = appointments[currentIndex + 1];
  const prevAppointment = appointments[currentIndex - 1];

  const swipeGesture = useSwipeGesture({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    disabled: appointments.length <= 1,
    isFirst: currentIndex === 0,
    isLast: currentIndex === appointments.length - 1
  });
  
  // Force re-render when currentIndex changes to avoid stuck gestures
  React.useEffect(() => {
    // Reset any stuck gesture states when index changes
    (window as any).currentCardIndex = currentIndex;
  }, [currentIndex]);


  if (!currentAppointment) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-xl">No hay citas para esta fecha</p>
        </div>
      </div>
    );
  }


  return (
    <div 
      className="relative w-full flex items-center justify-center"
      style={{ 
        height: 'calc(100vh - 200px)', // Restar espacio del header y footer
        maxHeight: '600px'
      }}
    >
      {/* Background cards for 3D stack effect */}
      {prevAppointment && (
        <div
          key={`prev-${prevAppointment._id}`}
          className="absolute w-full h-full flex justify-center items-center transition-all duration-400 ease-in-out"
          style={{
            transform: 'translateY(16px) scale(0.94)',
            opacity: 0.6,
            zIndex: 1
          }}
        >
          <AppointmentCard
            appointment={prevAppointment}
            isActive={false}
          />
        </div>
      )}

      {nextAppointment && (
        <div
          key={`next-${nextAppointment._id}`}
          className="absolute w-full h-full flex justify-center items-center transition-all duration-400 ease-in-out"
          style={{
            transform: 'translateY(8px) scale(0.97)',
            opacity: 0.8,
            zIndex: 2
          }}
        >
          <AppointmentCard
            appointment={nextAppointment}
            isActive={false}
          />
        </div>
      )}

      {/* Current appointment card with swipe */}
      <animated.div
        key={`swipe-${currentAppointment._id}`}
        {...swipeGesture.bind()}
        className="absolute w-full h-full flex justify-center items-center"
        style={{ 
          ...swipeGesture.style,
          touchAction: 'pan-y',
          zIndex: 3
        }}
      >
        <AppointmentCard
          appointment={currentAppointment}
          isActive={true}
        />
      </animated.div>

      {/* Visual indicators - outside absolute positioning */}
      {appointments.length > 1 && (
        <div 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2"
          style={{ zIndex: 4, marginBottom: '8px' }}
        >
          {appointments.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex 
                  ? 'bg-exora-primary' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardStack;