/**
 * Visual tokens — TigerHawk brand (orange #E8700A) on **light** surfaces for driver daytime use.
 * Client confirmed (18 jun 2026): light theme, not full TMS dark chrome.
 * Reference: TMS dispatcher content areas (white/gray), not sidebar-only dark.
 */
export const PP2Theme = {
  colors: {
    /** Legacy mobile primary (links, outline buttons). */
    primary: '#0B3D6E',
    primaryDark: '#082847',
    secondary: '#E8A317',
    background: '#F4F6F8',
    surface: '#FFFFFF',
    text: '#1A2332',
    textMuted: '#5C6B7A',
    border: '#D8DEE6',
    success: '#15803D',
    warning: '#CA8A04',
    error: '#DC2626',
    onPrimary: '#FFFFFF',
    errorSurface: '#FEE2E2',
    errorBorder: '#FECACA',
    hotSurface: '#FEF3C7',
    hotBorder: '#FCD34D',
    hotText: '#B45309',
    overlay: 'rgba(17,24,39,0.4)',
    /** TigerHawk brand accent (TMS orange) + light chrome for nav, headers, drawer */
    tms: {
      pageBackground: '#F4F6F8',
      sidebarBackground: '#FFFFFF',
      sidebarBorder: '#E5E7EB',
      navItem: '#6B7280',
      navItemHover: '#374151',
      navActive: '#E8700A',
      /** Text on orange active pill / accent buttons */
      navActiveText: '#FFFFFF',
      /** Titles on light headers and chrome screens */
      headerText: '#1A2332',
      headerBackground: '#FFFFFF',
      headerBorder: '#E5E7EB',
      cardBackground: '#FFFFFF',
      inputBackground: '#FFFFFF',
      inputBorder: '#D8DEE6',
      pressOverlay: 'rgba(17,24,39,0.06)',
      logoPlateBackground: '#FFFFFF',
      logoPlateBorder: '#E5E7EB',
    },
    /** Light-surface accent derived from TMS orange */
    accentMuted: 'rgba(232,112,10,0.12)',
    accentStrip: '#E8700A',
  },
  shadow: {
    sm: {
      shadowColor: '#1A2332',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#1A2332',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 6,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      caption: 12,
      subhead: 14,
      body: 16,
      title: 20,
      headline: 28,
    },
  },
  layout: {
    drawerWidthPercent: 0.72,
    drawerMaxWidth: 300,
    /** WCAG 2.5.5 — minimum touch target (dp). */
    minTouchTarget: 48,
  },
  accessibility: {
    minTouchTarget: 48,
    minTouchTargetSmall: 44,
  },
} as const;
