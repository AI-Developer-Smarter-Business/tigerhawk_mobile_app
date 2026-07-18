/** Driver identity returned by `POST /api/mobile/auth/login` (no env dependency). */
export type MobileDriverIdentity = {
  id: string;
  name: string;
  username: string;
};
