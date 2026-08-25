import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { palette } from '@/theme';

/**
 * The app mark: a bowl cradling a soft round shape. It's the pelvis, and it's a
 * cradle — which is the whole idea of the app in one drawing.
 *
 * Both arcs use sweep-flag 0 so they bow downward (SVG's y axis points down).
 */
export function CradleMark({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={48} fill={palette.blush100} />
      <Circle cx={50} cy={37} r={12} fill={palette.blush300} />
      <Path
        d="M22 42 A28 28 0 0 0 78 42"
        stroke={palette.blush500}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M36 45 A14 14 0 0 0 64 45"
        stroke={palette.sage500}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
      />
    </Svg>
  );
}
