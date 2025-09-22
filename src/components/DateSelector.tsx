import React, { useMemo, useState } from 'react';
import { formatDate, formatDateForAPILocal } from '../utils/helpers';
import { ChevronDownIcon } from './icons';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentDate = useMemo(() => new Date(selectedDate + 'T00:00:00'), [selectedDate]);
  const displayDate = useMemo(() => formatDate(currentDate), [currentDate]);

  const handleDateSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    onDateChange(newDate);
    setIsOpen(false);
  };

  const quickDates = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    return [
      { label: 'Ayer', date: formatDateForAPILocal(yesterday) },
      { label: 'Hoy', date: formatDateForAPILocal(today) },
      { label: 'Mañana', date: formatDateForAPILocal(tomorrow) },
      { label: 'Pasado mañana', date: formatDateForAPILocal(dayAfterTomorrow) }
    ];
  }, []);

  return (
    <div className="relative z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{displayDate}</span>
        <ChevronDownIcon
          size={20}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]">
            <div className="p-4">
              {/* Quick date selection */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Acceso rápido</h3>
                <div className="space-y-1">
                  {quickDates.map((quickDate) => (
                    <button
                      key={quickDate.date}
                      onClick={() => {
                        onDateChange(quickDate.date);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        quickDate.date === selectedDate
                          ? 'bg-exora-primary text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {quickDate.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar input */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Seleccionar fecha</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-exora-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateSelector;
