import React, { useEffect, useState } from 'react';
import { formatINR } from '../../utils/formatters';

interface AnimatedCounterProps {
  target: number;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  duration?: number; // duration in ms
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  isCurrency = false,
  prefix = '',
  suffix = '',
  duration = 1000,
  className = ''
}) => {
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease-out quad formula
      const easeOutProgress = 1 - (1 - progress) * (1 - progress);
      const val = Math.round(startValue + (target - startValue) * easeOutProgress);
      
      setCurrent(val);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    const animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  const displayValue = isCurrency ? formatINR(current) : current.toLocaleString();

  return (
    <span className={`transition-opacity duration-300 ${className}`}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};
