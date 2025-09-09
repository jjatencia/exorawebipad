import React from 'react';
import { useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

interface UseSwipeGestureProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  disabled?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export const useSwipeGesture = ({ onSwipeLeft, onSwipeRight, disabled = false, isFirst = false, isLast = false }: UseSwipeGestureProps) => {
  
  const [{ x, opacity, scale, rotate }, api] = useSpring(() => ({
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    config: { tension: 280, friction: 28, precision: 0.01 }
  }));

  const swipeDirection = React.useRef<'left' | 'right' | null>(null);

  console.log('useSwipeGesture created, disabled:', disabled);

  const bind = useDrag(
    ({ down, movement: [mx, my], direction: [xDir], velocity: [vx], cancel, canceled }) => {
      console.log('Drag event:', { disabled, down, mx, my, vx, canceled, trigger: vx > 0.3 || Math.abs(mx) > 120 });
      
      if (disabled) {
        console.log('Swipe disabled, returning');
        return;
      }
      
      // Capture swipe direction during movement (when mx is meaningful)
      if (down && Math.abs(mx) > 10) {
        swipeDirection.current = mx < 0 ? 'left' : 'right';
      }
      
      // Cancel drag if vertical movement is too much
      if (Math.abs(mx) < Math.abs(my) && !down) {
        console.log('Vertical movement detected, canceling');
        cancel();
        return;
      }

      // Much lower thresholds for more sensitive swipe detection
      const trigger = Math.abs(vx) > 0.005 || Math.abs(mx) > 60;
      const shouldSwipe = !down && trigger;
      console.log('Should swipe:', shouldSwipe, { trigger, down, canceled });

      if (shouldSwipe && !canceled) {
        // Use captured direction instead of mx at release (which can be 0)
        const side = swipeDirection.current || (mx < 0 ? 'left' : 'right');
        
        // Don't allow swipe animation at edges
        if ((isFirst && side === 'right') || (isLast && side === 'left')) {
          console.log('SWIPE BLOCKED at edge:', { side, isFirst, isLast });
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
        
        console.log('SWIPE TRIGGERED:', { side, xDir, mx, vx, currentIndex: (window as any).currentCardIndex });
        
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
          console.log('Executing callback:', side);
          // Left swipe (negative movement) = go forward (next)
          // Right swipe (positive movement) = go backward (previous) 
          if (side === 'left') {
            onSwipeLeft(); // This calls onNext in CardStack
          } else {
            onSwipeRight(); // This calls onPrevious in CardStack
          }
          
          // Reset position for new card
          api.set({ x: 0, opacity: 1, scale: 1, rotate: 0 });
          swipeDirection.current = null; // Reset direction
        }, 200);
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
        api.start({
          x: down ? limitedMx : 0,
          opacity: down ? Math.max(0.7, 1 - Math.abs(limitedMx) / 300) : 1,
          scale: down ? Math.max(0.95, 1 - Math.abs(limitedMx) / 800) : 1,
          rotate: down ? limitedMx / 15 : 0, // Slight rotation like bending a card
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