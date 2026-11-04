import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { accountQuery } from '@/lib/account';
import { updateRecoveredPassword } from '@/lib/password-recovery';
import { ForgotPasswordForm } from '@/components/admin/ForgotPasswordForm';
export function AuthForm({mode}:{mode:'login'|'register'|'forgot'|'reset'}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const account=useQuery({...accountQuery,enabled:mode==='login'}),q=useQueryClient(),navigate=useNavigate();
 const setup=useQuery({queryKey:['setup-available'],enabled:mode==='login'&&!!account.data&&account.data.profile?.status!=='approved',queryFn:async()=>{const {data,error}=await supabase.rpc('setup_available');if(error)return false;return Boolean(data);}});
 async function claimSetup(){setBusy(true);try{const {error}=await supabase.rpc('claim_first_super_admin');if(error)throw error;await q.invalidateQueries({queryKey:['account']});toast.success('You are now the Super Admin.');navigate({to:'/admin'});}catch(err){toast.error(err instanceof Error?err.message:'Setup failed');}finally{setBusy(false);}}
 async function signOut(){await q.cancelQueries();q.clear();await supabase.auth.signOut();navigate({to:'/auth',replace:true});}
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const d=new FormData(e.currentTarget);const email=String(d.get('email')??'').trim(),password=String(d.get('password')??'');
 if((mode==='register'||mode==='reset')&&password!==d.get('confirm')){toast.error('Passwords do not match');return;}
 setBusy(true);try{
 if(mode==='login'){const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;await q.invalidateQueries({queryKey:['account']});const a=await q.fetchQuery(accountQuery);if(a?.profile?.status==='approved'&&a.roles.length)navigate({to:'/admin'});else setMessage('Your account is awaiting approval. Please contact the clinic owner.');}
 if(mode==='register'){const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:String(d.get('name')??'')},emailRedirectTo:window.location.origin+'/auth'}});if(error)throw error;setMessage('Check your email to confirm your account. Staff access requires approval from the clinic owner.');}
 if(mode==='reset'){await updateRecoveredPassword(password);setMessage('Password updated. You can now sign in.');}
 }catch(err){toast.error(err instanceof Error?err.message:'Unable to continue. Please try again.');}finally{setBusy(false);}}
 const title={login:'Staff sign in',register:'Request staff access',forgot:'Forgot password',reset:'Set a new password'}[mode];
 if(mode==='forgot') return <ForgotPasswordForm />;
 return <section className="container-page max-w-lg py-14"><h1 className="text-3xl">{title}</h1>{message&&<p role="status" className="mt-5 rounded-lg bg-accent p-4 text-accent-foreground">{message}</p>}
 {mode==='login'&&account.data?<div className="mt-6 space-y-4"><p>{account.data.profile?.full_name} · {account.data.profile?.status}</p>{account.data.profile?.status==='approved'&&account.data.roles.length>0&&<Button asChild><Link to="/admin">Open dashboard</Link></Button>}{setup.data&&<div className="rounded-lg border border-border bg-card p-4"><p className="text-sm text-muted-foreground">No Super Admin exists yet. As the first staff account, you can claim this role once.</p><Button className="mt-3" onClick={claimSetup} disabled={busy}>{busy?'Setting up…':'Become the Super Admin'}</Button></div>}<Button variant="outline" onClick={signOut}>Sign out</Button></div>:<form onSubmit={submit} className="mt-6 space-y-5">
 {mode==='register'&&<div><Label htmlFor="name">Full name</Label><Input id="name" name="name" required maxLength={120} autoComplete="name" /></div>}
 {mode!=='reset'&&<div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>}
 <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" minLength={8} required autoComplete={mode==='login'?'current-password':'new-password'} /></div>
 {(mode==='register'||mode==='reset')&&<div><Label htmlFor="confirm">Confirm password</Label><Input id="confirm" name="confirm" type="password" minLength={8} required autoComplete="new-password" /></div>}
 <Button disabled={busy} type="submit" className="w-full">{busy?'Please wait…':mode==='login'?'Sign in':mode==='register'?'Register':'Update password'}</Button></form>}
 <div className="mt-6 flex flex-wrap gap-4 text-sm text-primary"><Link to="/auth">Sign in</Link><Link to="/register">Register</Link><Link to="/forgot-password">Forgot password?</Link></div></section>;
}
