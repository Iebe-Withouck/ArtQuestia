// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Map commonly used SF Symbol-like names to MaterialIcons names.
// Add more entries here when you need additional mappings.
const MAPPING: Record<string, ComponentProps<typeof MaterialIcons>['name']> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'gearshape.fill': 'settings',
  'star.fill': 'star',
  'globe.fill': 'public',
  'camera.fill': 'photo-camera',
};

/**
 * IconSymbol: renders a Material icon. The `name` prop accepts any string but will
 * map common SF-symbol-like names to Material icons. Unknown names fall back to
 * 'help-outline' to avoid runtime errors.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  const materialName = MAPPING[name] ?? 'help-outline';
  return <MaterialIcons color={color} size={size} name={materialName} style={style} />;
}