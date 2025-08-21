import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (value - startValue) * easeOut;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [value, duration, displayValue]);

  return (
    <span className="font-mono">
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

interface PulsingDotProps {
  color: 'green' | 'red' | 'yellow' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

export const PulsingDot: React.FC<PulsingDotProps> = ({ color, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500'
  };

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}></div>
      <div className={`absolute top-0 left-0 ${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-ping opacity-75`}></div>
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'bg-blue-500',
  height = 'h-2',
  animated = true
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
      <div
        className={`${height} ${color} ${animated ? 'transition-all duration-1000 ease-out' : ''} rounded-full`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );
};

interface StatusBadgeProps {
  status: 'active' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const statusClasses = {
    active: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    success: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[status]}`}>
      <PulsingDot color={status === 'active' ? 'blue' : status === 'warning' ? 'yellow' : status === 'error' ? 'red' : 'green'} size="sm" />
      <span className="ml-1">{children}</span>
    </span>
  );
};