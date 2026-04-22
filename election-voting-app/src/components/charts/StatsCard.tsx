import React from 'react';
import { IconType } from 'react-icons';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconType;
  color: 'green' | 'orange' | 'pink' | 'purple';
  percentage?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  percentage,
}) => {
  const colorClasses = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-4xl font-bold text-gray-800 mb-2">{value}</h3>
          {subtitle && (
            <p className="text-gray-600 text-sm">{subtitle}</p>
          )}
          {percentage !== undefined && (
            <p className="text-green-600 text-sm font-medium mt-2">
              {percentage}%
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-4 rounded-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
};