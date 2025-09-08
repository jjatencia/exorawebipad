import { useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

interface UseSwipeGestureProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  disabled?: boolean;
}

export const useSwipeGesture = ({ onSwipeLeft, onSwipeRight, disabled = false }: UseSwipeGestureProps) => {
  const [{ x, opacity, scale, rotate }, api] = useSpring(() => ({
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    config: { tension: 280, friction: 28, precision: 0.01 }
  }));

  const bind = useDrag(
    ({ down, movement: [mx, my], direction: [xDir], velocity: [vx], cancel, canceled }) => {
      if (disabled) return;
      
      // Cancel drag if vertical movement is too much
      if (Math.abs(mx) < Math.abs(my) && !down) {
        cancel();
        return;
      }

      const trigger = vx > 0.3 || Math.abs(mx) > 120;
      const shouldSwipe = !down && trigger;

      if (shouldSwipe && !canceled) {
        const side = xDir < 0 ? 'left' : 'right';
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }

        // Animate card flying off screen like a playing card
        api.start({
          x: side === 'left' ? -window.innerWidth * 1.2 : window.innerWidth * 1.2,
          opacity: 0,
          scale: 0.8,
          rotate: side === 'left' ? -20 : 20,
          config: { tension: 200, friction: 20 }
        });

        // Change the card after animation starts
        setTimeout(() => {
          if (side === 'left') {
            onSwipeLeft();
          } else {
            onSwipeRight();
          }
          
          // Reset position for new card
          api.set({ x: 0, opacity: 1, scale: 1, rotate: 0 });
        }, 300);
      } else {
        // Smooth feedback during drag - like rubber band
        api.start({
          x: down ? mx : 0,
          opacity: down ? Math.max(0.7, 1 - Math.abs(mx) / 300) : 1,
          scale: down ? Math.max(0.95, 1 - Math.abs(mx) / 800) : 1,
          rotate: down ? mx / 15 : 0, // Slight rotation like bending a card
          immediate: down,
          config: { tension: 250, friction: 25 }
        });
      }
    },
    {
      axis: 'x',
      rubberband: true,
      bounds: { left: -window.innerWidth / 2, right: window.innerWidth / 2 }
    }
  );

  return {
    bind,
    style: { 
      x, 
      opacity, 
      scale,
      transform: rotate.to(r => `rotate(${r}deg)`)
    }
  };
};