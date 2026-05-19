export type LoadMessage = {
  id: string;
  load_id: string;
  sender_name: string;
  sender_role: 'driver' | 'dispatcher';
  body: string;
  created_at: string;
};
