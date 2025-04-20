import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {label}
    </span>
  );
};

export default Badge; 