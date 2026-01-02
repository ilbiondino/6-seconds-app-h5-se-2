
import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  duration: number;
  onEnd: () => void;
}

export const Timer: React.FC<TimerProps> = ({ duration, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number>();

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const progress = (time - startTimeRef.current) / 1000;
    const remaining = Math.max(0, duration - progress);
    
    setTimeLeft(remaining);

    if (remaining > 0) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      onEnd();
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const percentage = (timeLeft / duration) * 100;
  const colorClass = timeLeft < 2 ? 'text-red-500' : timeLeft < 3.5 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Circle Timer */}
      <div className="relative w-48 h-48 md:w-64 md:h-64">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            className="stroke-slate-700 fill-none"
            strokeWidth="12"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            className={`fill-none transition-colors duration-300 ${
              timeLeft < 2 ? 'stroke-red-500' : timeLeft < 3.5 ? 'stroke-yellow-400' : 'stroke-blue-500'
            }`}
            strokeWidth="12"
            strokeDasharray="283%"
            strokeDashoffset={`${283 - (283 * percentage) / 100}%`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 100ms linear' }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-7xl md:text-8xl font-game ${colorClass}`}>
          {Math.ceil(timeLeft)}
        </div>
      </div>
      
      {/* Sound Visualizer Mockup */}
      <div className="flex items-end justify-center space-x-1 h-8">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className={`w-2 bg-blue-400 rounded-full transition-all duration-75`}
            style={{ 
              height: `${Math.random() * (timeLeft > 0 ? 100 : 0)}%`,
              opacity: timeLeft > 0 ? 0.7 : 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
};
