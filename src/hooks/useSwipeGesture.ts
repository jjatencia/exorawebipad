import React from 'react';
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

export const useSwipeGesture = ({ onSwipeLeft, onSwipeRight, onSwipeDown, disabled = false, isFirst = false, isLast = false }: UseSwipeGestureProps) => {
  
  const [{ x, y, opacity, scale, rotate }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    config: { tension: 280, friction: 28, precision: 0.01 }
  }));

  const swipeDirection = React.useRef<'left' | 'right' | 'down' | null>(null);


  const bind = useDrag(
    ({ down, movement: [mx, my], velocity: [vx], cancel, canceled }) => {
      
      if (disabled) {
        return;
      }
      
      // Capture swipe direction during movement
      if (down && (Math.abs(mx) > 10 || Math.abs(my) > 10)) {
        if (Math.abs(my) > Math.abs(mx) && my > 0) {
          swipeDirection.current = 'down';
        } else if (Math.abs(mx) > Math.abs(my)) {
          swipeDirection.current = mx < 0 ? 'left' : 'right';
        }
      }
      
      // Cancel drag if vertical movement is too much (but allow pull-to-refresh)
      if (Math.abs(mx) < Math.abs(my) && !down && swipeDirection.current !== 'down') {
        cancel();
        return;
      }

      // Much lower thresholds for more sensitive swipe detection
      const trigger = Math.abs(vx) > 0.005 || Math.abs(mx) > 60 || (swipeDirection.current === 'down' && my > 100);
      const shouldSwipe = !down && trigger;

      if (shouldSwipe && !canceled) {
        // Use captured direction instead of mx at release (which can be 0)
        const side = swipeDirection.current || (mx < 0 ? 'left' : 'right');
        
        // Don't allow swipe animation at edges
        if ((isFirst && side === 'right') || (isLast && side === 'left')) {
          // Just return to center without animation
          api.start({
            x: 0,
            opacity: 1,
            scale: 1,
            rotate: 0,
            config: { tension: 250, friction: 25 }
          });
          swipeDirection.current = null;
          return;
        }
        

        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }

        if (side === 'down') {
          // Pull-to-refresh animation
          api.start({
            y: window.innerHeight * 0.3,
            opacity: 0.8,
            scale: 0.9,
            config: { tension: 200, friction: 20 }
          });

          // Execute refresh callback
          setTimeout(() => {
            if (onSwipeDown) {
              onSwipeDown();
            }

            // Reset position
            api.set({ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 });
            swipeDirection.current = null;
          }, 200);
        } else {
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
            // Left swipe (negative movement) = go forward (next)
            // Right swipe (positive movement) = go backward (previous)
            if (side === 'left') {
              onSwipeLeft(); // This calls onNext in CardStack
            } else {
              onSwipeRight(); // This calls onPrevious in CardStack
            }

            // Reset position for new card
            api.set({ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 });
            swipeDirection.current = null; // Reset direction
          }, 200);
        }
      } else {
        // Limit movement when at edges
        let limitedMx = mx;
        if (isFirst && mx > 0) {
          // Limit right movement on first card
          limitedMx = Math.min(mx, 50) * 0.3; // 30% of movement, max 15px
        } else if (isLast && mx < 0) {
          // Limit left movement on last card  
          limitedMx = Math.max(mx, -50) * 0.3; // 30% of movement, max -15px
        }
        
        // Smooth feedback during drag - like rubber band
        const limitedMy = swipeDirection.current === 'down' ? Math.min(my, 150) * 0.7 : 0;

        api.start({
          x: down ? limitedMx : 0,
          y: down ? limitedMy : 0,
          opacity: down ? Math.max(0.7, 1 - Math.abs(limitedMx) / 300 - Math.abs(limitedMy) / 400) : 1,
          scale: down ? Math.max(0.95, 1 - Math.abs(limitedMx) / 800 - Math.abs(limitedMy) / 1000) : 1,
          rotate: down ? limitedMx / 15 : 0, // Slight rotation like bending a card
          immediate: down,
          config: { tension: 250, friction: 25 }
        });
      }
    },
    {
      rubberband: true,
      bounds: {
        left: -window.innerWidth / 2,
        right: window.innerWidth / 2,
        top: -100,
        bottom: window.innerHeight / 3
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