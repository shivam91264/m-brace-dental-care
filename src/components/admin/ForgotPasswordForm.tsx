import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordRecovery, verifyRecoveryCode } from '@/lib/password-recovery';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function sendCode() {
    setBusy(true); setError(''); setMessage('');
    try {
      await requestPasswordRecovery(email, window.location.origin);
      setCode(''); setSent(true); setCooldown(60);
      setMessage('If an account exists, a recovery email has been requested. Check your inbox and spam folder.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request a code. Please try again.');
    } finally { setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sent) { await sendCode(); return; }
    setBusy(true); setError('');
    try {
      await verifyRecoveryCode(email, code);
      await navigate({ to: '/reset-password' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code. Request a new code.');
    } finally { setBusy(false); }
  }
  return <section className="container-page max-w-lg py-14">
    <h1 className="text-3xl">Forgot password</h1>
    {message && <p role="status" className="mt-5 rounded-lg bg-accent p-4 text-accent-foreground">{message}</p>}
    {error && <p role="alert" className="mt-5 text-destructive">{error}</p>}
    <form onSubmit={submit} className="mt-6 space-y-5">
      <div><Label htmlFor="recovery-email">Email</Label><Input id="recovery-email" type="email" autoComplete="email" required value={email} disabled={sent || busy} onChange={event => setEmail(event.target.value)} /></div>
      {sent && <div><Label htmlFor="recovery-code">Email code</Label><Input id="recovery-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))} /></div>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? 'Please wait…' : sent ? 'Verify code' : 'Send code'}</Button>
      {sent && <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" disabled={busy || cooldown > 0} onClick={sendCode}>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}</Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => { setSent(false); setCode(''); setError(''); setMessage(''); }}>Change email</Button>
      </div>}
    </form>
    <div className="mt-6 text-sm text-primary"><Link to="/auth">Back to sign in</Link></div>
  </section>;
}