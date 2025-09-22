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
  const resetToCenter = () => api.start(RESET_POSITION);

  const isAtEdge = (isLeftSwipe: boolean) =>
    (isFirst && !isLeftSwipe) || (isLast && isLeftSwipe);

  const executeSwipeAnimation = (isLeftSwipe: boolean) => {
    api.start({
      x: isLeftSwipe ? -window.innerWidth : window.innerWidth,
      opacity: 0,
      scale: 0.9,
      rotate: isLeftSwipe ? -15 : 15,
      config: EXIT_CONFIG
    });

    setTimeout(() => {
      if (isLeftSwipe) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
      api.set(RESET_POSITION);
    }, ANIMATION_DELAY);
  };

  const handleVerticalSwipe = (my: number) => {
    if (Math.abs(my) > VERTICAL_SWIPE_THRESHOLD && my > 0 && onSwipeDown) {
      onSwipeDown();
    }
    resetToCenter();
  };

  const handleDragFeedback = (mx: number, my: number) => {
    const progress = Math.min(Math.abs(mx) / PROGRESS_DIVISOR, 1);
    const distance = Math.sqrt(mx * mx + my * my);
    const rotationX = my / 20; // Rotación en X para efecto 3D
    const rotationY = mx / 20; // Rotación en Y para efecto 3D

    api.start({
      x: mx * DRAG_RESISTANCE,
      y: my * VERTICAL_RESISTANCE,
      opacity: Math.max(0.85, 1 - progress * 0.1),
      scale: Math.max(0.95, 1 - (distance / 1000) * 0.05),
      rotate: mx / 10, // Rotación Z más pronunciada
      immediate: true
    });
  };

  const bind = useDrag(({ down, movement: [mx, my] }) => {
    if (disabled) return;

    if (!down) {
      const absX = Math.abs(mx);
      const absY = Math.abs(my);

      const isVerticalPreference = absY > absX && absY > VERTICAL_SWIPE_THRESHOLD;

      if (isVerticalPreference) {
        handleVerticalSwipe(my);
        return;
      }

      if (absX > SWIPE_THRESHOLD) {
        const isLeftSwipe = mx < 0;

        if (isAtEdge(isLeftSwipe)) {
          resetToCenter();
          return;
        }

        executeSwipeAnimation(isLeftSwipe);
        return;
      }

      handleVerticalSwipe(my);
    } else {
      handleDragFeedback(mx, my);
    }
  }, {
    // Configuración para movimiento inmediato y fluido
    threshold: 0, // Sin umbral - respuesta inmediata
    filterTaps: false, // No filtrar taps para respuesta más rápida
    preventScroll: false,
    pointer: { touch: true } // Optimizado para touch
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