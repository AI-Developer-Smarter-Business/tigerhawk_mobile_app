import type { LoadMessage } from '@/types';

export const MOCK_MESSAGES: LoadMessage[] = [
  {
    id: 'msg-1',
    load_id: 'load-1001',
    sender_name: 'Dispatch',
    sender_role: 'dispatcher',
    body: 'Ventana de recogida confirmada. Prioridad alta.',
    created_at: '2026-05-18T11:00:00.000Z',
  },
  {
    id: 'msg-2',
    load_id: 'load-1001',
    sender_name: 'Juan Pérez',
    sender_role: 'driver',
    body: 'En camino al puerto, ETA 25 min.',
    created_at: '2026-05-18T11:15:00.000Z',
  },
];

export function getMockMessagesForLoad(loadId: string): LoadMessage[] {
  return MOCK_MESSAGES.filter((m) => m.load_id === loadId);
}
