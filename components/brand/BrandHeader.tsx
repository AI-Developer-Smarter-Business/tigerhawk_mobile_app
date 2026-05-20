import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { brandLogo } from '@/constants/brand';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';

const tms = PP2Theme.colors.tms;

const VARIANTS = {
  login: { logoWidth: 168, showTitles: true, titleSize: PP2Theme.typography.sizes.title },
  drawer: { logoWidth: 136, showTitles: true, titleSize: 18 },
  bootstrap: { logoWidth: 124, showTitles: false, titleSize: 0 },
} as const;

export type BrandHeaderVariant = keyof typeof VARIANTS;

type BrandHeaderProps = {
  variant?: BrandHeaderVariant;
  style?: ViewStyle;
};

/** Centered logo above app name — aligned with TigerHawk TMS login / sidebar. */
export function BrandHeader({ variant = 'login', style }: BrandHeaderProps) {
  const config = VARIANTS[variant];
  const logoHeight = config.logoWidth * 1.12;

  return (
    <View
      style={[styles.root, style]}
      accessibilityRole="header"
      accessibilityLabel={strings.app.name}>
      <View style={styles.logoPlate}>
        <Image
          source={brandLogo}
          style={{ width: config.logoWidth, height: logoHeight }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      {config.showTitles ? (
        <View style={styles.titles}>
          <Text style={[styles.title, { fontSize: config.titleSize }]}>
            {strings.app.name}
          </Text>
          <Text style={styles.tagline}>{strings.app.tagline}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  logoPlate: {
    padding: PP2Theme.spacing.sm,
    borderRadius: PP2Theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: PP2Theme.spacing.md,
  },
  titles: {
    alignItems: 'center',
    gap: PP2Theme.spacing.xs,
  },
  title: {
    fontWeight: '700',
    color: tms.navActiveText,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: PP2Theme.typography.sizes.body,
    color: tms.navItem,
    textAlign: 'center',
  },
});
