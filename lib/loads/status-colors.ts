import { PP2Theme } from '@/constants/theme';
import type { LoadStatus } from '@/types';

/** Status badge pill colors — aligned to TMS `LOAD_STATUS_COLORS` semantics. */
export type LoadStatusColorTokens = {
  background: string;
  text: string;
  border: string;
};

const tmsOrange = PP2Theme.colors.tms.navActive;

const LOAD_STATUS_COLORS: Record<LoadStatus, LoadStatusColorTokens> = {
  Assigned: {
    background: '#EFF6FF',
    text: '#1D4ED8',
    border: '#93C5FD',
  },
  Dispatched: {
    background: '#F5F3FF',
    text: '#6D28D9',
    border: '#C4B5FD',
  },
  'In Transit': {
    background: PP2Theme.colors.accentMuted,
    text: '#C2410C',
    border: '#FDBA74',
  },
  'Arrived At Pickup': {
    background: '#ECFEFF',
    text: '#0E7490',
    border: '#67E8F9',
  },
  'Arrived At Delivery': {
    background: '#EEF2FF',
    text: '#4338CA',
    border: '#A5B4FC',
  },
  'Arrived At Return Empty': {
    background: '#F5F3FF',
    text: '#7C3AED',
    border: '#C4B5FD',
  },
  'Arrived To Hook Container': {
    background: '#ECFEFF',
    text: '#0E7490',
    border: '#67E8F9',
  },
  'At Warehouse': {
    background: '#FEFCE8',
    text: '#A16207',
    border: '#FDE047',
  },
  'Dropped - Empty': {
    background: '#F1F5F9',
    text: '#475569',
    border: '#CBD5E1',
  },
  'Dropped - Loaded': {
    background: '#E0F2FE',
    text: '#0369A1',
    border: '#7DD3FC',
  },
  'Enroute To Drop Container': {
    background: PP2Theme.colors.accentMuted,
    text: '#C2410C',
    border: '#FDBA74',
  },
  'Enroute To Return Empty': {
    background: '#FFF7ED',
    text: '#C2410C',
    border: '#FDBA74',
  },
  Delivered: {
    background: '#D1FAE5',
    text: PP2Theme.colors.success,
    border: '#6EE7B7',
  },
  Completed: {
    background: '#DCFCE7',
    text: '#15803D',
    border: '#86EFAC',
  },
  Cancelled: {
    background: PP2Theme.colors.errorSurface,
    text: PP2Theme.colors.error,
    border: PP2Theme.colors.errorBorder,
  },
};

const DEFAULT_STATUS_COLORS: LoadStatusColorTokens = {
  background: '#F1F5F9',
  text: PP2Theme.colors.textMuted,
  border: PP2Theme.colors.border,
};

export function getLoadStatusColors(status: LoadStatus): LoadStatusColorTokens {
  return LOAD_STATUS_COLORS[status] ?? DEFAULT_STATUS_COLORS;
}

export const STATUS_ACCENT_ORANGE = tmsOrange;
