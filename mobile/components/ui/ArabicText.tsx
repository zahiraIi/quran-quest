/**
 * Arabic text component with proper RTL support and styling.
 */

import React from 'react';
import { Text, StyleSheet, TextStyle, I18nManager } from 'react-native';

import { colors, typography } from '@/theme';

type ArabicTextSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface ArabicTextProps {
  children: string;
  size?: ArabicTextSize;
  color?: string;
  uthmani?: boolean; // Use Uthmani script font
  selectable?: boolean;
  numberOfLines?: number;
  style?: TextStyle;
}

export function ArabicText({
  children,
  size = 'md',
  color = colors.textArabic,
  uthmani = false,
  selectable = false,
  numberOfLines,
  style,
}: ArabicTextProps) {
  const fontSize = getSizeValue(size);
  const fontFamily = uthmani ? typography.fonts.uthmani : typography.fonts.arabic;

  return (
    <Text
      style={[
        styles.base,
        {
          fontSize,
          color,
          fontFamily,
          lineHeight: fontSize * typography.lineHeights.arabic,
        },
        style,
      ]}
      selectable={selectable}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

function getSizeValue(size: ArabicTextSize): number {
  switch (size) {
    case 'sm':
      return typography.sizes.arabicSm;
    case 'md':
      return typography.sizes.arabicMd;
    case 'lg':
      return typography.sizes.arabicLg;
    case 'xl':
      return typography.sizes.arabicXl;
    case 'xxl':
      return typography.sizes.arabicXxl;
    default:
      return typography.sizes.arabicMd;
  }
}

const styles = StyleSheet.create({
  base: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});

