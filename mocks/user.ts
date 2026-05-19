import type { DriverProfile } from '@/types';

export const MOCK_DRIVER: DriverProfile = {
  id: 'drv-mock-001',
  email: 'driver@tigerhawk.demo',
  full_name: 'Juan Pérez',
  role: 'driver',
  phone: '+1 713 555 0100',
};

/** Credenciales demo para maquetado (sin Supabase Auth). */
export const MOCK_LOGIN = {
  email: MOCK_DRIVER.email,
  password: 'demo123',
} as const;
