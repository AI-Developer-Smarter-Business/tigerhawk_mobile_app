/**
 * Heuristic: Supabase email login vs TMS username login (A.2 bridge).
 * Email fallback stays until TMS_fusion ships POST /api/mobile/auth/login.
 */
export function isEmailLoginIdentifier(identifier: string): boolean {
  return identifier.trim().includes('@');
}
