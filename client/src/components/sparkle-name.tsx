import React from "react";

export type SparkleEffectType = 'green' | 'black' | 'pink' | 'red' | 'white' | 'yellow';

export interface SparkleEffect {
  enabled: boolean;
  type: SparkleEffectType;
}

export interface SparkleNameProps {
  displayName: string;
  effect?: SparkleEffect;
  className?: string;
}

const SPARKLE_EFFECTS: Record<SparkleEffectType, string> = {
  green: 'https://assets.guns.lol/sparkle_green.gif',
  black: 'https://assets.guns.lol/sparkle_black.gif',
  pink: 'https://assets.guns.lol/sparkle_pink.gif',
  red: 'https://assets.guns.lol/sparkle_red.gif',
  white: 'https://assets.guns.lol/sparkle_white.gif',
  yellow: 'https://assets.guns.lol/sparkle_yellow.gif'
};

export const AVAILABLE_EFFECTS = Object.keys(SPARKLE_EFFECTS) as SparkleEffectType[];

export const SparkleName: React.FC<SparkleNameProps> = ({ displayName, effect, className = '' }) => {
  if (!effect?.enabled) {
    return <span className={`text-4xl font-bold ${className}`}>{displayName}</span>;
  }

  return (
    <div className="relative inline-block">
      <span className={`text-4xl font-bold ${className}`}>{displayName}</span>
      <img
        src={SPARKLE_EFFECTS[effect.type]}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ mixBlendMode: 'lighten', opacity: 0.8 }}
      />
    </div>
  );
};

export default SparkleName;