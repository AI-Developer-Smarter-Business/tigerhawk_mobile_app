/** Fila de `user_profiles` usada por la app móvil. */
export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  phone: string | null;
};

export type UserRole =
  | 'admin'
  | 'dispatcher'
  | 'accounting'
  | 'driver'
  | 'customer'
  | string;
