import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// One verified account read shared by the sign-in gate, staff guard and shell.
// The local session only supplies the user id so profile, roles and the
// server-side user verification can run in parallel; access still depends on
// the verified user and database row-level security.
export const accountQuery = queryOptions({
  queryKey: ['account'],
  queryFn: async () => {
    const { data: s } = await supabase.auth.getSession();
    const id = s.session?.user.id;
    if (!id) return null;
    const [u, p, r] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', id),
    ]);
    const user = u.data.user;
    if (u.error || !user || user.id !== id) return null;
    if (p.error) throw p.error;
    if (r.error) throw r.error;
    return { user, profile: p.data, roles: (r.data ?? []).map((x) => x.role) };
  },
  staleTime: 60_000,
});
