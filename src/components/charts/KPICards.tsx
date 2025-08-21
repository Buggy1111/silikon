import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  Package, 
  Activity,
  BarChart3,
  DollarSign
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ElementType;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  gradient?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    gradient: 'bg-gradient-to-br from-green-500 to-green-600',
    border: 'border-green-200'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    gradient: 'bg-gradient-to-br from-red-500 to-red-600',
    border: 'border-red-200'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    gradient: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    border: 'border-yellow-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
    border: 'border-purple-200'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    border: 'border-indigo-200'
  }
};

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  gradient = false 
}) => {
  const colors = colorClasses[color];
  
  return (
    <div className={`relative overflow-hidden rounded-xl border-2 ${colors.border} bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
      {gradient && (
        <div className={`absolute inset-0 ${colors.gradient} opacity-5`}></div>
      )}
      
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            
            {change && (
              <div className="flex items-center text-sm">
                {change.type === 'increase' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`font-medium ${
                  change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change.value > 0 ? '+' : ''}{change.value}%
                </span>
                <span className="text-gray-500 ml-1">{change.period}</span>
              </div>
            )}
          </div>
          
          <div className={`p-4 rounded-xl ${colors.bg}`}>
            <Icon className={`w-8 h-8 ${colors.icon}`} />
          </div>
        </div>
      </div>
      
      {/* Animated border */}
      <div className={`absolute bottom-0 left-0 h-1 ${colors.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
    </div>
  );
};

interface ProgressKPICardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
}

export const ProgressKPICard: React.FC<ProgressKPICardProps> = ({
  title,
  current,
  target,
  unit,
  icon: Icon,
  color
}) => {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const colors = colorClasses[color];
  
  return (
    <div className={`relative overflow-hidden rounded-xl border-2 ${colors.border} bg-white shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {current.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">/ {target.toLocaleString()} {unit}</span>
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colors.gradient} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">0</span>
            <span className={`text-sm font-semibold ${
              percentage >= 100 ? 'text-green-600' : 
              percentage >= 80 ? colors.icon : 'text-gray-600'
            }`}>
              {percentage.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">{target.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricGridProps {
  children: React.ReactNode;
}

export const MetricGrid: React.FC<MetricGridProps> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {children}
  </div>
);

// Předkonfigurované KPI karty pro VMQ aplikaci
export const EfficiencyKPI: React.FC<{ value: number; change?: { value: number; type: 'increase' | 'decrease'; period: string } }> = ({ value, change }) => (
  <KPICard
    title="Efektivita výroby"
    value={`${value.toFixed(1)}%`}
    change={change}
    icon={Target}
    color="green"
    gradient
  />
);

export const WasteKPI: React.FC<{ value: number; change?: { value: number; type: 'increase' | 'decrease'; period: string } }> = ({ value, change }) => (
  <KPICard
    title="Podíl odpadu"
    value={`${value.toFixed(1)}%`}
    change={change}
    icon={AlertTriangle}
    color="red"
  />
);

export const ProductionKPI: React.FC<{ value: number; change?: { value: number; type: 'increase' | 'decrease'; period: string } }> = ({ value, change }) => (
  <KPICard
    title="Celková výroba"
    value={`${(value / 1000).toFixed(1)}K kg`}
    change={change}
    icon={Activity}
    color="blue"
    gradient
  />
);

export const InventoryKPI: React.FC<{ value: number; change?: { value: number; type: 'increase' | 'decrease'; period: string } }> = ({ value, change }) => (
  <KPICard
    title="Skladové zásoby"
    value={`${value.toLocaleString()} kg`}
    change={change}
    icon={Package}
    color="purple"
  />
);

export const ProductionTargetKPI: React.FC<{ current: number; target: number }> = ({ current, target }) => (
  <ProgressKPICard
    title="Plnění plánu"
    current={current}
    target={target}
    unit="kg"
    icon={BarChart3}
    color="blue"
  />
);

export const CostEfficiencyKPI: React.FC<{ value: number; change?: { value: number; type: 'increase' | 'decrease'; period: string } }> = ({ value, change }) => (
  <KPICard
    title="Nákladová efektivita"
    value={`${value.toFixed(2)} Kč/kg`}
    change={change}
    icon={DollarSign}
    color="indigo"
    gradient
  />
);