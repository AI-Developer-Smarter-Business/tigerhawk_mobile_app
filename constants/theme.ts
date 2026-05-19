/**
 * Visual tokens — aligned to TigerHawk TMS (`PROYECTO_MUESTRA/components/layout/DashboardLayout.tsx`).
 * Reference layout: `nav_lateral.png` (repo root).
 */
export const PP2Theme = {
  colors: {
    /** Legacy mobile primary (headers); prefer TMS sidebar tokens for nav. */
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
    overlay: 'rgba(0,0,0,0.6)',
    /** TMS dashboard / sidebar (read-only reference) */
    tms: {
      pageBackground: '#0B1120',
      sidebarBackground: '#111827',
      sidebarBorder: 'rgba(255,255,255,0.05)',
      navItem: '#9CA3AF',
      navItemHover: '#E5E7EB',
      navActive: '#E8700A',
      navActiveText: '#FFFFFF',
      headerBackground: '#111827',
      headerBorder: 'rgba(255,255,255,0.05)',
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
      body: 16,
      title: 20,
      headline: 28,
    },
  },
  layout: {
    drawerWidthPercent: 0.72,
    drawerMaxWidth: 300,
  },
} as const;
