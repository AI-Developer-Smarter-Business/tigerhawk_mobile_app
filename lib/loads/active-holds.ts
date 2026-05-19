/** Deriva holds activos desde columnas de `loads` (alineado al TMS). */
export function getActiveHoldKeysFromLoad(row: {
  freight_hold?: string | null;
  customs_hold?: string | null;
  terminal_hold?: string | null;
  fees_hold?: string | null;
  other_hold?: string | null;
  carrier_hold?: boolean | null;
}): string[] {
  const keys: string[] = [];
  if (row.freight_hold === 'hold') keys.push('freight_hold');
  if (row.customs_hold === 'hold') keys.push('customs_hold');
  if (row.terminal_hold === 'hold') keys.push('terminal_hold');
  if (row.fees_hold === 'hold') keys.push('fees_hold');
  if (row.other_hold === 'hold') keys.push('other_hold');
  if (row.carrier_hold === true) keys.push('carrier_hold');
  return keys;
}

const HOLD_LABELS: Record<string, string> = {
  freight_hold: 'Freight',
  customs_hold: 'Customs',
  terminal_hold: 'Terminal',
  fees_hold: 'Fees',
  other_hold: 'Other',
  carrier_hold: 'Carrier',
};

export function formatHoldLabel(holdKey: string): string {
  return HOLD_LABELS[holdKey] ?? holdKey.replace(/_/g, ' ');
}
