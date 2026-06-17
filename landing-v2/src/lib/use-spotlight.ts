import * as React from 'react';
import { useMotionTemplate, useMotionValue } from 'framer-motion';

type SpotlightOptions = {
  radius?: number;
  color?: string;
};

export function useSpotlight({
  radius = 500,
  color = 'rgba(200,245,66,0.12)',
}: SpotlightOptions = {}) {
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = React.useCallback(() => {
    mouseX.set(-9999);
    mouseY.set(-9999);
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${color}, transparent 40%)`;

  return { handleMouseMove, handleMouseLeave, background };
}
