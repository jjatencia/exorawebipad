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

export const useSwipeGestureSimple = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
  disabled = false,
  isFirst = false,
  isLast = false
}: UseSwipeGestureProps) => {

  const [{ x, y, opacity, scale, rotate }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    config: { tension: 300, friction: 30 }
  }));

  const bind = useDrag(
    ({ down, movement: [mx, my] }) => {

      if (disabled) return;

      if (!down) {
        // On release, check if we should swipe
        const shouldSwipe = Math.abs(mx) > 60;

        if (shouldSwipe) {
          const isLeftSwipe = mx < 0;

          // Check edge cases
          if ((isFirst && !isLeftSwipe) || (isLast && isLeftSwipe)) {
            api.start({ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 });
            return;
          }

          // Execute callback
          if (isLeftSwipe) {
            onSwipeLeft();
          } else {
            onSwipeRight();
          }

          // Quick exit animation
          api.start({
            x: isLeftSwipe ? -300 : 300,
            opacity: 0,
            config: { tension: 300, friction: 30 }
          });

          // Reset for next card
          setTimeout(() => {
            api.set({ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 });
          }, 100);
        } else if (Math.abs(my) > 60 && my > 0) {
          // Down swipe for refresh
          if (onSwipeDown) {
            onSwipeDown();
          }
          api.start({ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 });
        } else {
          // Return to center
          api.start({ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 });
        }
      } else {
        // Follow finger during drag
        api.start({
          x: mx,
          y: my * 0.5,
          opacity: Math.max(0.7, 1 - Math.abs(mx) / 300),
          scale: Math.max(0.95, 1 - Math.abs(mx) / 500),
          rotate: mx / 20,
          immediate: true
        });
      }
    }
  );

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