import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ resetPasswordForEmail: vi.fn(), getUser: vi.fn(), updateUser: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: mocks } }));
import { rememberRecoveryUser, requestPasswordRecovery, updateRecoveredPassword } from '@/lib/password-recovery';

describe('Admin password recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin' } }, error: null });
    mocks.updateUser.mockResolvedValue({ error: null });
  });

  it('requests reset email for the new admin address with the public reset destination', async () => {
    await requestPasswordRecovery('robo6oy01@gmail.com', 'https://clinic.example');
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith('robo6oy01@gmail.com', { redirectTo: 'https://clinic.example/reset-password' });
  });

  it('reports a rejected email request instead of showing success', async () => {
    mocks.resetPasswordForEmail.mockResolvedValue({ error: new Error('Request rejected') });
    await expect(requestPasswordRecovery('robo6oy01@gmail.com', 'https://clinic.example')).rejects.toThrow('Request rejected');
  });

  it('requires recovery belonging to the verified account', async () => {
    rememberRecoveryUser('different-account');
    await expect(updateRecoveredPassword('test-recovery-value')).rejects.toThrow('valid recovery link');
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it('updates without a current password and consumes the recovery grant', async () => {
    rememberRecoveryUser('admin');
    await updateRecoveredPassword('test-recovery-value');
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'test-recovery-value' });
    expect(sessionStorage.getItem('password-recovery')).toBeNull();
    await expect(updateRecoveredPassword('test-recovery-value')).rejects.toThrow('valid recovery link');
  });
});