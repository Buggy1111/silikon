// Universal Charts Component - Reusable chart components for any project
// Extracted from ExpenseChart.jsx for standalone use

import React, { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { PieChart, BarChart3, Activity } from 'lucide-react';

// TypeScript interfaces
interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  icon: string;
  percentage?: number;
}

interface ChartDimensions {
  width: number;
  height: number;
}

interface ChartTypeSelectorProps {
  activeType: string;
  onChange: (type: string) => void;
  labels?: Record<string, string>;
}

interface ChartVisualizationProps {
  data: ChartDataItem[];
  dimensions: ChartDimensions;
  formatter?: (value: number) => string;
}

interface UniversalChartsProps {
  data: ChartDataItem[];
  chartType?: string;
  onChartTypeChange?: (type: string) => void;
  showSelector?: boolean;
  formatter?: (value: number) => string;
  title?: string;
  subtitle?: string;
  className?: string;
  selectorLabels?: Record<string, string>;
  height?: number;
}

// Chart types enum
const CHART_TYPES = {
  PIE: 'pie',
  BAR: 'bar',
  RADAR: 'radar'
};

// Animation constants
const ANIMATION = {
  DURATION: 1000,
  STAGGER: 50,
  HOVER_SCALE: 1.05,
  CLICK_SCALE: 0.95
};

// Default formatter function
const defaultFormatter = (value: number) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Custom hooks
const useAnimatedValue = (value: number, duration: number = ANIMATION.DURATION) => {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    let start: number;
    const startValue = current;
    
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      
      // Smooth easing
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(startValue + (value - startValue) * eased);
      
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);
  
  return current;
};

const useChartDimensions = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [dimensions, setDimensions] = useState<ChartDimensions>({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);
  
  return dimensions;
};

// Chart Type Selector Component
const ChartTypeSelector = memo<ChartTypeSelectorProps>(({ activeType, onChange, labels = {} }) => {
  const defaultLabels = {
    pie: 'Pie',
    bar: 'Bar',
    radar: 'Radar'
  };
  
  const chartLabels = { ...defaultLabels, ...labels };
  
  const types = [
    { id: CHART_TYPES.PIE, icon: PieChart, label: chartLabels.pie },
    { id: CHART_TYPES.BAR, icon: BarChart3, label: chartLabels.bar },
    { id: CHART_TYPES.RADAR, icon: Activity, label: chartLabels.radar }
  ];
  
  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
      {types.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-300 transform
            ${activeType === id 
              ? 'bg-white text-indigo-600 shadow-md scale-105' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
});

ChartTypeSelector.displayName = 'ChartTypeSelector';

// Pie Chart Component
const PieChartVisualization = memo<ChartVisualizationProps>(({ data, dimensions, formatter = defaultFormatter }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius = Math.min(centerX, centerY) - 40;
  
  // Calculate angles
  const angles = useMemo(() => {
    let currentAngle = -Math.PI / 2; // Start from top
    return data.map((item, index) => {
      const startAngle = currentAngle;
      const sweepAngle = (item.percentage / 100) * Math.PI * 2;
      currentAngle += sweepAngle;
      return {
        startAngle,
        endAngle: currentAngle,
        midAngle: startAngle + sweepAngle / 2
      };
    });
  }, [data]);
  
  // Create path for slice
  const createPath = useCallback((startAngle, endAngle, scale = 1) => {
    const innerRadius = radius * 0.6;
    const outerRadius = radius * scale;
    
    const x1 = centerX + Math.cos(startAngle) * innerRadius;
    const y1 = centerY + Math.sin(startAngle) * innerRadius;
    const x2 = centerX + Math.cos(startAngle) * outerRadius;
    const y2 = centerY + Math.sin(startAngle) * outerRadius;
    const x3 = centerX + Math.cos(endAngle) * outerRadius;
    const y3 = centerY + Math.sin(endAngle) * outerRadius;
    const x4 = centerX + Math.cos(endAngle) * innerRadius;
    const y4 = centerY + Math.sin(endAngle) * innerRadius;
    
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    
    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}
    `;
  }, [centerX, centerY, radius]);
  
  return (
    <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
      {/* Gradients */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        {data.map((item, index) => (
          <radialGradient key={`gradient-${index}`} id={`gradient-${index}`}>
            <stop offset="0%" stopColor={item.color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={item.color} stopOpacity="1" />
          </radialGradient>
        ))}
      </defs>
      
      {/* Background circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius * 0.58}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.1"
        className="text-gray-400"
      />
      
      {/* Slices */}
      {data.map((item, index) => {
        const { startAngle, endAngle, midAngle } = angles[index];
        const isHovered = hoveredIndex === index;
        const isSelected = selectedIndex === index;
        const scale = isSelected ? 1.1 : isHovered ? 1.05 : 1;
        
        // Label position
        const labelRadius = radius * 1.3;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;
        
        return (
          <g key={item.name}>
            {/* Slice */}
            <path
              d={createPath(startAngle, endAngle, scale)}
              fill={`url(#gradient-${index})`}
              stroke="white"
              strokeWidth="2"
              filter={isHovered ? "url(#glow)" : ""}
              className="cursor-pointer transition-all duration-300"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: `${centerX}px ${centerY}px`,
                opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.6 : 1
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setSelectedIndex(isSelected ? null : index)}
            />
            
            {/* Percentage in slice */}
            {item.percentage > 5 && (
              <text
                x={centerX + Math.cos(midAngle) * radius * 0.8}
                y={centerY + Math.sin(midAngle) * radius * 0.8}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white font-bold text-sm pointer-events-none"
                style={{
                  opacity: isHovered || isSelected ? 1 : 0.8,
                  fontSize: isHovered || isSelected ? '16px' : '14px',
                  transition: 'all 0.3s'
                }}
              >
                {Math.round(item.percentage)}%
              </text>
            )}
            
            {/* Hover tooltip - only show when hovered */}
            {isHovered && (
              <g className="pointer-events-none">
                <rect
                  x={centerX - 60}
                  y={centerY - 80}
                  width="120"
                  height="60"
                  rx="8"
                  fill="white"
                  fillOpacity="0.95"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  filter="url(#glow)"
                />
                <text
                  x={centerX}
                  y={centerY - 55}
                  textAnchor="middle"
                  className="fill-gray-700 text-xs font-medium"
                >
                  {item.icon} {item.name}
                </text>
                <text
                  x={centerX}
                  y={centerY - 40}
                  textAnchor="middle"
                  className="fill-gray-900 text-sm font-bold"
                >
                  {formatter(item.value)}
                </text>
                <text
                  x={centerX}
                  y={centerY - 25}
                  textAnchor="middle"
                  className="fill-blue-600 text-xs font-semibold"
                >
                  {Math.round(item.percentage)}%
                </text>
              </g>
            )}
          </g>
        );
      })}
      
      {/* Center info */}
      <g className="pointer-events-none">
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          className="fill-gray-600 text-sm"
        >
          Total
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="fill-gray-900 text-2xl font-bold"
        >
          {formatter(data.reduce((sum, item) => sum + item.value, 0))}
        </text>
      </g>
      
      <style>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </svg>
  );
});

PieChartVisualization.displayName = 'PieChartVisualization';

// Bar Chart Component
const BarChartVisualization = memo<ChartVisualizationProps>(({ data, dimensions, formatter = defaultFormatter }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const margin = { top: 20, right: 20, bottom: 80, left: 60 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;
  
  return (
    <svg width={dimensions.width} height={dimensions.height}>
      <defs>
        {data.map((item, index) => (
          <linearGradient
            key={`bar-gradient-${index}`}
            id={`bar-gradient-${index}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={item.color} stopOpacity="1" />
            <stop offset="100%" stopColor={item.color} stopOpacity="0.7" />
          </linearGradient>
        ))}
      </defs>
      
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line
              x1={0}
              y1={chartHeight * (1 - tick)}
              x2={chartWidth}
              y2={chartHeight * (1 - tick)}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.1"
              className="text-gray-400"
              strokeDasharray={tick === 0 ? "0" : "2 2"}
            />
            <text
              x={-15}
              y={chartHeight * (1 - tick) + 5}
              textAnchor="end"
              className="fill-gray-800 text-sm font-semibold"
            >
              {formatter(maxValue * tick)}
            </text>
          </g>
        ))}
        
        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = index * (barWidth + barSpacing) + barSpacing / 2;
          const y = chartHeight - barHeight;
          const isHovered = hoveredIndex === index;
          
          return (
            <g
              key={item.name}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Shadow */}
              <rect
                x={x + 2}
                y={y + 2}
                width={barWidth}
                height={barHeight}
                fill="black"
                opacity="0.1"
                rx="4"
                className="transition-all duration-300"
                style={{
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  transformOrigin: 'bottom'
                }}
              />
              
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={`url(#bar-gradient-${index})`}
                rx="4"
                className="transition-all duration-500"
                style={{
                  transform: isHovered ? 'scaleY(1.05) translateY(-4px)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                  opacity: 0,
                  animation: `slideUp 0.6s ${index * ANIMATION.STAGGER}ms forwards`
                }}
              />
              
              {/* Hover tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 50}
                    y={y - 60}
                    width="100"
                    height="45"
                    fill="white"
                    fillOpacity="0.95"
                    rx="8"
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 42}
                    textAnchor="middle"
                    className="fill-gray-700 text-xs font-medium"
                  >
                    {item.icon} {item.name}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={y - 28}
                    textAnchor="middle"
                    className="fill-gray-900 text-sm font-bold"
                  >
                    {formatter(item.value)}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={y - 15}
                    textAnchor="middle"
                    className="fill-blue-600 text-xs font-semibold"
                  >
                    {Math.round(item.percentage)}%
                  </text>
                </g>
              )}
              
              {/* Category label */}
              <g transform={`translate(${x + barWidth / 2}, ${chartHeight + 20})`}>
                <text
                  textAnchor="middle"
                  className="fill-gray-700 text-sm"
                >
                  {item.icon}
                </text>
                <text
                  y="18"
                  textAnchor="middle"
                  className="fill-gray-800 text-sm font-bold"
                >
                  {item.name.length > 10 ? item.name.substring(0, 8) + '..' : item.name}
                </text>
              </g>
            </g>
          );
        })}
      </g>
      
      <style>{`
        @keyframes slideUp {
          to {
            opacity: 1;
            transform: scaleY(1);
          }
        }
      `}</style>
    </svg>
  );
});

BarChartVisualization.displayName = 'BarChartVisualization';

// Radar Chart Component
const RadarChartVisualization = memo<ChartVisualizationProps>(({ data, dimensions, formatter = defaultFormatter }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius = Math.min(centerX, centerY) - 60;
  const angleStep = (Math.PI * 2) / data.length;
  
  const maxValue = Math.max(...data.map(d => d.value));
  
  // Calculate points
  const points = useMemo(() => {
    return data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const r = (item.value / maxValue) * radius;
      return {
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
        labelX: centerX + Math.cos(angle) * (radius + 30),
        labelY: centerY + Math.sin(angle) * (radius + 30)
      };
    });
  }, [data, centerX, centerY, radius, angleStep, maxValue]);
  
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  
  return (
    <svg width={dimensions.width} height={dimensions.height}>
      <defs>
        <radialGradient id="radar-gradient">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#EC4899" stopOpacity="0.2" />
        </radialGradient>
        <filter id="radar-glow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background circles */}
      {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
        <circle
          key={scale}
          cx={centerX}
          cy={centerY}
          r={radius * scale}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.1"
          className="text-gray-400"
          strokeDasharray={scale < 1 ? "2 2" : "0"}
        />
      ))}
      
      {/* Axes */}
      {data.map((_, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;
        
        return (
          <line
            key={index}
            x1={centerX}
            y1={centerY}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.1"
            className="text-gray-400"
          />
        );
      })}
      
      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="url(#radar-gradient)"
        stroke="#8B5CF6"
        strokeWidth="2"
        filter="url(#radar-glow)"
        className="transition-all duration-500"
        style={{
          opacity: 0,
          animation: 'scaleIn 1s forwards'
        }}
      />
      
      {/* Data points */}
      {points.map((point, index) => {
        const isHovered = hoveredIndex === index;
        const item = data[index];
        
        return (
          <g key={index}>
            {/* Point */}
            <circle
              cx={point.x}
              cy={point.y}
              r={isHovered ? "8" : "6"}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-300"
              filter={isHovered ? "url(#radar-glow)" : ""}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                opacity: 0,
                animation: `fadeIn 0.5s ${index * ANIMATION.STAGGER + 500}ms forwards`
              }}
            />
            
            {/* Hover tooltip */}
            {isHovered && (
              <g>
                <rect
                  x={point.x - 70}
                  y={point.y - 50}
                  width="140"
                  height="50"
                  fill="white"
                  fillOpacity="0.95"
                  rx="8"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  filter="url(#radar-glow)"
                />
                <text
                  x={point.x}
                  y={point.y - 32}
                  textAnchor="middle"
                  className="fill-gray-700 text-xs font-medium"
                >
                  {item.icon} {item.name}
                </text>
                <text
                  x={point.x}
                  y={point.y - 18}
                  textAnchor="middle"
                  className="fill-gray-900 text-sm font-bold"
                >
                  {formatter(item.value)}
                </text>
                <text
                  x={point.x}
                  y={point.y - 5}
                  textAnchor="middle"
                  className="fill-blue-600 text-xs font-semibold"
                >
                  {Math.round(item.percentage)}%
                </text>
              </g>
            )}
            
            {/* Static Labels - always visible */}
            <g
              style={{
                opacity: 0,
                animation: `fadeIn 0.5s ${index * ANIMATION.STAGGER + 700}ms forwards`
              }}
            >
              <text
                x={point.labelX}
                y={point.labelY - 4}
                textAnchor="middle"
                className="fill-gray-700 text-lg"
              >
                {item.icon}
              </text>
              <text
                x={point.labelX}
                y={point.labelY + 12}
                textAnchor="middle"
                className="fill-gray-700 text-xs font-medium"
              >
                {item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name}
              </text>
            </g>
          </g>
        );
      })}
      
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
            transform-origin: center;
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </svg>
  );
});

RadarChartVisualization.displayName = 'RadarChartVisualization';

// Main Universal Charts Component
const UniversalCharts = memo<UniversalChartsProps>(({ 
  data = [], 
  chartType = CHART_TYPES.PIE,
  onChartTypeChange = () => {},
  showSelector = true,
  formatter = defaultFormatter,
  title = "Chart",
  subtitle = "",
  className = "",
  selectorLabels = {},
  height = 400
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const containerRef = useRef(null);
  const dimensions = useChartDimensions(containerRef);
  
  // Calculate total for percentages
  const total = useMemo(() => 
    data.reduce((sum, item) => sum + item.value, 0), [data]
  );
  
  // Process data with percentages
  const chartData = useMemo(() => 
    data.map(item => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    })), [data, total]
  );
  
  // Restart animation on chart type change
  useEffect(() => {
    setIsAnimating(false);
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
  }, [chartType]);
  
  // Empty state
  if (chartData.length === 0) {
    return (
      <div className={`relative bg-white rounded-3xl p-8 shadow-xl ${className}`}>
        <div className="text-center py-12">
          <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
            <PieChart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            No data to display
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative bg-white rounded-3xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      {(title || showSelector) && (
        <div className="relative p-6 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {title && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm text-gray-500 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            
            {showSelector && (
              <ChartTypeSelector 
                activeType={chartType} 
                onChange={onChartTypeChange}
                labels={selectorLabels}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Chart container */}
      <div 
        ref={containerRef}
        className="relative p-6"
        style={{ height: `${height}px` }}
      >
        {dimensions.width > 0 && isAnimating && (
          <>
            {chartType === CHART_TYPES.PIE && (
              <PieChartVisualization 
                data={chartData} 
                dimensions={dimensions} 
                formatter={formatter}
              />
            )}
            {chartType === CHART_TYPES.BAR && (
              <BarChartVisualization 
                data={chartData} 
                dimensions={dimensions} 
                formatter={formatter}
              />
            )}
            {chartType === CHART_TYPES.RADAR && (
              <RadarChartVisualization 
                data={chartData} 
                dimensions={dimensions} 
                formatter={formatter}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
});

UniversalCharts.displayName = 'UniversalCharts';

// Export components and types
export {
  UniversalCharts,
  ChartTypeSelector,
  PieChartVisualization,
  BarChartVisualization,
  RadarChartVisualization,
  CHART_TYPES
};

export default UniversalCharts;