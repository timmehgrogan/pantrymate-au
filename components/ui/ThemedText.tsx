import { Text, TextProps, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

type TextType = 'default' | 'title' | 'subtitle' | 'link' | 'defaultSemiBold';

interface ThemedTextProps extends TextProps {
  type?: TextType;
}

export function ThemedText({ style, type = 'default', ...rest }: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Text
      style={[
        { color: theme.text },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && [styles.link, { color: theme.tint }],
        type === 'defaultSemiBold' && styles.defaultSemiBold,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 24 },
  defaultSemiBold: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  subtitle: { fontSize: 20, fontWeight: '600' },
  link: { fontSize: 16, lineHeight: 30 },
});
