'use client';

import React from 'react';
import { playClickSound } from '../lib/utils';

interface ClickableButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const ClickableButton: React.FC<ClickableButtonProps> = ({
  onClick,
  children,
  className = '',
}) => {
  // Add click sound to the button
  const handleClickWithSound = () => {
    playClickSound();
    if (onClick) onClick();
  };
  
  return (
    <button
      onClick={handleClickWithSound}
      className={`px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}; 