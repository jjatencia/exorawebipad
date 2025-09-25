import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getTypeColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '!',
          confirmButton: '#DC2626',
          confirmButtonHover: '#B91C1C'
        };
      case 'warning':
        return {
          icon: '!',
          confirmButton: '#D97706',
          confirmButtonHover: '#B45309'
        };
      case 'info':
        return {
          icon: 'i',
          confirmButton: '#2563EB',
          confirmButtonHover: '#1D4ED8'
        };
      default:
        return {
          icon: '!',
          confirmButton: '#D97706',
          confirmButtonHover: '#B45309'
        };
    }
  };

  const colors = getTypeColors();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
               style={{ backgroundColor: `${colors.confirmButton}20` }}>
            <div className="text-2xl font-bold"
                 style={{ color: colors.confirmButton }}>
              {colors.icon}
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl font-medium transition-all border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all hover:opacity-90 shadow-md"
            style={{
              backgroundColor: colors.confirmButton
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.confirmButtonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.confirmButton;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;