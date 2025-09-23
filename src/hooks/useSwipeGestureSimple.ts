import { useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

interface UseSwipeGestureProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeDown?: () => void;
  disabled?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

// Animation constants - Más sensible para movimiento libre
const SWIPE_THRESHOLD = 80;
const VERTICAL_SWIPE_THRESHOLD = 80;
const ANIMATION_DELAY = 150;
const DRAG_RESISTANCE = 1.0;
const VERTICAL_RESISTANCE = 1.0;
const PROGRESS_DIVISOR = 150;

// Animation configs - Más fluido y físico
const DEFAULT_CONFIG = { tension: 200, friction: 20 };
const EXIT_CONFIG = { tension: 150, friction: 20 };

// Reset position object
const RESET_POSITION = { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 };

export const useSwipeGestureSimple = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
  disabled = false,
  isFirst = false,
  isLast = false
}: UseSwipeGestureProps) => {

  const [{ x, y, opacity, scale, rotate }, api] = useSpring(() => ({
    ...RESET_POSITION,
    config: DEFAULT_CONFIG
  }));

  // Helper functions
  const resetToCenter = () => {
    try {
      api.start(RESET_POSITION);
    } catch (error) {
      console.warn('Reset animation error:', error);
    }
  };

  const isAtEdge = (isLeftSwipe: boolean) =>
    (isFirst && !isLeftSwipe) || (isLast && isLeftSwipe);

  const executeSwipeAnimation = (isLeftSwipe: boolean) => {
    try {
      api.start({
        x: isLeftSwipe ? -window.innerWidth : window.innerWidth,
        opacity: 0,
        scale: 0.9,
        rotate: isLeftSwipe ? -15 : 15,
        config: EXIT_CONFIG
      });

      setTimeout(() => {
        try {
          // Log para debugging móvil
          // Executing swipe

          // Ejecutar el cambio primero
          if (isLeftSwipe) {
            onSwipeLeft();
          } else {
            onSwipeRight();
          }

          // Swipe executed successfully, resetting position

          // Luego resetear después de un pequeño delay
          setTimeout(() => {
            api.set(RESET_POSITION);
            // Position reset complete
          }, 50);
        } catch (error) {
          console.error('Swipe execution error:', error);
          // Fallback: resetear inmediatamente
          api.set(RESET_POSITION);
        }
      }, ANIMATION_DELAY);
    } catch (error) {
      console.error('Swipe animation error:', error);
      // Fallback: ejecutar directamente sin animación
      if (isLeftSwipe) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
  };

  const handleDragFeedback = (mx: number, my: number) => {
    try {
      const progress = Math.min(Math.abs(mx) / PROGRESS_DIVISOR, 1);
      const distance = Math.sqrt(mx * mx + my * my);

      api.start({
        x: mx * DRAG_RESISTANCE,
        y: my * VERTICAL_RESISTANCE,
        opacity: Math.max(0.85, 1 - progress * 0.1),
        scale: Math.max(0.95, 1 - (distance / 1000) * 0.05),
        rotate: mx / 10,
        immediate: true
      });
    } catch (error) {
      console.warn('Drag feedback error:', error);
    }
  };

  const bind = useDrag(({ down, movement: [mx, my] }) => {
    if (disabled) return;

    try {
      if (!down) {
        const absX = Math.abs(mx);
        const absY = Math.abs(my);

        // Swipe vertical prioritario
        if (absY > absX && absY > VERTICAL_SWIPE_THRESHOLD && my > 0 && onSwipeDown) {
          onSwipeDown();
          resetToCenter();
          return;
        }

        // Swipe horizontal
        if (absX > SWIPE_THRESHOLD) {
          const isLeftSwipe = mx < 0;

          if (isAtEdge(isLeftSwipe)) {
            resetToCenter();
            return;
          }

          executeSwipeAnimation(isLeftSwipe);
          return;
        }

        // Cualquier otro caso: resetear
        resetToCenter();
      } else {
        handleDragFeedback(mx, my);
      }
    } catch (error) {
      console.error('Gesture handling error:', error);
      resetToCenter();
    }
  }, {
    threshold: 5, // Pequeño umbral para evitar gestos accidentales
    filterTaps: true, // Filtrar taps para mayor estabilidad
    preventScroll: false,
    pointer: { touch: true }
  });

  return {
    bind,
    style: {
      x,
      y,
      opacity,
      scale,
      transform: rotate.to(r => `rotate(${r}deg)`)
    }
  };
};