import React from 'react';
import { LiturgicalColor } from '@/generated/prisma/client';

interface LiturgicalBadgeProps {
  color?: LiturgicalColor | null;
  label: string;
}

export function LiturgicalBadge({ color, label }: LiturgicalBadgeProps) {
  // Correction 12: Controlled mapping from LiturgicalColor enum to CSS class names
  const getColorClass = (c?: LiturgicalColor | null): string => {
    switch (c) {
      case LiturgicalColor.GREEN:
        return 'badge-liturgical-green';
      case LiturgicalColor.VIOLET:
        return 'badge-liturgical-violet';
      case LiturgicalColor.WHITE:
        return 'badge-liturgical-white';
      case LiturgicalColor.RED:
        return 'badge-liturgical-red';
      case LiturgicalColor.ROSE:
        return 'badge-liturgical-rose';
      case LiturgicalColor.BLACK:
        return 'badge-liturgical-black';
      default:
        return 'badge-liturgical-white';
    }
  };

  const colorClass = getColorClass(color);

  return (
    <span className={`badge-liturgical ${colorClass}`}>
      <span aria-hidden="true" style={{ fontSize: '0.625rem' }}>
        ●
      </span>
      <span>{label}</span>
    </span>
  );
}
