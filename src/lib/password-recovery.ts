import { supabase } from '@/integrations/supabase/client';

const recoveryKey = 'password-recovery';

export function rememberRecoveryUser(userId: string) {
  sessionStorage.setItem(recoveryKey, userId);
}

export function clearRecoveryUser() {
  sessionStorage.removeItem(recoveryKey);
}

export async function requestPasswordRecovery(email: string, origin: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updateRecoveredPassword(password: string) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || sessionStorage.getItem(recoveryKey) !== data.user.id) {
    throw new Error('Open a valid recovery link from your email first.');
  }
  const result = await supabase.auth.updateUser({ password });
  if (result.error) throw result.error;
  clearRecoveryUser();
}