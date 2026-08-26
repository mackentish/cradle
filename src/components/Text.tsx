import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

import { textStyles } from '@/theme';

type Variant = keyof typeof textStyles;

export type AppTextProps = Readonly<
  TextProps & {
    variant?: Variant;
    color?: string;
    center?: boolean;
  }
>;

/** Every bit of text in the app goes through here, so the fonts stay consistent. */
export function Text({
  variant = 'body',
  color,
  center,
  style,
  ...rest
}: AppTextProps) {
  return (
    <RNText
      {...rest}
      style={[
        textStyles[variant],
        color ? { color } : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
    />
  );
}
