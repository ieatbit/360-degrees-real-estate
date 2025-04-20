'use client'

import React, { ReactNode } from 'react';
import Link from 'next/link';

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  compact?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  href,
  variant = 'outline',
  className = '',
  compact = false
}) => {
  const buttonClasses = 
    variant === 'primary' 
      ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-transparent'
      : variant === 'secondary'
        ? 'bg-navy-600 hover:bg-navy-700 text-white border-transparent'
        : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 hover:text-emerald-700';

  const sizeClasses = compact 
    ? 'px-2 py-1 text-xs' 
    : 'px-4 py-2 text-sm';

  const commonClasses = `flex items-center gap-1 rounded-md border transition-colors ${buttonClasses} ${sizeClasses} ${className}`;

  // If href is provided, render as a Link
  if (href) {
    return (
      <Link href={href} className={commonClasses}>
        <span>{icon}</span>
        <span className="font-medium">{label}</span>
      </Link>
    );
  }

  // Otherwise render as a button
  return (
    <button
      onClick={onClick}
      className={commonClasses}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default ActionButton; 