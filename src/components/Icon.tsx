import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

export type IconName = 'bloom' | 'bars' | 'person';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  /** Tab bar icons fill when active and outline when not. */
  active?: boolean;
};

/**
 * Hand-rolled in SVG rather than pulling in an icon font — there are only three
 * of them, and they can then share the app's palette exactly.
 */
export function Icon({ name, size = 24, color = colors.textFaint, active = false }: IconProps) {
  const stroke = color;
  const fill = active ? color : 'none';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'bloom' ? (
        <>
          {[0, 45, 90, 135].map((angle) => (
            <Ellipse
              key={angle}
              cx={12}
              cy={12}
              rx={3.2}
              ry={7.4}
              transform={`rotate(${angle} 12 12)`}
              stroke={stroke}
              strokeWidth={1.5}
              fill={active ? color : 'none'}
              opacity={active ? 0.32 : 1}
            />
          ))}
          <Circle cx={12} cy={12} r={2.2} fill={stroke} />
        </>
      ) : null}

      {name === 'bars' ? (
        <>
          <Rect x={3.5} y={13} width={4} height={7.5} rx={2} stroke={stroke} strokeWidth={1.5} fill={fill} />
          <Rect x={10} y={8} width={4} height={12.5} rx={2} stroke={stroke} strokeWidth={1.5} fill={fill} />
          <Rect x={16.5} y={4} width={4} height={16.5} rx={2} stroke={stroke} strokeWidth={1.5} fill={fill} />
        </>
      ) : null}

      {name === 'person' ? (
        <>
          <Circle cx={12} cy={8} r={3.6} stroke={stroke} strokeWidth={1.5} fill={fill} />
          <Path
            d="M4.8 20.2c0-3.9 3.2-6.2 7.2-6.2s7.2 2.3 7.2 6.2"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : null}
    </Svg>
  );
}
