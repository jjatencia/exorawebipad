import React from 'react';
import { ViewMode } from '../types';
import { CardsIcon, DayIcon, WeekIcon } from './icons';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  currentMode,
  onModeChange
}) => {
  const viewModes = [
    {
      mode: ViewMode.CARDS,
      icon: CardsIcon,
      label: 'Cards',
      title: 'Vista de tarjetas'
    },
    {
      mode: ViewMode.DAY,
      icon: DayIcon,
      label: 'Día',
      title: 'Vista de día'
    },
    {
      mode: ViewMode.WEEK,
      icon: WeekIcon,
      label: 'Semana',
      title: 'Vista de semana'
    }
  ];

  return (
    <div className="flex items-center space-x-0.5 bg-gray-100 rounded-lg p-1">
      {viewModes.map(({ mode, icon: Icon, label, title }) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          title={title}
          className={`
            flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200
            ${currentMode === mode
              ? 'bg-white text-exora-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          <Icon size={14} />
          <span className="hidden sm:inline text-xs">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default ViewModeSelector;