import React from 'react';

interface BottomNavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onAdd: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
  onAdd
}) => {
  const ChevronLeftIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15,18 9,12 15,6"></polyline>
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
  );

  const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  return (
    <div 
      className="safe-area-bottom bg-white border-t border-gray-200"
      style={{ backgroundColor: 'var(--exora-primary)' }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          disabled={!canGoBack}
          className={`
            flex items-center justify-center w-12 h-12 rounded-full
            transition-all duration-200
            ${canGoBack 
              ? 'bg-white/20 text-white hover:bg-white/30 active:bg-white/40' 
              : 'bg-white/10 text-white/40 cursor-not-allowed'
            }
          `}
        >
          <ChevronLeftIcon />
        </button>

        {/* Add Button (FAB) */}
        <button
          onClick={onAdd}
          className="
            flex items-center justify-center w-14 h-14 rounded-full
            shadow-lg transition-all duration-200
            hover:scale-105 active:scale-95
          "
          style={{ backgroundColor: 'var(--exora-light-yellow)' }}
        >
          <PlusIcon />
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={!canGoForward}
          className={`
            flex items-center justify-center w-12 h-12 rounded-full
            transition-all duration-200
            ${canGoForward 
              ? 'bg-white/20 text-white hover:bg-white/30 active:bg-white/40' 
              : 'bg-white/10 text-white/40 cursor-not-allowed'
            }
          `}
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;