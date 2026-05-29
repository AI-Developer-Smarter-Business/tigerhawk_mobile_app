import type { QueryClient } from '@tanstack/react-query';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

import { subscribeDriverLoadsRealtime } from '../driver-loads-subscription';

jest.mock('../sync-realtime-auth', () => ({
  syncSupabaseRealtimeAuth: jest.fn(() => Promise.resolve(true)),
}));

function createMockChannel() {
  let statusHandler: ((status: string) => void) | undefined;
  const channel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn((cb: (status: string) => void) => {
      statusHandler = cb;
      return channel;
    }),
  } as unknown as RealtimeChannel & { _emit: (status: string) => void };

  (channel as RealtimeChannel & { _emit: (status: string) => void })._emit = (
    status: string,
  ) => {
    statusHandler?.(status);
  };

  return channel as RealtimeChannel & { _emit: (status: string) => void };
}

describe('subscribeDriverLoadsRealtime', () => {
  it('does not call removeChannel from subscribe callback on CLOSED (stack overflow guard)', async () => {
    const mockChannel = createMockChannel();
    const removeChannel = jest.fn(() => Promise.resolve('ok'));
    const supabase = {
      channel: jest.fn(() => mockChannel),
      removeChannel,
    } as unknown as SupabaseClient;

    subscribeDriverLoadsRealtime(supabase, {} as QueryClient, 'driver-uuid');
    await Promise.resolve();
    await Promise.resolve();

    mockChannel._emit('CLOSED');
    expect(removeChannel).not.toHaveBeenCalled();
  });

  it('calls removeChannel once on unsubscribe while channel is active', async () => {
    const mockChannel = createMockChannel();
    const removeChannel = jest.fn(() => Promise.resolve('ok'));
    const supabase = {
      channel: jest.fn(() => mockChannel),
      removeChannel,
    } as unknown as SupabaseClient;

    const { unsubscribe } = subscribeDriverLoadsRealtime(
      supabase,
      {} as QueryClient,
      'driver-uuid',
    );
    await Promise.resolve();
    await Promise.resolve();

    unsubscribe();
    expect(removeChannel).toHaveBeenCalledTimes(1);
  });
});
