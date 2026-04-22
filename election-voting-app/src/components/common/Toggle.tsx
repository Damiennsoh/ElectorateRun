import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div className="flex items-start justify-between py-4">
      <div className="flex-1">
        {label && (
          <label className="text-sm font-semibold text-gray-800 block mb-1">
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-green-500' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};