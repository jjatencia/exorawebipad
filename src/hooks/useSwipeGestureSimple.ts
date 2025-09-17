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

          // Smooth exit animation first
          api.start({
            x: isLeftSwipe ? -window.innerWidth : window.innerWidth,
            opacity: 0,
            scale: 0.9,
            rotate: isLeftSwipe ? -15 : 15,
            config: { tension: 180, friction: 26 }
          });

          // Execute callback after animation starts for smooth transition
          setTimeout(() => {
            if (isLeftSwipe) {
              onSwipeLeft();
            } else {
              onSwipeRight();
            }

            // Reset for next card
            api.set({ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 });
          }, 150);
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
        // Follow finger during drag with smooth feedback
        const progress = Math.min(Math.abs(mx) / 150, 1);
        api.start({
          x: mx * 0.8, // Slight resistance
          y: my * 0.3,
          opacity: Math.max(0.85, 1 - progress * 0.15),
          scale: Math.max(0.97, 1 - progress * 0.03),
          rotate: mx / 15, // More subtle rotation
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