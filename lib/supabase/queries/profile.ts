import type { SupabaseClient } from '@supabase/supabase-js';

import type { UserProfile } from '@/types/profile';

export type ProfileQueryResult = {
  profile: UserProfile | null;
  errorMessage: string | null;
};

const PROFILE_COLUMNS = 'id, role, full_name, email';

export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileQueryResult> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return { profile: null, errorMessage: error.message };
  }

  if (!data) {
    return { profile: null, errorMessage: 'Profile not found in user_profiles.' };
  }

  return {
    profile: {
      id: data.id,
      role: data.role,
      full_name: data.full_name,
      email: data.email,
      phone: null,
    },
    errorMessage: null,
  };
}
