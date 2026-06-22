import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PP2Theme } from '@/constants/theme';

const tms = PP2Theme.colors.tms;

export type ScreenVariant = 'default' | 'chrome';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  /** `chrome` = light TigerHawk chrome (login, account). `default` = light content area. */
  variant?: ScreenVariant;
};

export function Screen({
  children,
  scroll = false,
  style,
  variant = 'default',
}: ScreenProps) {
  const safeStyle = variant === 'chrome' ? styles.safeChrome : styles.safe;
  const contentStyle = variant === 'chrome' ? styles.contentChrome : styles.content;
  const scrollStyle =
    variant === 'chrome' ? styles.scrollContentChrome : styles.scrollContent;

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[scrollStyle, style]}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[contentStyle, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={safeStyle} edges={['top', 'left', 'right']}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PP2Theme.colors.background,
  },
  safeChrome: {
    flex: 1,
    backgroundColor: tms.pageBackground,
  },
  content: {
    flex: 1,
    padding: PP2Theme.spacing.md,
  },
  contentChrome: {
    flex: 1,
    padding: PP2Theme.spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    padding: PP2Theme.spacing.md,
  },
  scrollContentChrome: {
    flexGrow: 1,
    padding: PP2Theme.spacing.md,
  },
});
